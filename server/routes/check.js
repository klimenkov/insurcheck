import express from 'express';
import { evaluateInsurance } from '../engine/model.js';
import { db } from '../db.js';
import { normalizeInsurerName, validateMonthlyPremium } from '../engine/normalizer.js';

import { FSA_RISK_MAP } from '../engine/ontarioData.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';

export const checkRouter = express.Router();

checkRouter.post('/', (req, res) => {
  try {
    const isEstimating = Boolean(req.body.isEstimating || req.body.noCurrentInsurance);

    if (!isEstimating) {
      const check = validateMonthlyPremium(req.body.currentPremium);
      if (!check.valid) {
        return res.status(400).json({ success: false, error: check.error });
      }
      req.body.currentPremium = check.sanitized;
    }

    if (req.body.insuranceCompany) {
      req.body.insuranceCompany = normalizeInsurerName(req.body.insuranceCompany);
    }

    const result = evaluateInsurance(req.body);

    // Update check count stat atomically with fallback
    db.prepare(`
      INSERT INTO platform_stats (key, value) VALUES ('total_checks_run', 1)
      ON CONFLICT(key) DO UPDATE SET value = value + 1
    `).run();

    // Log check event for immutable audit trail
    try {
      db.prepare(`
        INSERT INTO check_events (created_at, fsa, vehicle, is_estimating)
        VALUES (?, ?, ?, ?)
      `).run(
        new Date().toISOString(),
        (req.body.postalCode || '').trim().replace(/\s+/g, '').toUpperCase().slice(0, 3) || 'UNK',
        `${req.body.vehicleYear || ''} ${req.body.vehicleMake || ''} ${req.body.vehicleModel || ''}`.trim() || 'Vehicle',
        isEstimating ? 1 : 0
      );
    } catch (auditErr) {
      console.warn('Check event audit log skipped:', auditErr.message);
    }

    // Automatically record rate in the public community database only if user explicitly consented
    if (!isEstimating && req.body.shareAnonymously === true && req.body.currentPremium) {
      try {
        const cleanPostal = (req.body.postalCode || '').trim().replace(/\s+/g, '').toUpperCase();
        const fsa = cleanPostal.slice(0, 3);
        const location = FSA_RISK_MAP[fsa] || { city: 'Ontario' };
        const age = parseInt(req.body.driverAge, 10) || 30;
        const profile = age < 25 ? 'young' : (age >= 65 ? 'senior' : 'experienced');
        const cleanRec = req.body.cleanRecord !== false ? 1 : 0;
        const cov = req.body.coverageLevel === 'comprehensive'
          ? 'Full'
          : (req.body.coverageLevel === 'liability' ? 'Liability' : 'Standard');
        const make = req.body.vehicleMake || 'Standard';
        const model = req.body.vehicleModel || 'Vehicle';
        const year = parseInt(req.body.vehicleYear, 10) || 2022;
        const provider = req.body.insuranceCompany || 'Ontario Carrier';
        const yearsLic = parseInt(req.body.yearsLicensed, 10) || (age > 25 ? 8 : 2);
        const dateStr = new Date().toISOString().split('T')[0];

        const discountsJson = JSON.stringify(result.discounts || []);
        const discountStatus = result.discountStatus || 'legacy_unknown';
        const otherDesc = result.otherDiscountDescription || null;
        const estBefore = result.normalization?.estimatedBeforeDiscounts ?? null;
        const normStatus = result.normalization?.normalizationStatus || 'legacy_assumed_base';
        const calcVersion = result.normalization?.calculationVersion || null;
        const factorsJson = result.normalization?.appliedFactors ? JSON.stringify(result.normalization.appliedFactors) : null;

        const insertSub = db.prepare(`
          INSERT INTO submissions (
            created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year,
            driver_age, driver_profile, years_licensed, clean_record,
            provider_name, monthly_premium, coverage_type, comment,
            discounts, discount_status, other_discount_description,
            estimated_premium_before_discounts, normalization_status,
            calculation_version, applied_discount_factors
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const subRes = insertSub.run(
          dateStr, fsa, location.city, make, model, year,
          age, profile, yearsLic, cleanRec,
          provider, req.body.currentPremium, cov, 'Submitted via Sanity Check',
          discountsJson, discountStatus, otherDesc,
          estBefore, normStatus, calcVersion, factorsJson
        );

        // Send to Google Sheets webhook with discount context
        const discountListStr = (result.discounts && result.discounts.length > 0)
          ? result.discounts.join(', ')
          : (discountStatus === 'none_reported' ? 'None' : (discountStatus === 'unsure' ? 'Unsure' : 'None'));

        sendToGoogleSheets('submission', {
          id: subRes.lastInsertRowid,
          created_at: dateStr,
          fsa,
          city: location.city,
          vehicle_make: make,
          vehicle_model: model,
          vehicle_year: year,
          driver_age: age,
          driver_profile: profile,
          years_licensed: yearsLic,
          clean_record: cleanRec,
          provider_name: provider,
          monthly_premium: req.body.currentPremium,
          coverage_type: cov,
          discounts: result.discounts || [],
          discount_status: discountStatus,
          estimated_before_discounts: estBefore,
          normalization_status: normStatus,
          comment: `Sanity Check (Discounts: ${discountListStr})`
        }, `${year} ${make} ${model} in ${fsa} (${location.city}) - $${req.body.currentPremium}/mo (${provider}) [Discounts: ${discountListStr}]`).catch(() => {});
      } catch (subErr) {
        console.warn('Could not insert submission from check:', subErr.message);
      }
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error evaluating insurance:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
