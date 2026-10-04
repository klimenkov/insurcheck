import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  DISCOUNT_DEFINITIONS,
  DISCOUNT_MAP,
  calculateCompositeDiscount,
  normalizeSubmittedPremium,
  parseDiscountSelection
} from '../server/engine/discounts.js';
import { evaluateInsurance } from '../server/engine/model.js';
import { db } from '../server/db.js';

console.log('--- RUNNING INS-64 INTEGRATION TESTS ---\n');

// 1. Actuarial Discount Engine Tests
console.log('Test 1: Discount Catalog has 10 items with correct rates');
assert.strictEqual(DISCOUNT_DEFINITIONS.length, 10, 'Should have exactly 10 discount options');
assert.strictEqual(DISCOUNT_MAP.winter_tires.rate, 0.05, 'Winter tires must be 5%');
assert.strictEqual(DISCOUNT_MAP.bundle_home.rate, 0.10, 'Home+auto bundle must be 10%');
assert.strictEqual(DISCOUNT_MAP.driving_app.rate, 0.10, 'Telematics must be 10%');
assert.strictEqual(DISCOUNT_MAP.multi_vehicle.rate, 0.10, 'Multi-vehicle must be 10%');
assert.strictEqual(DISCOUNT_MAP.other.rate, null, 'Other must be unpriced (null)');
console.log('  ✓ Catalog and rates verified');

console.log('Test 2: Combination Rule & Cap');
// 10% bundle + 5% winter tires: composite = 1 - (0.90 * 0.95) = 1 - 0.855 = 0.145 (14.5%)
const comb1 = calculateCompositeDiscount(['bundle_home', 'winter_tires']);
assert.strictEqual(comb1.compositeRate, 0.145, '10% and 5% combined should be 14.5%');
assert.strictEqual(comb1.isFullyPriced, true, 'Should be fully priced');

// Cap at 35%
const allDiscounts = DISCOUNT_DEFINITIONS.filter(d => d.isPriced).map(d => d.id);
const combCapped = calculateCompositeDiscount(allDiscounts);
assert.strictEqual(combCapped.compositeRate, 0.35, 'Cumulative discount must be capped at 35%');
console.log('  ✓ Combination rule and 35% cap verified');

console.log('Test 3: Reverse Normalization (Ontario Actuarial formula)');
// $180/mo with 10% discount: 180 / (1 - 0.10) = 200
const norm1 = normalizeSubmittedPremium(180, ['bundle_home'], 'selected');
assert.strictEqual(norm1.estimatedBeforeDiscounts, 200, '180 / 0.9 should be 200');
assert.strictEqual(norm1.normalizationStatus, 'estimated');

// Explicit no discounts: $200 with none: before = 200, status = no_adjustment
const normNone = normalizeSubmittedPremium(200, [], 'none_reported');
assert.strictEqual(normNone.estimatedBeforeDiscounts, 200);
assert.strictEqual(normNone.normalizationStatus, 'no_adjustment');

// Unsure / Not sure: before = null, status = unavailable
const normUnsure = normalizeSubmittedPremium(200, [], 'unsure');
assert.strictEqual(normUnsure.estimatedBeforeDiscounts, null);
assert.strictEqual(normUnsure.normalizationStatus, 'unavailable');

// Unpriced discount ("other"): before = null, status = unavailable (per Section 8)
const normUnpriced = normalizeSubmittedPremium(180, ['other'], 'selected');
assert.strictEqual(normUnpriced.estimatedBeforeDiscounts, null, 'Unpriced discount must yield null estimatedBeforeDiscounts');
assert.strictEqual(normUnpriced.normalizationStatus, 'unavailable');
console.log('  ✓ Reverse normalization verified for all states');

console.log('Test 4: Selection Parsing and Mutual Exclusivity');
const parse1 = parseDiscountSelection(['winter_tires', 'bundle_home'], 'selected', '');
assert.deepStrictEqual(parse1.discounts, ['winter_tires', 'bundle_home']);
assert.strictEqual(parse1.status, 'selected');

// Mutual exclusivity: if 'none_reported', discounts array is cleared
const parseNone = parseDiscountSelection(['winter_tires'], 'none_reported', '');
assert.deepStrictEqual(parseNone.discounts, []);
assert.strictEqual(parseNone.status, 'none_reported');

// Mutual exclusivity: if 'unsure', discounts array is cleared
const parseUnsure = parseDiscountSelection(['winter_tires'], 'unsure', '');
assert.deepStrictEqual(parseUnsure.discounts, []);
assert.strictEqual(parseUnsure.status, 'unsure');
console.log('  ✓ Mutual exclusivity rules verified');

console.log('Test 5: Model Evaluation Integration');
const modelInput = {
  fsa: 'M4B',
  city: 'Toronto',
  vehicleYear: 2022,
  vehicleMake: 'Honda',
  vehicleModel: 'Civic',
  driverAge: 35,
  yearsLicensed: 15,
  cleanRecord: true,
  currentPremium: 220,
  discounts: ['winter_tires', 'bundle_home'],
  discountStatus: 'selected'
};
const modelRes = evaluateInsurance(modelInput);
assert(typeof modelRes.fairMonthlyStandard === 'number', 'Should return fairMonthlyStandard');
assert(typeof modelRes.fairMonthlyBeforeDiscounts === 'number', 'Should return fairMonthlyBeforeDiscounts');
assert(modelRes.fairMonthlyStandard < modelRes.fairMonthlyBeforeDiscounts, 'Discounted rate should be less than rate before discounts');
assert.strictEqual(modelRes.discountStatus, 'selected');
assert.deepStrictEqual(modelRes.discounts, ['winter_tires', 'bundle_home']);
assert.strictEqual(modelRes.normalization.normalizationStatus, 'estimated');
console.log('  ✓ Model evaluation returns discount-aware benchmark and before-discounts rate');

console.log('Test 6: Database Schema & Historical Baseline Integrity');
const dbCols = db.prepare("PRAGMA table_info(submissions)").all().map(c => c.name);
const requiredCols = [
  'discounts',
  'discount_status',
  'other_discount_description',
  'estimated_premium_before_discounts',
  'normalization_status',
  'calculation_version',
  'applied_discount_factors'
];
for (const col of requiredCols) {
  assert(dbCols.includes(col), `Missing column ${col} in submissions table`);
}

// Check historical submissions retain legacy status
const legacyRows = db.prepare("SELECT * FROM submissions WHERE discount_status = 'legacy_unknown'").all();
assert(legacyRows.length > 0, 'Historical records must retain legacy_unknown discount status');
for (const row of legacyRows) {
  assert.strictEqual(row.normalization_status, 'legacy_assumed_base', 'Historical record must have legacy_assumed_base');
}
console.log('  ✓ Database schema and legacy records integrity verified');

console.log('Test 7: Insurer SVG Logos Exist');
const expectedInsurers = [
  'intact', 'desjardins', 'aviva', 'td', 'wawanesa', 'cooperators',
  'economical', 'belairdirect', 'northbridge', 'travelers', 'allstate',
  'caa', 'facility', 'goremutual', 'sonnet', 'onlia', 'squareone'
];
for (const id of expectedInsurers) {
  const logoPath = path.resolve('client/public/logos', `${id}.svg`);
  assert(fs.existsSync(logoPath), `Logo ${id}.svg must exist in client/public/logos`);
  const content = fs.readFileSync(logoPath, 'utf8');
  assert(content.includes('<svg'), `Logo ${id}.svg must contain valid svg tag`);
}
console.log('  ✓ All 17 official insurer vector SVG logos verified');

console.log('Test 8: Display Counter Offset (+1,000)');
const configPath = path.resolve('client/src/config.js');
assert(fs.existsSync(configPath), 'config.js must exist');
const configContent = fs.readFileSync(configPath, 'utf8');
assert(configContent.includes('COMMUNITY_RATES_VISIBLE: false'), 'Community rates must be hidden by default');
assert(configContent.includes('DISPLAY_CHECKS_OFFSET: 1000'), 'Display checks offset must be 1000');

// Verify that DB has not been inflated with 1000 fake checks
const totalSubmissions = db.prepare("SELECT COUNT(*) as cnt FROM submissions").get().cnt;
assert(totalSubmissions < 1000, 'DB must not have 1000 fake records');
console.log('  ✓ Counter offset and flag configuration verified');

console.log('\n--- ALL INS-64 TESTS PASSED SUCCESSFULLY! ---');
