import express from 'express';
import { evaluateInsurance } from '../engine/model.js';
import { db } from '../db.js';
import { normalizeInsurerName, validateMonthlyPremium } from '../engine/normalizer.js';

import { FSA_RISK_MAP } from '../engine/ontarioData.js';

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

    // Update check count stat
    db.prepare("UPDATE platform_stats SET value = value + 1 WHERE key = 'total_checks_run'").run();

    if (result.monthlySavings > 0) {
      db.prepare("UPDATE platform_stats SET value = value + ? WHERE key = 'total_money_saved'").run(result.annualSavings);
    }

    // Automatically record rate in the public community database if user opted to share
    if (!isEstimating && req.body.shareAnonymously !== false && req.body.currentPremium) {
      try {
        const fsa = (req.body.postalCode || '').trim().toUpperCase().slice(0, 3);
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

        const insertSub = db.prepare(`
          INSERT INTO submissions (
            created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year,
            driver_age, driver_profile, years_licensed, clean_record,
            provider_name, monthly_premium, coverage_type, comment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertSub.run(
          dateStr, fsa, location.city, make, model, year,
          age, profile, yearsLic, cleanRec,
          provider, req.body.currentPremium, cov, 'Submitted via Sanity Check'
        );
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
