import express from 'express';
import { db } from '../db.js';

export const feedbackRouter = express.Router();

feedbackRouter.post('/', (req, res) => {
  try {
    const {
      rating,
      isReasonable,
      matchesKnowledge,
      useBeforeRenew,
      useBeforeBuy,
      trustComment,
      postalCode,
      vehicle,
      benchmarkRate,
      currentPremium
    } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating between 1 and 5 is required.' });
    }

    const stmt = db.prepare(`
      INSERT INTO benchmark_feedback (
        created_at, rating, is_reasonable, matches_knowledge, use_before_renew,
        use_before_buy, trust_comment, postal_code, vehicle, benchmark_rate, current_premium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dateStr = new Date().toISOString();
    stmt.run(
      dateStr,
      parseInt(rating, 10),
      isReasonable || null,
      matchesKnowledge || null,
      useBeforeRenew || null,
      useBeforeBuy || null,
      trustComment ? String(trustComment).trim().slice(0, 1000) : null,
      postalCode ? String(postalCode).trim().slice(0, 10) : null,
      vehicle ? String(vehicle).trim().slice(0, 100) : null,
      benchmarkRate ? parseInt(benchmarkRate, 10) : null,
      currentPremium ? parseInt(currentPremium, 10) : null
    );

    res.json({ success: true, message: 'Thank you! Your feedback helps calibrate our Ontario insurance benchmark model.' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
