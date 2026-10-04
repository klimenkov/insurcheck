/**
 * Actuarial Discount Normalization & Rating Module for Ontario Auto Insurance (INS-64)
 * Governs discount recognition, combination rules, reverse-normalization, and scenario adjustments.
 */

export const CALCULATION_VERSION = 'v1.0-2026.1';
export const MAX_ONTARIO_CUMULATIVE_DISCOUNT = 0.35; // 35% standard cumulative discount cap in Ontario filings

export const DISCOUNT_DEFINITIONS = [
  {
    id: 'winter_tires',
    label: 'Winter tires',
    iconConcept: 'Snowflake',
    explanation: 'Discount for using approved winter tires (mandated in Ontario)',
    rate: 0.05,
    isPriced: true,
    source: 'FSRA Ontario Winter Tire Regulation / Actuarial Filings (3%–5%)'
  },
  {
    id: 'bundle_home',
    label: 'Home + auto',
    iconConcept: 'House and car',
    explanation: 'Discount for bundling home, condo, or tenant insurance with auto',
    rate: 0.10,
    isPriced: true,
    source: 'Standard Ontario Multi-Line P&C Discount Matrix (5%–15%)'
  },
  {
    id: 'multi_vehicle',
    label: 'Multiple vehicles',
    iconConcept: 'Two cars',
    explanation: 'Discount for insuring more than one vehicle on policy',
    rate: 0.10,
    isPriced: true,
    source: 'Standard Ontario Multi-Vehicle Fleet Discount Matrix (8%–15%)'
  },
  {
    id: 'multi_driver',
    label: 'Multiple drivers',
    iconConcept: 'Two people',
    explanation: 'A specific discount your insurer applies for multiple drivers',
    rate: 0.05,
    isPriced: true,
    source: 'Ontario Family / Multi-Driver Profile Tier'
  },
  {
    id: 'driving_app',
    label: 'Driving app',
    iconConcept: 'Smartphone',
    explanation: 'Discount through your insurer’s driving-tracking program',
    rate: 0.10,
    isPriced: true,
    source: 'FSRA Approved Usage-Based Insurance (UBI) Enrolment Discount'
  },
  {
    id: 'low_mileage',
    label: 'Low mileage',
    iconConcept: 'Odometer',
    explanation: 'A specific low-mileage discount applied by your insurer (<10,000 km/yr)',
    rate: 0.05,
    isPriced: true,
    source: 'Ontario Low Commute / Pleasure Vehicle Rating Band'
  },
  {
    id: 'anti_theft',
    label: 'Anti-theft',
    iconConcept: 'Shield and lock',
    explanation: 'Discount for an eligible anti-theft device or tracking system',
    rate: 0.05,
    isPriced: true,
    source: 'Équité Association / Certified Tracking Device Endorsement'
  },
  {
    id: 'driver_training',
    label: 'Driver training',
    iconConcept: 'Graduation cap',
    explanation: 'Discount for an eligible driver-training course',
    rate: 0.05,
    isPriced: true,
    source: 'MTO-Approved Beginner Driver Education (BDE) 3-year Credit'
  },
  {
    id: 'group_employer',
    label: 'Group / employer',
    iconConcept: 'ID badge',
    explanation: 'Discount through an employer, association, or alumni group',
    rate: 0.05,
    isPriced: true,
    source: 'Ontario Affinity / Group Sponsor Filing Guidelines'
  },
  {
    id: 'other',
    label: 'Other',
    iconConcept: 'Plus',
    explanation: 'Another discount not listed',
    rate: null,
    isPriced: false,
    source: 'Unstandardized carrier discount'
  }
];

export const DISCOUNT_MAP = Object.fromEntries(
  DISCOUNT_DEFINITIONS.map(d => [d.id, d])
);

/**
 * Parses, sanitizes, and validates user discount selections.
 */
export function parseDiscountSelection(rawDiscounts, rawStatus, rawOtherDesc) {
  let status = String(rawStatus || '').trim().toLowerCase();
  let discounts = [];
  let otherDesc = (rawOtherDesc ? String(rawOtherDesc).trim().slice(0, 150) : null) || null;

  if (Array.isArray(rawDiscounts)) {
    discounts = rawDiscounts.map(d => String(d).trim().toLowerCase()).filter(Boolean);
  } else if (typeof rawDiscounts === 'string' && rawDiscounts) {
    try {
      const parsed = JSON.parse(rawDiscounts);
      if (Array.isArray(parsed)) {
        discounts = parsed.map(d => String(d).trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      discounts = [rawDiscounts.trim().toLowerCase()];
    }
  }

  // Handle explicit mutually exclusive choices
  if (status === 'none_reported' || status === 'no_discounts' || discounts.includes('no_discounts')) {
    return {
      status: 'none_reported',
      discounts: [],
      otherDescription: null
    };
  }

  if (status === 'unsure' || status === 'not_sure' || discounts.includes('not_sure')) {
    return {
      status: 'unsure',
      discounts: [],
      otherDescription: null
    };
  }

  // Filter valid known discount identifiers
  const validDiscounts = Array.from(new Set(
    discounts.filter(id => DISCOUNT_MAP[id] && id !== 'no_discounts' && id !== 'not_sure')
  ));

  if (validDiscounts.length > 0) {
    return {
      status: 'selected',
      discounts: validDiscounts,
      otherDescription: validDiscounts.includes('other') ? otherDesc : null
    };
  }

  // Legacy fallback or empty selection
  return {
    status: status === 'legacy_unknown' ? 'legacy_unknown' : 'unsure',
    discounts: [],
    otherDescription: null
  };
}

/**
 * Calculates composite discount rate from an array of discount IDs.
 * Multiplicative combination rule: 1 - prod(1 - r_i), capped at MAX_ONTARIO_CUMULATIVE_DISCOUNT.
 */
export function calculateCompositeDiscount(discountIds) {
  const ids = Array.isArray(discountIds) ? discountIds : [];
  const priced = [];
  const unpriced = [];

  let retention = 1.0;

  for (const id of ids) {
    const def = DISCOUNT_MAP[id];
    if (!def) continue;

    if (def.isPriced && typeof def.rate === 'number') {
      priced.push({
        id: def.id,
        label: def.label,
        iconConcept: def.iconConcept,
        rate: def.rate,
        source: def.source
      });
      retention *= (1 - def.rate);
    } else {
      unpriced.push({
        id: def.id,
        label: def.label,
        iconConcept: def.iconConcept,
        explanation: def.explanation
      });
    }
  }

  const rawRate = 1 - retention;
  const compositeRate = Math.min(MAX_ONTARIO_CUMULATIVE_DISCOUNT, Math.round(rawRate * 1000) / 1000);

  return {
    compositeRate,
    priced,
    unpriced,
    isFullyPriced: unpriced.length === 0,
    hasDiscounts: priced.length > 0 || unpriced.length > 0
  };
}

/**
 * Performs reverse-normalization on paid premium P to estimate premium before discounts P_before.
 * Section 8:
 * - If all reported discounts are supported: P_before = round(P / (1 - compositeRate))
 * - If none_reported: P_before = P (no adjustment)
 * - If unsure or any unpriced discount exists (e.g. other): P_before = null (unavailable)
 */
export function normalizeSubmittedPremium(paidPremium, discountStateOrDiscounts, maybeStatus = 'selected') {
  const P = parseFloat(paidPremium);
  if (!P || isNaN(P) || P <= 0) {
    return {
      estimatedBeforeDiscounts: null,
      normalizationStatus: 'unavailable',
      appliedFactors: null,
      calculationVersion: CALCULATION_VERSION
    };
  }

  let discountState;
  if (discountStateOrDiscounts && typeof discountStateOrDiscounts === 'object' && !Array.isArray(discountStateOrDiscounts)) {
    discountState = discountStateOrDiscounts;
  } else {
    discountState = parseDiscountSelection(discountStateOrDiscounts, maybeStatus);
  }

  const { status, discounts } = discountState;

  if (status === 'none_reported') {
    return {
      estimatedBeforeDiscounts: P,
      normalizationStatus: 'no_adjustment',
      appliedFactors: { compositeRate: 0, factors: [] },
      calculationVersion: CALCULATION_VERSION
    };
  }

  if (status === 'unsure' || status === 'legacy_unknown') {
    return {
      estimatedBeforeDiscounts: null,
      normalizationStatus: status === 'legacy_unknown' ? 'legacy_assumed_base' : 'unavailable',
      appliedFactors: null,
      calculationVersion: CALCULATION_VERSION
    };
  }

  const comp = calculateCompositeDiscount(discounts);

  // If any reported discount is unpriced (like 'other'), leave complete estimated premium null per Section 8
  if (!comp.isFullyPriced) {
    return {
      estimatedBeforeDiscounts: null,
      normalizationStatus: 'unavailable',
      appliedFactors: {
        compositeRate: comp.compositeRate,
        priced: comp.priced,
        unpriced: comp.unpriced
      },
      calculationVersion: CALCULATION_VERSION
    };
  }

  // All reported discounts are supported and priced
  if (comp.compositeRate > 0) {
    const estimatedBefore = Math.round(P / (1 - comp.compositeRate));
    return {
      estimatedBeforeDiscounts: estimatedBefore,
      normalizationStatus: 'estimated',
      appliedFactors: {
        compositeRate: comp.compositeRate,
        factors: comp.priced
      },
      calculationVersion: CALCULATION_VERSION
    };
  }

  return {
    estimatedBeforeDiscounts: P,
    normalizationStatus: 'no_adjustment',
    appliedFactors: { compositeRate: 0, factors: [] },
    calculationVersion: CALCULATION_VERSION
  };
}
