/**
 * Ontario Auto Insurance Discount Definitions & Metadata (INS-64)
 */

export const DISCOUNT_ITEMS = [
  {
    id: 'winter_tires',
    label: 'Winter tires',
    iconName: 'Snowflake',
    explanation: 'Discount for using approved winter tires (mandated in Ontario)',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'bundle_home',
    label: 'Home + auto',
    iconName: 'Home',
    explanation: 'Discount for bundling home, condo, or tenant insurance with auto',
    rate: 0.10,
    isPriced: true
  },
  {
    id: 'multi_vehicle',
    label: 'Multiple vehicles',
    iconName: 'Car',
    explanation: 'Discount for insuring more than one vehicle on policy',
    rate: 0.10,
    isPriced: true
  },
  {
    id: 'multi_driver',
    label: 'Multiple drivers',
    iconName: 'Users',
    explanation: 'A specific discount your insurer applies for multiple drivers',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'driving_app',
    label: 'Driving app',
    iconName: 'Smartphone',
    explanation: 'Discount through your insurer’s driving-tracking program (telematics)',
    rate: 0.10,
    isPriced: true
  },
  {
    id: 'low_mileage',
    label: 'Low mileage',
    iconName: 'Gauge',
    explanation: 'A specific low-mileage discount applied by your insurer (<10,000 km/yr)',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'anti_theft',
    label: 'Anti-theft',
    iconName: 'ShieldAlert',
    explanation: 'Discount for an eligible anti-theft device or tracking system',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'driver_training',
    label: 'Driver training',
    iconName: 'GraduationCap',
    explanation: 'Discount for completing an eligible beginner driver education course',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'group_employer',
    label: 'Group / employer',
    iconName: 'BadgeCheck',
    explanation: 'Discount through an employer, association, or alumni group',
    rate: 0.05,
    isPriced: true
  },
  {
    id: 'other',
    label: 'Other',
    iconName: 'Plus',
    explanation: 'Another discount not listed',
    rate: null,
    isPriced: false
  }
];

export const DISCOUNT_DICT = Object.fromEntries(
  DISCOUNT_ITEMS.map(d => [d.id, d])
);

export function getDiscountItem(id) {
  return DISCOUNT_DICT[id] || {
    id,
    label: id,
    iconName: 'Tag',
    explanation: 'Driver reported discount',
    isPriced: false
  };
}

export const MAX_CUMULATIVE_DISCOUNT = 0.35;

/**
 * Calculates client-side scenario difference when user edits discounts on results card.
 */
export function calculateScenarioPricing(baseRate, discountIds) {
  const base = Number(baseRate) || 0;
  if (!base || !Array.isArray(discountIds) || discountIds.length === 0) {
    return {
      rateWithDiscounts: base,
      rateBeforeDiscounts: base,
      difference: 0,
      compositeRate: 0,
      priced: [],
      unpriced: []
    };
  }

  let retention = 1.0;
  const priced = [];
  const unpriced = [];

  for (const id of discountIds) {
    const item = DISCOUNT_DICT[id];
    if (!item) continue;
    if (item.isPriced && typeof item.rate === 'number') {
      priced.push(item);
      retention *= (1 - item.rate);
    } else {
      unpriced.push(item);
    }
  }

  const rawRate = 1 - retention;
  const compositeRate = Math.min(MAX_CUMULATIVE_DISCOUNT, Math.round(rawRate * 1000) / 1000);
  const rateWithDiscounts = Math.round(base * (1 - compositeRate));
  const difference = Math.max(0, base - rateWithDiscounts);

  return {
    rateWithDiscounts,
    rateBeforeDiscounts: base,
    difference,
    compositeRate,
    priced,
    unpriced,
    isFullyPriced: unpriced.length === 0
  };
}
