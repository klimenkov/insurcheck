import express from 'express';
import { FSA_RISK_MAP } from '../engine/ontarioData.js';

export const territoriesRouter = express.Router();

const BASE_ONTARIO_MONTHLY = 175;

function categorizeTier(risk) {
  if (risk > 1.30) {
    return {
      tier: 'Extreme',
      label: 'Extreme Risk Territory',
      badgeColor: 'rose',
      description: 'Historically highest collision frequency, claim severity, and insurance litigation.'
    };
  }
  if (risk >= 1.11) {
    return {
      tier: 'High',
      label: 'High Risk Territory',
      badgeColor: 'amber',
      description: 'Above-average traffic density and higher claim frequency than provincial baseline.'
    };
  }
  if (risk >= 0.90) {
    return {
      tier: 'Moderate',
      label: 'Moderate / Standard Risk',
      badgeColor: 'cyan',
      description: 'Balanced actuarial risk tracking closely to the Ontario provincial median.'
    };
  }
  return {
    tier: 'Low',
    label: 'Low Risk Territory',
    badgeColor: 'emerald',
    description: 'Statistically lowest collision and claims frequency across Ontario.'
  };
}

// GET /api/territories - Full list of FSAs, regional groups, and city rankings
territoriesRouter.get('/', (req, res) => {
  try {
    const { tier, search } = req.query;

    const fsaList = [];
    const cityMap = new Map();

    for (const [fsa, data] of Object.entries(FSA_RISK_MAP)) {
      const tierInfo = categorizeTier(data.risk);
      const estimatedMonthly = Math.round(BASE_ONTARIO_MONTHLY * data.risk);
      const variancePercent = Math.round((data.risk - 1.00) * 100);

      const record = {
        fsa,
        city: data.city,
        label: data.label,
        risk: data.risk,
        estimated_monthly: estimatedMonthly,
        variance_percent: variancePercent,
        tier: tierInfo.tier,
        tier_label: tierInfo.label,
        badge_color: tierInfo.badgeColor,
        tier_description: tierInfo.description
      };

      // Aggregate by city
      const cityKey = data.city;
      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          city: cityKey,
          fsa_count: 0,
          total_risk: 0,
          min_risk: data.risk,
          max_risk: data.risk,
          fsas: []
        });
      }
      const cAgg = cityMap.get(cityKey);
      cAgg.fsa_count += 1;
      cAgg.total_risk += data.risk;
      cAgg.min_risk = Math.min(cAgg.min_risk, data.risk);
      cAgg.max_risk = Math.max(cAgg.max_risk, data.risk);
      cAgg.fsas.push(fsa);

      // Filtering
      if (tier && tier !== 'All' && tierInfo.tier !== tier) {
        continue;
      }
      if (search) {
        const q = search.trim().toLowerCase();
        const matches = fsa.toLowerCase().includes(q) ||
                        data.city.toLowerCase().includes(q) ||
                        data.label.toLowerCase().includes(q);
        if (!matches) continue;
      }

      fsaList.push(record);
    }

    // City ranking leaderboard (sorted from most expensive to cheapest)
    const cityRankings = Array.from(cityMap.values()).map(c => {
      const avgRisk = parseFloat((c.total_risk / c.fsa_count).toFixed(2));
      const avgMonthly = Math.round(BASE_ONTARIO_MONTHLY * avgRisk);
      const tierInfo = categorizeTier(avgRisk);
      const deltaPercent = Math.round((avgRisk - 1.00) * 100);

      return {
        city: c.city,
        fsa_count: c.fsa_count,
        avg_risk: avgRisk,
        min_risk: c.min_risk,
        max_risk: c.max_risk,
        estimated_avg_monthly: avgMonthly,
        delta_percent: deltaPercent,
        tier: tierInfo.tier,
        badge_color: tierInfo.badgeColor,
        fsas: c.fsas
      };
    }).sort((a, b) => b.avg_risk - a.avg_risk);

    // Summary metrics
    const totalCount = Object.keys(FSA_RISK_MAP).length;
    const extremeCount = Object.values(FSA_RISK_MAP).filter(v => v.risk > 1.30).length;
    const highCount = Object.values(FSA_RISK_MAP).filter(v => v.risk >= 1.11 && v.risk <= 1.30).length;
    const moderateCount = Object.values(FSA_RISK_MAP).filter(v => v.risk >= 0.90 && v.risk < 1.11).length;
    const lowCount = Object.values(FSA_RISK_MAP).filter(v => v.risk < 0.90).length;

    res.json({
      success: true,
      count: fsaList.length,
      total_territories: totalCount,
      metrics: {
        total: totalCount,
        extreme: extremeCount,
        high: highCount,
        moderate: moderateCount,
        low: lowCount,
        ontario_base_monthly: BASE_ONTARIO_MONTHLY
      },
      city_rankings: cityRankings,
      data: fsaList
    });
  } catch (error) {
    console.error('Error fetching territories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/territories/:fsa - Individual FSA lookup
territoriesRouter.get('/:fsa', (req, res) => {
  try {
    const rawFsa = req.params.fsa.trim().toUpperCase().slice(0, 3);
    const data = FSA_RISK_MAP[rawFsa];

    if (!data) {
      return res.status(404).json({
        success: false,
        error: `FSA '${rawFsa}' not found in Ontario territorial database.`
      });
    }

    const tierInfo = categorizeTier(data.risk);
    const estimatedMonthly = Math.round(BASE_ONTARIO_MONTHLY * data.risk);
    const variancePercent = Math.round((data.risk - 1.00) * 100);

    res.json({
      success: true,
      data: {
        fsa: rawFsa,
        city: data.city,
        label: data.label,
        risk: data.risk,
        multiplier: data.risk,
        estimated_monthly: estimatedMonthly,
        variance_percent: variancePercent,
        tier: tierInfo.tier,
        tier_label: tierInfo.label,
        badge_color: tierInfo.badgeColor,
        tier_description: tierInfo.description,
        ontario_base_monthly: BASE_ONTARIO_MONTHLY
      }
    });
  } catch (error) {
    console.error('Error fetching territory by FSA:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
