import express from 'express';
import { db } from '../db.js';

import { evaluateInsurance } from '../engine/model.js';

export const scrapedQuotesRouter = express.Router();

// GET /api/scraped-quotes
scrapedQuotesRouter.get('/', (req, res) => {
  console.log('>>> [DEBUG] GET /api/scraped-quotes called!');
  try {
    const { platform, persona, city } = req.query;
    let query = 'SELECT * FROM scraped_quotes';
    const params = [];

    const conditions = [];
    if (platform && platform !== 'All') {
      conditions.push('source_platform = ?');
      params.push(platform);
    }
    if (persona && persona !== 'All') {
      conditions.push('persona_id = ?');
      params.push(persona);
    }
    if (city && city !== 'All') {
      conditions.push('city LIKE ?');
      params.push(`%${city}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC LIMIT 100';

    const rows = db.prepare(query).all(...params);

    // Enrich with actuarial evaluation against Ontario FSRA model
    const enriched = rows.map((r) => {
      const driverProfile = r.driver_age < 25 ? 'young' : r.driver_age >= 65 ? 'senior' : 'experienced';
      const yearsLicensed = r.driver_age < 25 ? 2 : Math.min(30, r.driver_age - 16);
      
      try {
        const evaluation = evaluateInsurance({
          vehicleMake: r.vehicle_make,
          vehicleModel: r.vehicle_model,
          vehicleYear: r.vehicle_year,
          postalCode: r.fsa,
          driverAge: r.driver_age,
          driverProfile,
          yearsLicensed,
          cleanRecord: !!r.clean_record,
          currentPremium: r.monthly_premium
        });

        const diff = evaluation.currentPremium - evaluation.fairMonthlyStandard;
        const pct = Math.round((diff / evaluation.fairMonthlyStandard) * 100);

        return {
          ...r,
          benchmark_premium: evaluation.fairMonthlyStandard,
          verdict: evaluation.verdict,
          verdict_title: evaluation.verdictTitle,
          verdict_color: evaluation.verdictColor,
          monthly_savings: evaluation.monthlySavings,
          annual_savings: evaluation.annualSavings,
          overpay_ratio: evaluation.overpayRatio,
          delta_monthly: diff,
          delta_percent: pct
        };
      } catch (err) {
        return {
          ...r,
          benchmark_premium: r.monthly_premium,
          verdict: 'FAIR',
          verdict_title: 'Fair Market Price',
          verdict_color: 'text-emerald-400',
          monthly_savings: 0,
          annual_savings: 0,
          overpay_ratio: 1.0,
          delta_monthly: 0,
          delta_percent: 0
        };
      }
    });

    console.log('>>> [DEBUG] Enriched[0]:', JSON.stringify(enriched[0], null, 2));

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scraped-quotes/summary
scrapedQuotesRouter.get('/summary', (req, res) => {
  try {
    const totalCount = db.prepare('SELECT count(*) as count FROM scraped_quotes').get()?.count || 0;
    const byPlatform = db.prepare(`
      SELECT source_platform, count(*) as count, round(avg(monthly_premium), 1) as avg_premium
      FROM scraped_quotes
      GROUP BY source_platform
    `).all();

    const byPersona = db.prepare(`
      SELECT persona_id, persona_label, count(*) as count, round(avg(monthly_premium), 1) as avg_premium
      FROM scraped_quotes
      GROUP BY persona_id
    `).all();

    res.json({
      success: true,
      data: {
        total_scraped_quotes: totalCount,
        by_platform: byPlatform,
        by_persona: byPersona
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/scraped-quotes/trends - Historical price dynamics across monthly snapshots
scrapedQuotesRouter.get('/trends', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM scraped_quotes
      ORDER BY created_at ASC
    `).all();

    if (rows.length === 0) {
      return res.json({ success: true, data: { timeline: [], personas: {}, metrics: {} } });
    }

    // Group by Month Key (YYYY-MM)
    const monthMap = new Map();
    const personaMap = new Map();

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (const r of rows) {
      const dateObj = new Date(r.created_at);
      const year = dateObj.getFullYear();
      const monthIdx = dateObj.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[monthIdx]} ${year}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          key: monthKey,
          label: monthLabel,
          timestamp: r.created_at,
          personas: {}
        });
      }

      let parsedNotes = '';
      if (r.raw_payload) {
        try {
          const parsed = JSON.parse(r.raw_payload);
          parsedNotes = parsed.notes || '';
        } catch {
          // ignore
        }
      }

      const mData = monthMap.get(monthKey);
      mData.personas[r.persona_id] = {
        monthly_premium: r.monthly_premium,
        persona_label: r.persona_label,
        fsa: r.fsa,
        city: r.city,
        notes: parsedNotes
      };

      if (!personaMap.has(r.persona_id)) {
        personaMap.set(r.persona_id, {
          id: r.persona_id,
          label: r.persona_label,
          city: r.city,
          fsa: r.fsa,
          history: []
        });
      }
    }

    // Build ordered timeline
    const timeline = Array.from(monthMap.values());

    // Build persona histories with MoM and total inflation deltas
    for (const p of personaMap.values()) {
      let baselinePremium = null;
      let prevPremium = null;

      for (const m of timeline) {
        const pInMonth = m.personas[p.id];
        if (pInMonth) {
          if (baselinePremium === null) {
            baselinePremium = pInMonth.monthly_premium;
          }

          const totalChangePct = baselinePremium > 0
            ? parseFloat((((pInMonth.monthly_premium - baselinePremium) / baselinePremium) * 100).toFixed(1))
            : 0;

          const momChangePct = prevPremium !== null && prevPremium > 0
            ? parseFloat((((pInMonth.monthly_premium - prevPremium) / prevPremium) * 100).toFixed(1))
            : 0;

          p.history.push({
            month_key: m.key,
            month_label: m.label,
            premium: pInMonth.monthly_premium,
            mom_pct: momChangePct,
            total_change_pct: totalChangePct,
            notes: pInMonth.notes
          });

          prevPremium = pInMonth.monthly_premium;
        }
      }

      if (p.history.length > 1) {
        const start = p.history[0].premium;
        const end = p.history[p.history.length - 1].premium;
        p.overall_change_pct = parseFloat((((end - start) / start) * 100).toFixed(1));
        p.current_premium = end;
        p.starting_premium = start;
      } else {
        p.overall_change_pct = 0;
        p.current_premium = p.history[0]?.premium || 0;
        p.starting_premium = p.current_premium;
      }
    }

    // Calculate quote harvest freshness & cadence
    const latestRow = rows[rows.length - 1];
    const latestDate = new Date(latestRow.created_at);
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - latestDate.getTime());
    const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursAgo = Math.floor(diffMs / (1000 * 60 * 60));

    // Next scheduled monthly harvest (1st of next calendar month)
    const nextHarvest = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 1, 9, 0, 0);

    const personaList = Array.from(personaMap.values());
    const avgInflation = personaList.length > 0
      ? parseFloat((personaList.reduce((acc, p) => acc + (p.overall_change_pct || 0), 0) / personaList.length).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        timeline,
        personas: personaList,
        metrics: {
          total_snapshots: rows.length,
          time_horizon_months: timeline.length,
          avg_market_inflation_pct: avgInflation,
          last_harvest_at: latestRow.created_at,
          harvest_age_days: daysAgo,
          harvest_age_hours: hoursAgo,
          next_scheduled_harvest: nextHarvest.toISOString(),
          harvest_frequency: 'Monthly Batch Cadence (FSRA Rate Filing Alignment)',
          carrier_monitored: 'Square One / TD / Intact'
        }
      }
    });
  } catch (err) {
    console.error('Error in /trends:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

scrapedQuotesRouter.post('/', (req, res) => {
  try {
    const {
      sourcePlatform,
      personaId,
      personaLabel,
      fsa,
      city,
      vehicleYear,
      vehicleMake,
      vehicleModel,
      driverAge,
      licenseClass,
      cleanRecord,
      monthlyPremium,
      coverageType,
      rawPayload
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO scraped_quotes (
        created_at, source_platform, persona_id, persona_label,
        fsa, city, vehicle_year, vehicle_make, vehicle_model,
        driver_age, license_class, clean_record, monthly_premium,
        coverage_type, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const dateStr = new Date().toISOString();

    stmt.run(
      dateStr,
      sourcePlatform || 'Automated Scraper',
      personaId || 'custom_persona',
      personaLabel || 'Standard Persona',
      (fsa || '').toUpperCase(),
      city || 'Ontario',
      parseInt(vehicleYear, 10) || 2022,
      vehicleMake || 'Unknown',
      vehicleModel || 'Unknown',
      parseInt(driverAge, 10) || 30,
      licenseClass || 'G',
      cleanRecord ? 1 : 0,
      parseInt(monthlyPremium, 10) || 0,
      coverageType || 'Standard',
      typeof rawPayload === 'object' ? JSON.stringify(rawPayload) : (rawPayload || '')
    );

    res.json({ success: true, message: 'Scraped quote logged to automated database table.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
