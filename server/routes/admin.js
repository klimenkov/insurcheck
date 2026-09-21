import express from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { normalizeInsurerName } from '../engine/normalizer.js';

export const adminRouter = express.Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'insurcheck2026';
const EXPECTED_TOKEN = crypto.createHash('sha256').update(ADMIN_PASSWORD + ':insurcheck_salt_2026').digest('hex');

// Auth middleware
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required.' });
  }

  const token = authHeader.slice(7).trim();
  if (token !== EXPECTED_TOKEN) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin session token.' });
  }

  next();
}

// Helper to recalculate insurer rating averages after an edit or delete
function recalculateInsurerRatings(insurerId) {
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
  `).get(insurerId);

  if (stats && stats.total > 0) {
    db.prepare(`
      UPDATE insurers
      SET 
        total_reviews = ?,
        overall_rating = ?,
        rating_value = ?,
        rating_claims = ?,
        rating_support = ?,
        rating_renewal = ?,
        rating_ease = ?,
        claims_rating = ?,
        support_rating = ?
      WHERE id = ?
    `).run(
      stats.total,
      Math.round(stats.avg_overall * 10) / 10,
      Math.round((stats.avg_value || 4.0) * 10) / 10,
      Math.round((stats.avg_claims || 4.0) * 10) / 10,
      Math.round((stats.avg_support || 4.0) * 10) / 10,
      Math.round((stats.avg_renewal || 4.0) * 10) / 10,
      Math.round((stats.avg_ease || 4.0) * 10) / 10,
      Math.round((stats.avg_claims || 4.0) * 10) / 10,
      Math.round((stats.avg_support || 4.0) * 10) / 10,
      insurerId
    );
  }
}

// -------------------------------------------------------------
// Public Auth Endpoints
// -------------------------------------------------------------

adminRouter.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password || String(password).trim() !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
    }

    res.json({ success: true, token: EXPECTED_TOKEN });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.get('/verify', requireAdmin, (req, res) => {
  res.json({ success: true, authenticated: true });
});

// -------------------------------------------------------------
// Protected Admin API Endpoints
// -------------------------------------------------------------

// Overview statistics
adminRouter.get('/overview', requireAdmin, (req, res) => {
  try {
    const submissionsCount = db.prepare('SELECT count(*) as c FROM submissions').get()?.c || 0;
    const reviewsCount = db.prepare('SELECT count(*) as c FROM reviews').get()?.c || 0;
    const contactCount = db.prepare('SELECT count(*) as c FROM contact_messages').get()?.c || 0;
    const leadsCount = db.prepare('SELECT count(*) as c FROM leads').get()?.c || 0;

    const stats = db.prepare('SELECT * FROM platform_stats').all();

    res.json({
      success: true,
      data: {
        submissionsCount,
        reviewsCount,
        contactCount,
        leadsCount,
        stats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Submissions
adminRouter.get('/submissions', requireAdmin, (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM submissions';
    const params = [];

    if (search && search.trim()) {
      sql += ' WHERE provider_name LIKE ? OR city LIKE ? OR vehicle_make LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY id DESC LIMIT 100';
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/submissions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { provider_name, monthly_premium, city, comment } = req.body;

    const current = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ success: false, error: 'Submission not found' });

    const updatedProvider = provider_name !== undefined ? normalizeInsurerName(provider_name) : current.provider_name;
    const updatedPremium = monthly_premium !== undefined ? parseInt(monthly_premium, 10) : current.monthly_premium;
    const updatedCity = city !== undefined ? String(city).trim() : current.city;
    const updatedComment = comment !== undefined ? String(comment).trim() : current.comment;

    db.prepare(`
      UPDATE submissions
      SET provider_name = ?, monthly_premium = ?, city = ?, comment = ?
      WHERE id = ?
    `).run(updatedProvider, updatedPremium, updatedCity, updatedComment, id);

    const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/submissions/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
    res.json({ success: true, message: `Submission #${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reviews
adminRouter.get('/reviews', requireAdmin, (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT r.*, i.name as insurer_name
      FROM reviews r
      LEFT JOIN insurers i ON r.insurer_id = i.id
    `;
    const params = [];

    if (search && search.trim()) {
      sql += ' WHERE r.title LIKE ? OR r.body LIKE ? OR r.author_city LIKE ? OR i.name LIKE ?';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY r.id DESC LIMIT 100';
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.patch('/reviews/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, rating_value, rating_claims, rating_support, rating_renewal, rating_ease } = req.body;

    const current = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ success: false, error: 'Review not found' });

    const newTitle = title !== undefined ? String(title).trim() : current.title;
    const newBody = body !== undefined ? String(body).trim() : current.body;
    const val = rating_value !== undefined ? parseFloat(rating_value) : current.rating_value;
    const claims = rating_claims !== undefined ? parseFloat(rating_claims) : current.rating_claims;
    const support = rating_support !== undefined ? parseFloat(rating_support) : current.rating_support;
    const renewal = rating_renewal !== undefined ? parseFloat(rating_renewal) : current.rating_renewal;
    const ease = rating_ease !== undefined ? parseFloat(rating_ease) : current.rating_ease;
    const overall = Math.round(((val + claims + support + renewal + ease) / 5) * 10) / 10;

    db.prepare(`
      UPDATE reviews
      SET title = ?, body = ?, rating_value = ?, rating_claims = ?, rating_support = ?, rating_renewal = ?, rating_ease = ?, rating = ?
      WHERE id = ?
    `).run(newTitle, newBody, val, claims, support, renewal, ease, overall, id);

    recalculateInsurerRatings(current.insurer_id);

    const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/reviews/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const rev = db.prepare('SELECT insurer_id FROM reviews WHERE id = ?').get(id);
    if (rev) {
      db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
      recalculateInsurerRatings(rev.insurer_id);
    }
    res.json({ success: true, message: `Review #${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Contact Messages
adminRouter.get('/contact-messages', requireAdmin, (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 100').all();
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/contact-messages/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    res.json({ success: true, message: `Message #${id} deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
