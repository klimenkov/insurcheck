import express from 'express';
import { db } from '../db.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';

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
    const result = stmt.run(
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

    sendToGoogleSheets('feedback', {
      id: result.lastInsertRowid,
      created_at: dateStr,
      rating: parseInt(rating, 10),
      is_reasonable: isReasonable || null,
      matches_knowledge: matchesKnowledge || null,
      trust_comment: trustComment || null,
      postal_code: postalCode || null,
      vehicle: vehicle || null,
      benchmark_rate: benchmarkRate || null,
      current_premium: currentPremium || null
    }, `Benchmark feedback: ${rating}★ from ${postalCode || 'Ontario'}`).catch(() => {});

    res.json({ success: true, message: 'Thank you! Your feedback helps calibrate our Ontario insurance benchmark model.' });
  } catch (err) {
    console.error('Error saving feedback:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
