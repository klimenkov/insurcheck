import express from 'express';
import { db } from '../db.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';

export const insurersRouter = express.Router();
export const reviewsRouter = express.Router();
export const discussionsRouter = express.Router();

function formatInsurer(row) {
  if (!row) return null;
  const copy = { ...row };
  try {
    if (typeof copy.editorial_scores_breakdown === 'string') {
      copy.editorial_scores_breakdown = JSON.parse(copy.editorial_scores_breakdown);
    }
  } catch (e) {
    copy.editorial_scores_breakdown = null;
  }
  try {
    if (typeof copy.key_strengths === 'string') {
      copy.key_strengths = JSON.parse(copy.key_strengths);
    }
  } catch (e) {
    copy.key_strengths = [];
  }
  try {
    if (typeof copy.key_limitations === 'string') {
      copy.key_limitations = JSON.parse(copy.key_limitations);
    }
  } catch (e) {
    copy.key_limitations = [];
  }
  try {
    if (typeof copy.claims_procedure_summary === 'string') {
      copy.claims_procedure_summary = JSON.parse(copy.claims_procedure_summary);
    }
  } catch (e) {
    copy.claims_procedure_summary = null;
  }
  return copy;
}

// GET /api/insurers - directory listing with sorting
insurersRouter.get('/', (req, res) => {
  try {
    const { sort = 'revenue' } = req.query;

    let orderByClause;
    switch (sort) {
      case 'name':
        orderByClause = 'is_residual_market ASC, name ASC';
        break;
      case 'reviews':
        orderByClause = 'is_residual_market ASC, total_reviews DESC, COALESCE(overall_rating, 0) DESC, name ASC';
        break;
      case 'rating':
        orderByClause = 'is_residual_market ASC, CASE WHEN overall_rating IS NULL THEN 1 ELSE 0 END, overall_rating DESC, total_reviews DESC, name ASC';
        break;
      case 'revenue':
      default:
        orderByClause = 'is_residual_market ASC, CASE WHEN fy2025_revenue_cad IS NULL THEN 1 ELSE 0 END, fy2025_revenue_cad DESC, name ASC';
        break;
    }

    const insurers = db.prepare(`SELECT * FROM insurers ORDER BY ${orderByClause}`).all();
    const formatted = insurers.map(formatInsurer);
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Error fetching insurers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/insurers/:id - single insurer details with reviews and discussions
insurersRouter.get('/:id', (req, res) => {
  try {
    let { id } = req.params;
    if (id === 'facility-association') id = 'facility';
    const isNum = /^\d+$/.test(id);
    const insurer = isNum
      ? db.prepare('SELECT * FROM insurers WHERE id = ?').get(id)
      : db.prepare('SELECT * FROM insurers WHERE slug = ? OR id = ?').get(id, id);

    if (!insurer) {
      return res.status(404).json({ success: false, error: 'Insurer not found' });
    }

    const reviews = db.prepare(`
      SELECT * FROM reviews 
      WHERE insurer_id = ? AND (status = 'published' OR status IS NULL)
      ORDER BY created_at DESC, id DESC
    `).all(insurer.id);

    const discussions = db.prepare(`
      SELECT * FROM insurer_discussions
      WHERE insurer_id = ? AND status = 'published'
      ORDER BY created_at DESC, id DESC
    `).all(insurer.id);

    for (const d of discussions) {
      d.replies = db.prepare(`
        SELECT * FROM discussion_replies
        WHERE discussion_id = ? AND status = 'published'
        ORDER BY created_at ASC, id ASC
      `).all(d.id);
    }

    res.json({
      success: true,
      data: {
        insurer: formatInsurer(insurer),
        reviews,
        discussions
      }
    });
  } catch (err) {
    console.error('Error fetching insurer profile:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/insurers/:id/reviews
insurersRouter.get('/:id/reviews', (req, res) => {
  try {
    let { id } = req.params;
    if (id === 'facility-association') id = 'facility';
    const isNum = /^\d+$/.test(id);
    const insurer = isNum
      ? db.prepare('SELECT id FROM insurers WHERE id = ?').get(id)
      : db.prepare('SELECT id FROM insurers WHERE slug = ? OR id = ?').get(id, id);

    if (!insurer) {
      return res.status(404).json({ success: false, error: 'Insurer not found' });
    }

    const reviews = db.prepare(`
      SELECT * FROM reviews 
      WHERE insurer_id = ? AND (status = 'published' OR status IS NULL)
      ORDER BY created_at DESC, id DESC
    `).all(insurer.id);

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/insurers/:id/reviews (supports voluntary ratings, un-defaulted claims)
insurersRouter.post('/:id/reviews', (req, res) => {
  try {
    const { id } = req.params;
    const isNum = /^\d+$/.test(id);
    const insurer = isNum
      ? db.prepare('SELECT * FROM insurers WHERE id = ?').get(id)
      : db.prepare('SELECT * FROM insurers WHERE slug = ? OR id = ?').get(id, id);

    if (!insurer) {
      return res.status(404).json({ success: false, error: 'Insurer not found' });
    }

    const {
      rating,
      overall_rating,
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
      monthly_premium,
      author_name,
      author_display_name,
      author_email
    } = req.body;

    const rawOverall = parseFloat(rating !== undefined ? rating : overall_rating);
    if (isNaN(rawOverall) || rawOverall < 1 || rawOverall > 5) {
      return res.status(400).json({ success: false, error: 'Valid overall rating between 1 and 5 is required.' });
    }
    const finalOverall = Math.round(rawOverall * 10) / 10;

    const parseVoluntaryRating = (val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed)) return null;
      return Math.max(1, Math.min(5, Math.round(parsed * 10) / 10));
    };

    const valRating = parseVoluntaryRating(rating_value);
    const supportRating = parseVoluntaryRating(rating_support);
    const renewalRating = parseVoluntaryRating(rating_renewal);
    const easeRating = parseVoluntaryRating(rating_ease);

    const hadAccidentBool = had_accident === 1 || had_accident === true || had_accident === 'true' || had_accident === '1';
    const claimsRating = hadAccidentBool ? parseVoluntaryRating(rating_claims) : null;

    const authorDisplayName = (author_name || author_display_name || '').trim().slice(0, 50) || 'Ontario Driver';
    const emailStr = author_email && String(author_email).trim().length > 0 ? String(author_email).trim() : null;
    const isVerifiedCustomer = emailStr ? 1 : 0;

    const dateStr = new Date().toISOString();
    const finalTitle = title ? String(title).trim().slice(0, 150) : (body ? 'Ontario Driver Review' : 'Verified Rating');
    const finalBody = body ? String(body).trim().slice(0, 3000) : '';
    const finalCity = author_city ? String(author_city).trim().slice(0, 60) : 'Ontario';
    const finalVehicle = vehicle ? String(vehicle).trim().slice(0, 60) : 'Passenger Vehicle';
    const finalPremium = parseInt(monthly_premium, 10) || 0;

    const stmt = db.prepare(`
      INSERT INTO reviews (
        insurer_id, created_at, rating, rating_value, rating_claims, rating_support, rating_renewal, rating_ease,
        title, body, had_accident, claims_experience, payout_speed, author_city, vehicle, monthly_premium,
        author_name, author_display_name, display_name, author_email, user_email, is_verified_customer, is_verified_email, status, helpful_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 0)
    `);

    const result = stmt.run(
      insurer.id,
      dateStr,
      finalOverall,
      valRating,
      claimsRating,
      supportRating,
      renewalRating,
      easeRating,
      finalTitle,
      finalBody,
      hadAccidentBool ? 1 : 0,
      hadAccidentBool && claims_experience ? String(claims_experience).trim().slice(0, 100) : null,
      hadAccidentBool && payout_speed ? String(payout_speed).trim().slice(0, 50) : null,
      finalCity,
      finalVehicle,
      finalPremium,
      authorDisplayName,
      authorDisplayName,
      authorDisplayName,
      emailStr,
      emailStr,
      isVerifiedCustomer,
      isVerifiedCustomer
    );

    sendToGoogleSheets('review', {
      id: result.lastInsertRowid,
      insurer_id: insurer.id,
      created_at: dateStr,
      rating: finalOverall,
      rating_value: valRating,
      rating_claims: claimsRating,
      rating_support: supportRating,
      rating_renewal: renewalRating,
      rating_ease: easeRating,
      title: finalTitle,
      body: finalBody,
      had_accident: hadAccidentBool ? 1 : 0,
      author_city: finalCity,
      vehicle: finalVehicle,
      monthly_premium: finalPremium,
      author_name: authorDisplayName
    }, `${finalOverall}★ review for ${insurer.name}: "${finalTitle}" (${finalCity})`).catch(() => {});

    // Recalculate true published statistics
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
      WHERE insurer_id = ? AND (status = 'published' OR status IS NULL)
    `).get(insurer.id);

    const round1 = (val) => val != null ? Math.round(val * 10) / 10 : null;
    const safeClaimsRating = round1(stats?.avg_claims) || insurer.claims_rating || 4.0;
    const safeSupportRating = round1(stats?.avg_support) || insurer.support_rating || 4.0;

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
      stats ? stats.total : 0,
      stats && stats.total > 0 ? round1(stats.avg_overall) : null,
      round1(stats?.avg_value),
      round1(stats?.avg_claims),
      round1(stats?.avg_support),
      round1(stats?.avg_renewal),
      round1(stats?.avg_ease),
      safeClaimsRating,
      safeSupportRating,
      insurer.id
    );

    const updatedInsurer = db.prepare('SELECT * FROM insurers WHERE id = ?').get(insurer.id);
    const reviews = db.prepare(`
      SELECT * FROM reviews 
      WHERE insurer_id = ? AND (status = 'published' OR status IS NULL) 
      ORDER BY created_at DESC, id DESC
    `).all(insurer.id);

    res.json({
      success: true,
      data: {
        review_id: result.lastInsertRowid,
        insurer: formatInsurer(updatedInsurer),
        reviews
      }
    });
  } catch (err) {
    console.error('Review submit error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/insurers/:id/discussions
insurersRouter.get('/:id/discussions', (req, res) => {
  try {
    const { id } = req.params;
    const isNum = /^\d+$/.test(id);
    const insurer = isNum
      ? db.prepare('SELECT id FROM insurers WHERE id = ?').get(id)
      : db.prepare('SELECT id FROM insurers WHERE slug = ? OR id = ?').get(id, id);

    if (!insurer) {
      return res.status(404).json({ success: false, error: 'Insurer not found' });
    }

    const discussions = db.prepare(`
      SELECT * FROM insurer_discussions
      WHERE insurer_id = ? AND status = 'published'
      ORDER BY created_at DESC, id DESC
    `).all(insurer.id);

    for (const d of discussions) {
      d.replies = db.prepare(`
        SELECT * FROM discussion_replies
        WHERE discussion_id = ? AND status = 'published'
        ORDER BY created_at ASC, id ASC
      `).all(d.id);
    }

    res.json({ success: true, data: discussions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/insurers/:id/discussions
insurersRouter.post('/:id/discussions', (req, res) => {
  try {
    let { id } = req.params;
    if (id === 'facility-association') id = 'facility';
    const isNum = /^\d+$/.test(id);
    const insurer = isNum
      ? db.prepare('SELECT * FROM insurers WHERE id = ?').get(id)
      : db.prepare('SELECT * FROM insurers WHERE slug = ? OR id = ?').get(id, id);

    if (!insurer) {
      return res.status(404).json({ success: false, error: 'Insurer not found' });
    }

    const { question_title, title, question_body, body, author_name, display_name, author_email, user_email, category } = req.body;
    const finalTitle = (question_title || title || '').trim().slice(0, 200);
    if (!finalTitle) {
      return res.status(400).json({ success: false, error: 'Question title is required' });
    }

    const authorDisplayName = (author_name || display_name || '').trim().slice(0, 50) || 'Ontario Driver';
    const emailStr = (author_email || user_email || '').trim() || null;
    const dateStr = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO insurer_discussions (
        insurer_id, created_at, user_email, author_email, display_name, author_name, title, body, helpful_count, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'published')
    `);

    const result = stmt.run(
      insurer.id,
      dateStr,
      emailStr || 'driver@community.insurcheck.ca',
      emailStr,
      authorDisplayName,
      authorDisplayName,
      finalTitle,
      (question_body || body || '').trim().slice(0, 3000)
    );

    const newDisc = db.prepare('SELECT * FROM insurer_discussions WHERE id = ?').get(result.lastInsertRowid);
    newDisc.replies = [];

    res.json({ success: true, data: newDisc });
  } catch (err) {
    console.error('Discussion create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/discussions/:id/replies (or /api/insurers/discussions/:id/replies)
const handleDiscussionReply = (req, res) => {
  try {
    const { id } = req.params;
    const { reply_body, body, author_name, display_name, author_email, user_email, is_verified_customer } = req.body;
    const finalBody = (reply_body || body || '').trim();

    if (!finalBody) {
      return res.status(400).json({ success: false, error: 'Reply text is required' });
    }

    const discussion = db.prepare('SELECT * FROM insurer_discussions WHERE id = ?').get(id);
    if (!discussion) {
      return res.status(404).json({ success: false, error: 'Discussion topic not found' });
    }

    const authorDisplayName = (author_name || display_name || '').trim().slice(0, 50) || 'Ontario Driver';
    const emailStr = (author_email || user_email || '').trim() || null;
    const dateStr = new Date().toISOString();
    const verified = is_verified_customer === 1 || is_verified_customer === true || Boolean(emailStr);

    const stmt = db.prepare(`
      INSERT INTO discussion_replies (
        discussion_id, created_at, user_email, author_email, display_name, author_name, body, is_staff, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `);

    const result = stmt.run(
      id,
      dateStr,
      emailStr || 'driver@community.insurcheck.ca',
      emailStr,
      authorDisplayName,
      authorDisplayName,
      finalBody.slice(0, 3000),
      verified ? 1 : 0
    );

    const newReply = db.prepare('SELECT * FROM discussion_replies WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, data: newReply });
  } catch (err) {
    console.error('Discussion reply error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

insurersRouter.post('/discussions/:id/replies', handleDiscussionReply);
discussionsRouter.post('/:id/replies', handleDiscussionReply);

// POST /api/reviews/:id/vote (or /api/insurers/reviews/:id/vote)
const handleReviewVote = (req, res) => {
  try {
    const { id } = req.params;
    const { is_helpful = true, voter_hash, voter_key } = req.body;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const hash = voter_key || voter_hash || req.ip || 'anonymous';
    const dateStr = new Date().toISOString();

    const existingVote = db.prepare(`
      SELECT * FROM review_votes 
      WHERE target_type = 'review' AND target_id = ? AND voter_key = ?
    `).get(id, hash);

    if (!existingVote) {
      db.prepare(`
        INSERT INTO review_votes (target_type, target_id, voter_key, created_at)
        VALUES ('review', ?, ?, ?)
      `).run(id, hash, dateStr);

      db.prepare('UPDATE reviews SET helpful_count = COALESCE(helpful_count, 0) + 1 WHERE id = ?').run(id);
    }

    const updatedReview = db.prepare('SELECT helpful_count FROM reviews WHERE id = ?').get(id);
    res.json({ success: true, data: { review_id: Number(id), helpful_count: updatedReview ? updatedReview.helpful_count : 1 } });
  } catch (err) {
    console.error('Review vote error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

insurersRouter.post('/reviews/:id/vote', handleReviewVote);
reviewsRouter.post('/:id/vote', handleReviewVote);
