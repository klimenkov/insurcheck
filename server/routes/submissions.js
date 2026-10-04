import express from 'express';
import { db } from '../db.js';
import { FSA_RISK_MAP } from '../engine/ontarioData.js';
import { normalizeInsurerName, validateMonthlyPremium } from '../engine/normalizer.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';
import { parseDiscountSelection, normalizeSubmittedPremium } from '../engine/discounts.js';

export const submissionsRouter = express.Router();

submissionsRouter.get('/', (req, res) => {
  try {
    const { city, make } = req.query;
    let query = 'SELECT * FROM submissions';
    const params = [];

    if (city && city !== 'All') {
      query += ' WHERE city LIKE ?';
      params.push(`%${city}%`);
    }

    if (make && make !== 'All') {
      query += params.length ? ' AND vehicle_make = ?' : ' WHERE vehicle_make = ?';
      params.push(make);
    }

    query += ' ORDER BY id DESC LIMIT 50';

    const rows = db.prepare(query).all(...params);
    const sanitizedRows = rows.map(r => {
      let parsedDiscounts = [];
      try {
        if (typeof r.discounts === 'string' && r.discounts) {
          parsedDiscounts = JSON.parse(r.discounts);
        } else if (Array.isArray(r.discounts)) {
          parsedDiscounts = r.discounts;
        }
      } catch {
        parsedDiscounts = [];
      }
      return {
        ...r,
        discounts: parsedDiscounts,
        discount_status: r.discount_status || 'legacy_unknown',
        normalization_status: r.normalization_status || 'legacy_assumed_base'
      };
    });

    res.json({ success: true, data: sanitizedRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

submissionsRouter.post('/', (req, res) => {
  try {
    const {
      postalCode,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      driverAge,
      yearsLicensed,
      cleanRecord,
      providerName,
      monthlyPremium,
      coverageType,
      comment,
      discounts,
      discountStatus,
      otherDiscountDescription
    } = req.body;

    const premiumCheck = validateMonthlyPremium(monthlyPremium);
    if (!premiumCheck.valid) {
      return res.status(400).json({ success: false, error: premiumCheck.error });
    }

    const normalizedProvider = normalizeInsurerName(providerName);
    const validPremium = premiumCheck.sanitized;

    const fsa = (postalCode || '').trim().toUpperCase().slice(0, 3);
    const location = FSA_RISK_MAP[fsa] || { city: 'Ontario' };

    const discountState = parseDiscountSelection(discounts, discountStatus, otherDiscountDescription);
    const norm = normalizeSubmittedPremium(validPremium, discountState);

    const dateStr = new Date().toISOString().split('T')[0];
    const age = parseInt(driverAge, 10) || 30;
    const profile = age < 25 ? 'young' : (age >= 65 ? 'senior' : 'experienced');

    const discountsJson = JSON.stringify(discountState.discounts);
    const factorsJson = norm.appliedFactors ? JSON.stringify(norm.appliedFactors) : null;

    const stmt = db.prepare(`
      INSERT INTO submissions (
        created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year,
        driver_age, driver_profile, years_licensed, clean_record,
        provider_name, monthly_premium, coverage_type, comment,
        discounts, discount_status, other_discount_description,
        estimated_premium_before_discounts, normalization_status,
        calculation_version, applied_discount_factors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      dateStr, fsa, location.city, vehicleMake, vehicleModel, parseInt(vehicleYear, 10) || 2022,
      age, profile, parseInt(yearsLicensed, 10) || 5, cleanRecord ? 1 : 0,
      normalizedProvider, validPremium, coverageType || 'Standard', comment || '',
      discountsJson, discountState.status, discountState.otherDescription,
      norm.estimatedBeforeDiscounts, norm.normalizationStatus,
      norm.calculationVersion, factorsJson
    );

    // Non-blocking append-only backup to Google Sheets
    const discountListStr = (discountState.discounts && discountState.discounts.length > 0)
      ? discountState.discounts.join(', ')
      : (discountState.status === 'none_reported' ? 'None' : (discountState.status === 'unsure' ? 'Unsure' : 'None'));

    sendToGoogleSheets('submission', {
      id: result.lastInsertRowid,
      created_at: dateStr,
      fsa,
      city: location.city,
      vehicle_make: vehicleMake,
      vehicle_model: vehicleModel,
      vehicle_year: parseInt(vehicleYear, 10) || 2022,
      driver_age: age,
      driver_profile: profile,
      years_licensed: parseInt(yearsLicensed, 10) || 5,
      clean_record: cleanRecord ? 1 : 0,
      provider_name: normalizedProvider,
      monthly_premium: validPremium,
      coverage_type: coverageType || 'Standard',
      discounts: discountState.discounts,
      discount_status: discountState.status,
      estimated_before_discounts: norm.estimatedBeforeDiscounts,
      normalization_status: norm.normalizationStatus,
      comment: `${comment || ''}${comment ? ' | ' : ''}Discounts: ${discountListStr}`
    }, `${parseInt(vehicleYear, 10) || 2022} ${vehicleMake} ${vehicleModel} in ${fsa} (${location.city}) - $${validPremium}/mo (${normalizedProvider}) [Discounts: ${discountListStr}]`).catch(() => {});

    res.json({ success: true, message: 'Rate submitted successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
