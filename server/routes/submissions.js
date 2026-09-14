import express from 'express';
import { db } from '../db.js';
import { FSA_RISK_MAP } from '../engine/ontarioData.js';

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
    res.json({ success: true, data: rows });
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
      comment
    } = req.body;

    const fsa = (postalCode || '').trim().toUpperCase().slice(0, 3);
    const location = FSA_RISK_MAP[fsa] || { city: 'Ontario' };

    const stmt = db.prepare(`
      INSERT INTO submissions (
        created_at, fsa, city, vehicle_make, vehicle_model, vehicle_year,
        driver_age, driver_profile, years_licensed, clean_record,
        provider_name, monthly_premium, coverage_type, comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dateStr = new Date().toISOString().split('T')[0];
    const age = parseInt(driverAge, 10) || 30;
    const profile = age < 25 ? 'young' : (age >= 65 ? 'senior' : 'experienced');

    stmt.run(
      dateStr, fsa, location.city, vehicleMake, vehicleModel, parseInt(vehicleYear, 10) || 2022,
      age, profile, parseInt(yearsLicensed, 10) || 5, cleanRecord ? 1 : 0,
      providerName, parseInt(monthlyPremium, 10), coverageType || 'Standard', comment || ''
    );

    res.json({ success: true, message: 'Rate submitted successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
