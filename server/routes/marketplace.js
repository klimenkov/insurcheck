import express from 'express';
import { db } from '../db.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';
import '../seedMarketplace.js';

export const marketplaceRouter = express.Router();

/**
 * 1. POST /api/marketplace/leads
 * Driver submits a request to connect with a licensed Ontario broker.
 */
marketplaceRouter.post('/leads', (req, res) => {
  try {
    const {
      postalCode,
      city,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      driverAge,
      yearsLicensed,
      cleanRecord,
      coverageType,
      currentPremium,
      benchmarkRate,
      estimatedSavings,
      renewalTimeline,
      discounts,
      contactName,
      contactEmail,
      contactPhone,
      contactPref,
      consentContact
    } = req.body;

    if (!contactName || !contactEmail || !contactPhone) {
      return res.status(400).json({ success: false, error: 'Name, email, and phone number are required.' });
    }

    if (!consentContact) {
      return res.status(400).json({ success: false, error: 'Consent to share details with a licensed broker is required.' });
    }

    if (!postalCode || !vehicleMake || !vehicleModel || !vehicleYear) {
      return res.status(400).json({ success: false, error: 'Vehicle details and postal code are required.' });
    }

    const now = new Date().toISOString();
    const cleanPostal = String(postalCode).toUpperCase().slice(0, 3);
    const cleanSavings = Math.max(0, parseInt(estimatedSavings, 10) || 0);
    const cleanCurrent = currentPremium ? parseInt(currentPremium, 10) : null;
    const cleanBenchmark = parseInt(benchmarkRate, 10) || 200;
    const cleanTimeline = renewalTimeline || 'within_30_days';

    // Nominal lead price tiers based on savings opportunity (INS-65 Section 7)
    let leadPrice = 15;
    if (cleanSavings >= 200) leadPrice = 25;
    else if (cleanSavings >= 100) leadPrice = 20;
    else if (cleanTimeline === 'car_shopping' || !cleanCurrent) leadPrice = 10;

    const stmt = db.prepare(`
      INSERT INTO marketplace_leads (
        created_at, postal_code, city, vehicle_year, vehicle_make, vehicle_model,
        driver_age, years_licensed, clean_record, coverage_type, current_premium,
        benchmark_rate, estimated_savings, renewal_timeline, discounts,
        contact_name, contact_email, contact_phone, contact_pref,
        consent_contact, consent_timestamp, status, lead_price_nominal
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 'available', ?
      )
    `);

    const discountsStr = typeof discounts === 'string' ? discounts : JSON.stringify(discounts || []);

    const result = stmt.run(
      now, cleanPostal, city || 'Ontario', parseInt(vehicleYear, 10), vehicleMake, vehicleModel,
      parseInt(driverAge, 10) || 35, parseInt(yearsLicensed, 10) || 15, cleanRecord ? 1 : 0, coverageType || 'Standard', cleanCurrent,
      cleanBenchmark, cleanSavings, cleanTimeline, discountsStr,
      String(contactName).trim(), String(contactEmail).trim(), String(contactPhone).trim(), contactPref || 'phone',
      1, now, leadPrice
    );

    const leadId = result.lastInsertRowid;

    // Log creation event
    db.prepare(`
      INSERT INTO lead_events (lead_id, actor_type, actor_id, event_type, details, created_at)
      VALUES (?, 'user', 'driver', 'created', 'Driver requested broker match from sanity check', ?)
    `).run(leadId, now);

    // Forward to Google Sheets Webhook asynchronously (non-blocking)
    sendToGoogleSheets('marketplace_lead', {
      leadId,
      reference: `INS-L${String(leadId).padStart(5, '0')}`,
      contactName,
      contactEmail,
      contactPhone,
      city: city || 'Ontario',
      fsa: cleanPostal,
      vehicle: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
      currentPremium: cleanCurrent,
      benchmarkRate: cleanBenchmark,
      estimatedSavings: cleanSavings,
      renewalTimeline: cleanTimeline,
      leadPriceNominal: leadPrice,
      createdAt: now
    }).catch(err => console.warn('Google Sheets webhook notice:', err.message));

    res.status(201).json({
      success: true,
      leadId,
      reference: `INS-L${String(leadId).padStart(5, '0')}`,
      message: 'Your request has been submitted to our broker marketplace.'
    });
  } catch (err) {
    console.error('Marketplace lead creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. GET /api/marketplace/leads/available
 * Broker queries available leads in marketplace (anonymized: contact details strictly masked).
 */
marketplaceRouter.get('/leads/available', (req, res) => {
  try {
    const { city, minSavings, timeline } = req.query;

    let query = `
      SELECT id, created_at, postal_code, city, vehicle_year, vehicle_make, vehicle_model,
             driver_age, years_licensed, clean_record, coverage_type, current_premium,
             benchmark_rate, estimated_savings, renewal_timeline, discounts,
             lead_price_nominal, status
      FROM marketplace_leads
      WHERE status IN ('available', 'backup_queue')
    `;
    const params = [];

    if (city && city !== 'All') {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    if (minSavings && !isNaN(parseInt(minSavings, 10))) {
      query += ' AND estimated_savings >= ?';
      params.push(parseInt(minSavings, 10));
    }

    if (timeline && timeline !== 'all') {
      query += ' AND renewal_timeline = ?';
      params.push(timeline);
    }

    query += ' ORDER BY id DESC LIMIT 50';

    const leads = db.prepare(query).all(...params);

    const sanitized = leads.map(l => {
      let parsedDiscounts = [];
      try {
        parsedDiscounts = typeof l.discounts === 'string' ? JSON.parse(l.discounts) : l.discounts;
      } catch {
        parsedDiscounts = [];
      }
      return {
        ...l,
        discounts: parsedDiscounts,
        is_locked: true,
        contact_name: '🔒 Locked until claimed',
        contact_email: '🔒 Locked until claimed',
        contact_phone: '🔒 Locked until claimed'
      };
    });

    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/marketplace/leads/claimed
 * Broker queries leads claimed by their brokerage (unlocked contact details).
 */
marketplaceRouter.get('/leads/claimed', (req, res) => {
  try {
    const brokerageId = req.headers['x-brokerage-id'] || req.query.brokerageId;
    if (!brokerageId) {
      return res.status(400).json({ success: false, error: 'brokerageId is required' });
    }

    const query = `
      SELECT ml.*, b.name as brokerage_name
      FROM marketplace_leads ml
      LEFT JOIN brokerages b ON ml.claimed_by_brokerage_id = b.id
      WHERE ml.claimed_by_brokerage_id = ?
      ORDER BY ml.claimed_at DESC
    `;

    const leads = db.prepare(query).all(brokerageId);

    const formatted = leads.map(l => {
      let parsedDiscounts = [];
      try {
        parsedDiscounts = typeof l.discounts === 'string' ? JSON.parse(l.discounts) : l.discounts;
      } catch {
        parsedDiscounts = [];
      }
      return {
        ...l,
        discounts: parsedDiscounts,
        is_locked: false
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. POST /api/marketplace/leads/:id/claim
 * Broker claims lead exclusively.
 * Atomic verification ensures lead cannot be double-claimed.
 */
marketplaceRouter.post('/leads/:id/claim', (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { brokerageId, userId } = req.body;

    if (!brokerageId) {
      return res.status(400).json({ success: false, error: 'brokerageId is required to claim a lead.' });
    }

    // Check current lead state
    const currentLead = db.prepare('SELECT * FROM marketplace_leads WHERE id = ?').get(leadId);
    if (!currentLead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    if (currentLead.status !== 'available' && currentLead.status !== 'backup_queue') {
      return res.status(409).json({
        success: false,
        error: `This lead is no longer available (current status: ${currentLead.status}). It has already been assigned.`
      });
    }

    const now = new Date().toISOString();

    // Atomic update
    const updateStmt = db.prepare(`
      UPDATE marketplace_leads
      SET status = 'claimed',
          claimed_by_brokerage_id = ?,
          claimed_by_user_id = ?,
          claimed_at = ?
      WHERE id = ? AND status IN ('available', 'backup_queue')
    `);

    const result = updateStmt.run(brokerageId, userId || null, now, leadId);
    if (result.changes === 0) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: This lead was just claimed by another broker.'
      });
    }

    // Log claim event
    db.prepare(`
      INSERT INTO lead_events (lead_id, actor_type, actor_id, event_type, details, created_at)
      VALUES (?, 'broker', ?, 'claimed', 'Lead claimed and contact details unlocked', ?)
    `).run(leadId, brokerageId, now);

    // Return unlocked lead
    const unlockedLead = db.prepare(`
      SELECT ml.*, b.name as brokerage_name
      FROM marketplace_leads ml
      LEFT JOIN brokerages b ON ml.claimed_by_brokerage_id = b.id
      WHERE ml.id = ?
    `).get(leadId);

    res.json({
      success: true,
      message: 'Lead successfully claimed! Contact details unlocked.',
      data: {
        ...unlockedLead,
        is_locked: false
      }
    });
  } catch (err) {
    console.error('Error claiming lead:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. POST /api/marketplace/leads/:id/status
 * Broker updates status and resolution notes for a claimed lead.
 */
marketplaceRouter.post('/leads/:id/status', (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { status, resolutionNotes, brokerageId } = req.body;

    const validStatuses = ['claimed', 'contacted', 'offer_provided', 'converted', 'closed_no_deal', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const lead = db.prepare('SELECT * FROM marketplace_leads WHERE id = ?').get(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    const now = new Date().toISOString();
    let contactedAt = lead.contacted_at;
    let resolvedAt = lead.resolved_at;

    if (status === 'contacted' && !contactedAt) {
      contactedAt = now;
    }

    if (['converted', 'closed_no_deal', 'cancelled'].includes(status)) {
      resolvedAt = now;
    }

    db.prepare(`
      UPDATE marketplace_leads
      SET status = ?,
          contacted_at = ?,
          resolved_at = ?,
          resolution_status = ?,
          resolution_notes = COALESCE(?, resolution_notes)
      WHERE id = ?
    `).run(status, contactedAt, resolvedAt, status, resolutionNotes || null, leadId);

    db.prepare(`
      INSERT INTO lead_events (lead_id, actor_type, actor_id, event_type, details, created_at)
      VALUES (?, 'broker', ?, 'status_changed', ?, ?)
    `).run(leadId, brokerageId || 'broker', `Status updated to ${status}${resolutionNotes ? ': ' + resolutionNotes : ''}`, now);

    res.json({ success: true, message: `Lead status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. GET /api/marketplace/brokerages
 * Fetch active pilot brokerages.
 */
marketplaceRouter.get('/brokerages', (req, res) => {
  try {
    const brokerages = db.prepare('SELECT * FROM brokerages ORDER BY name ASC').all();
    const formatted = brokerages.map(b => {
      let territories = [];
      try {
        territories = JSON.parse(b.territories);
      } catch {
        territories = ['All Ontario'];
      }
      return { ...b, territories };
    });
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. GET /api/marketplace/stats
 * Key marketplace metrics.
 */
marketplaceRouter.get('/stats', (req, res) => {
  try {
    const totalLeads = db.prepare('SELECT COUNT(*) as cnt FROM marketplace_leads').get().cnt;
    const availableLeads = db.prepare("SELECT COUNT(*) as cnt FROM marketplace_leads WHERE status IN ('available', 'backup_queue')").get().cnt;
    const claimedLeads = db.prepare("SELECT COUNT(*) as cnt FROM marketplace_leads WHERE status NOT IN ('available', 'backup_queue')").get().cnt;
    const convertedLeads = db.prepare("SELECT COUNT(*) as cnt FROM marketplace_leads WHERE status = 'converted'").get().cnt;
    const activeBrokerages = db.prepare("SELECT COUNT(*) as cnt FROM brokerages WHERE status = 'approved'").get().cnt;

    res.json({
      success: true,
      data: {
        totalLeads,
        availableLeads,
        claimedLeads,
        convertedLeads,
        activeBrokerages,
        claimRate: totalLeads > 0 ? Math.round((claimedLeads / totalLeads) * 100) : 0,
        conversionRate: claimedLeads > 0 ? Math.round((convertedLeads / claimedLeads) * 100) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. GET /api/marketplace/admin/leads
 * Full unmasked leads catalog and audit trail for Admin.
 */
marketplaceRouter.get('/admin/leads', (req, res) => {
  try {
    const leads = db.prepare(`
      SELECT ml.*, b.name as brokerage_name
      FROM marketplace_leads ml
      LEFT JOIN brokerages b ON ml.claimed_by_brokerage_id = b.id
      ORDER BY ml.id DESC
    `).all();

    const events = db.prepare('SELECT * FROM lead_events ORDER BY id DESC LIMIT 200').all();

    res.json({
      success: true,
      data: {
        leads,
        events
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 9. POST /api/marketplace/admin/leads/:id/assign
 * Admin manually assigns an unclaimed lead to a brokerage.
 */
marketplaceRouter.post('/admin/leads/:id/assign', (req, res) => {
  try {
    const leadId = parseInt(req.params.id, 10);
    const { brokerageId, notes } = req.body;

    if (!brokerageId) {
      return res.status(400).json({ success: false, error: 'brokerageId is required' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE marketplace_leads
      SET status = 'claimed',
          claimed_by_brokerage_id = ?,
          claimed_at = ?,
          resolution_notes = COALESCE(?, resolution_notes)
      WHERE id = ?
    `).run(brokerageId, now, notes || 'Admin backup queue assignment', leadId);

    db.prepare(`
      INSERT INTO lead_events (lead_id, actor_type, actor_id, event_type, details, created_at)
      VALUES (?, 'admin', 'admin', 'backup_assigned', ?, ?)
    `).run(leadId, `Manually assigned to brokerage ${brokerageId}`, now);

    res.json({ success: true, message: `Lead #${leadId} assigned to ${brokerageId}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
