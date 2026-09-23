/**
 * Utility for sanitizing and normalizing Ontario auto insurance inputs.
 */

export const CANONICAL_INSURERS = [
  'Intact',
  'TD Insurance',
  'Aviva',
  'Belairdirect',
  'CAA Insurance',
  'Economical',
  'Desjardins',
  'Co-operators',
  'Sonnet',
  'Wawanesa',
  'Travelers',
  'Allstate',
  'Gore Mutual',
  'Northbridge',
  'Square One Insurance',
  'Facility',
  'Other'
];

const ALIAS_MAP = {
  // Intact
  'intact': 'Intact',
  'intact insurance': 'Intact',
  'интакт': 'Intact',

  // TD Insurance
  'td': 'TD Insurance',
  'td bank': 'TD Insurance',
  'td insurance': 'TD Insurance',
  'meloche': 'TD Insurance',
  'meloche monnex': 'TD Insurance',
  'тд': 'TD Insurance',

  // Aviva
  'aviva': 'Aviva',
  'aviva canada': 'Aviva',
  'авива': 'Aviva',

  // Belairdirect
  'belair': 'Belairdirect',
  'belair direct': 'Belairdirect',
  'belairdirect': 'Belairdirect',
  'белэйр': 'Belairdirect',
  'белейр': 'Belairdirect',

  // CAA
  'caa': 'CAA Insurance',
  'caa insurance': 'CAA Insurance',
  'каа': 'CAA Insurance',

  // Economical
  'economical': 'Economical',
  'economical insurance': 'Economical',
  'definity': 'Economical',
  'эконом': 'Economical',

  // Desjardins
  'desjardins': 'Desjardins',
  'desjardin': 'Desjardins',
  'desjardins insurance': 'Desjardins',
  'ajusto': 'Desjardins',
  'дежарден': 'Desjardins',

  // Co-operators
  'co-operators': 'Co-operators',
  'cooperators': 'Co-operators',
  'co operators': 'Co-operators',
  'the co-operators': 'Co-operators',

  // Sonnet
  'sonnet': 'Sonnet',
  'sonnet insurance': 'Sonnet',
  'сонет': 'Sonnet',

  // Wawanesa
  'wawanesa': 'Wawanesa',
  'wawanesa insurance': 'Wawanesa',
  'ваванеса': 'Wawanesa',

  // Travelers
  'travelers': 'Travelers',
  'travelers canada': 'Travelers',
  'travellers': 'Travelers',
  'тревелерс': 'Travelers',

  // Allstate
  'allstate': 'Allstate',
  'allstate insurance': 'Allstate',
  'all state': 'Allstate',
  'олстейт': 'Allstate',

  // Gore Mutual
  'gore': 'Gore Mutual',
  'gore mutual': 'Gore Mutual',
  'горе': 'Gore Mutual',

  // Northbridge
  'northbridge': 'Northbridge',
  'northbridge insurance': 'Northbridge',
  'north bridge': 'Northbridge',

  // Facility
  'facility': 'Facility',
  'facility association': 'Facility',
  'фасилити': 'Facility',

  // Square One
  'square one': 'Square One Insurance',
  'squareone': 'Square One Insurance',
  'square 1': 'Square One Insurance',
  'square-one': 'Square One Insurance',
  'square one insurance': 'Square One Insurance',
  'сквер ван': 'Square One Insurance',
  'скверван': 'Square One Insurance'
};

/**
 * Normalizes any freeform carrier input to a canonical Ontario insurer name.
 */
export function normalizeInsurerName(rawName) {
  if (!rawName) return '';
  const trimmed = String(rawName).trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase().replace(/['"`]/g, '');

  // 1. Direct canonical match
  const directMatch = CANONICAL_INSURERS.find(c => c.toLowerCase() === lower);
  if (directMatch) return directMatch;

  // 2. Alias lookup
  if (ALIAS_MAP[lower]) {
    return ALIAS_MAP[lower];
  }

  // 3. Substring match against canonical insurers
  for (const canonical of CANONICAL_INSURERS) {
    if (canonical === 'Other') continue;
    const canLower = canonical.toLowerCase();
    if (lower.includes(canLower) || canLower.includes(lower)) {
      return canonical;
    }
  }

  // Fallback to title-cased trimmed string or Other
  return trimmed;
}

export const MIN_MONTHLY_PREMIUM = 50;
export const MAX_MONTHLY_PREMIUM = 2500;

/**
 * Validates driver monthly insurance premium against realistic Ontario limits.
 * Filters out test entries and jokes ($10, $9,999/mo).
 */
export function validateMonthlyPremium(premium) {
  const num = typeof premium === 'number' ? premium : parseFloat(premium);

  if (isNaN(num)) {
    return {
      valid: false,
      sanitized: null,
      error: 'Please enter a valid numeric monthly premium amount.'
    };
  }

  if (num < MIN_MONTHLY_PREMIUM) {
    return {
      valid: false,
      sanitized: num,
      error: `Monthly premium of $${num} is too low. In Ontario, mandatory auto insurance starts at $${MIN_MONTHLY_PREMIUM}/mo.`
    };
  }

  if (num > MAX_MONTHLY_PREMIUM) {
    return {
      valid: false,
      sanitized: num,
      error: 'Monthly rate exceeds expected limits. If this is an annual payment, divide by 12.'
    };
  }

  return {
    valid: true,
    sanitized: Math.round(num)
  };
}
