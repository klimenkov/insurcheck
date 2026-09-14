import express from 'express';
import { db } from '../db.js';

export const leadsRouter = express.Router();

leadsRouter.post('/', (req, res) => {
  try {
    const { name, email, phone, vehicle, postalCode, currentPremium, estimatedSavings } = req.body;

    const stmt = db.prepare(`
      INSERT INTO leads (created_at, name, email, phone, vehicle, postal_code, current_premium, estimated_savings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dateStr = new Date().toISOString();
    stmt.run(dateStr, name, email, phone, vehicle || '', postalCode || '', parseInt(currentPremium, 10) || 0, parseInt(estimatedSavings, 10) || 0);

    res.json({ success: true, message: 'Request received. A licensed Ontario broker will contact you with matched quotes.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
