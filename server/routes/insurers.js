import express from 'express';
import { db } from '../db.js';

export const insurersRouter = express.Router();

insurersRouter.get('/', (req, res) => {
  try {
    const insurers = db.prepare(`
      SELECT * FROM insurers 
      ORDER BY COALESCE(overall_rating, claims_rating, 4.0) DESC
    `).all();
    res.json({ success: true, data: insurers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

insurersRouter.get('/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews WHERE insurer_id = ? ORDER BY id DESC').all(req.params.id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/insurers/:id/reviews (supports rating only or rating + full review)
insurersRouter.post('/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const {
      rating_value,
      rating_claims,
      rating_support,
      rating_renewal,
      rating_ease,
      title,
      body,
      had_accident,
      claims_experience,
      payout_speed,
      author_city,
      vehicle,
      monthly_premium
    } = req.body;

    const valRating = Math.max(1, Math.min(5, parseFloat(rating_value) || 4));
    const claimsRating = Math.max(1, Math.min(5, parseFloat(rating_claims) || 4));
    const supportRating = Math.max(1, Math.min(5, parseFloat(rating_support) || 4));
    const renewalRating = Math.max(1, Math.min(5, parseFloat(rating_renewal) || 4));
    const easeRating = Math.max(1, Math.min(5, parseFloat(rating_ease) || 4));

    const overall = Math.round(((valRating + claimsRating + supportRating + renewalRating + easeRating) / 5) * 10) / 10;

    const stmt = db.prepare(`
      INSERT INTO reviews (
        insurer_id, created_at, rating, rating_value, rating_claims, rating_support, rating_renewal, rating_ease,
        title, body, had_accident, claims_experience, payout_speed, author_city, vehicle, monthly_premium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      new Date().toISOString(),
      overall,
      valRating,
      claimsRating,
      supportRating,
      renewalRating,
      easeRating,
      title ? String(title).trim() : (body ? 'Ontario Driver Review' : 'Rating without comment'),
      body ? String(body).trim() : '',
      had_accident ? 1 : 0,
      claims_experience ? String(claims_experience).trim() : null,
      payout_speed ? String(payout_speed).trim() : null,
      author_city ? String(author_city).trim() : 'Ontario',
      vehicle ? String(vehicle).trim() : 'Passenger Vehicle',
      parseInt(monthly_premium, 10) || 0
    );

    // Recalculate average rating across all 5 dimensions
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_overall,
        AVG(rating_value) as avg_value,
        AVG(rating_claims) as avg_claims,
        AVG(rating_support) as avg_support,
        AVG(rating_renewal) as avg_renewal,
        AVG(rating_ease) as avg_ease
      FROM reviews
      WHERE insurer_id = ?
    `).get(id);

    if (stats && stats.total > 0) {
      const updateStmt = db.prepare(`
        UPDATE insurers
        SET 
          total_reviews = total_reviews + 1,
          overall_rating = ?,
          rating_value = ?,
          rating_claims = ?,
          rating_support = ?,
          rating_renewal = ?,
          rating_ease = ?,
          claims_rating = ?,
          support_rating = ?
        WHERE id = ?
      `);

      updateStmt.run(
        Math.round(stats.avg_overall * 10) / 10,
        Math.round(stats.avg_value * 10) / 10,
        Math.round(stats.avg_claims * 10) / 10,
        Math.round(stats.avg_support * 10) / 10,
        Math.round(stats.avg_renewal * 10) / 10,
        Math.round(stats.avg_ease * 10) / 10,
        Math.round(stats.avg_claims * 10) / 10,
        Math.round(stats.avg_support * 10) / 10,
        id
      );
    }

    const updatedInsurer = db.prepare('SELECT * FROM insurers WHERE id = ?').get(id);
    const reviews = db.prepare('SELECT * FROM reviews WHERE insurer_id = ? ORDER BY id DESC').all(id);

    res.json({ success: true, insurer: updatedInsurer, reviews });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
