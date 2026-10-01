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
    const savings = parseInt(estimatedSavings, 10) || 0;
    stmt.run(dateStr, name, email, phone, vehicle || '', postalCode || '', parseInt(currentPremium, 10) || 0, savings);

    if (savings > 0) {
      db.prepare("UPDATE platform_stats SET value = value + ? WHERE key = 'total_money_saved'").run(savings);
    }

    res.json({ success: true, message: 'Request received. A licensed Ontario broker will contact you with matched quotes.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Pre-launch broker matching waitlist (INS-61)
leadsRouter.post('/waitlist', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const dateStr = new Date().toISOString();

    const existing = db.prepare('SELECT id FROM broker_launch_waitlist WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'You are already registered on the launch waitlist.'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO broker_launch_waitlist (created_at, email)
      VALUES (?, ?)
    `);
    stmt.run(dateStr, normalizedEmail);

    res.json({
      success: true,
      message: "You're on the list. We'll email you when broker matching becomes available."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
