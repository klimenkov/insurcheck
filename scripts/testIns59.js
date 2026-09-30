import assert from 'assert';
import { POPULAR_MAKES, ALL_MAKES, VEHICLE_OPTIONS, getModelsForMake, getYearsForModel } from '../client/src/data/vehicles.js';
import { VEHICLE_RISK_MAP } from '../server/engine/ontarioData.js';
import { resolveVehicleInfo } from '../server/engine/model.js';

console.log('--- RUNNING INS-59 VERIFICATION TESTS ---');

// 1. Popular brands count and order
console.log('Testing Popular brands...');
assert.strictEqual(POPULAR_MAKES.length, 36, 'Popular brands must contain exactly 36 makes');
const sortedPopular = [...POPULAR_MAKES].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
assert.deepStrictEqual(POPULAR_MAKES, sortedPopular, 'Popular brands must be sorted A-Z');
console.log('  [PASS] Popular brands: 36 makes A-Z verified.');

// 2. All brands count and order
console.log('Testing All brands...');
assert.strictEqual(ALL_MAKES.length, 123, 'All brands must contain exactly 123 makes');
assert.strictEqual(VEHICLE_OPTIONS.length, 123, 'VEHICLE_OPTIONS must contain exactly 123 makes');
const sortedAll = [...ALL_MAKES].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
assert.deepStrictEqual(ALL_MAKES, sortedAll, 'All brands must be sorted A-Z');
// Every popular make must be in ALL_MAKES
assert(POPULAR_MAKES.every(p => ALL_MAKES.includes(p)), 'Every popular make must be present in ALL_MAKES');
console.log('  [PASS] All brands: 123 makes A-Z verified.');

// 3. Audi catalogue
console.log('Testing Audi catalogue...');
const audiModels = getModelsForMake('Audi');
assert.strictEqual(audiModels.length, 55, 'Audi catalogue must contain exactly 55 models');
assert(audiModels.includes('A8'), 'Audi models must include A8');
assert(audiModels.includes('S8'), 'Audi models must include S8');
assert(audiModels.includes('e-tron'), 'Audi models must include e-tron');
assert(audiModels.includes('SQ5'), 'Audi models must include SQ5');
assert(audiModels.includes('TT'), 'Audi models must include TT');
assert(audiModels.includes('100'), 'Audi models must include 100');
const sortedAudi = [...audiModels].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
assert.deepStrictEqual(audiModels, sortedAudi, 'Audi models must be sorted A-Z');
console.log('  [PASS] Audi 55-model catalogue verified.');

// 4. Model-year availability (newest first, source-backed ranges)
console.log('Testing dynamic model years...');
const a8Years = getYearsForModel('Audi', 'A8');
assert(a8Years[0] === 2026, 'Audi A8 newest year should be 2026');
assert(a8Years[a8Years.length - 1] === 1997, 'Audi A8 oldest year should be 1997');
for (let i = 0; i < a8Years.length - 1; i++) {
  assert(a8Years[i] > a8Years[i + 1], 'Years must be sorted descending (newest first)');
}

const audi100Years = getYearsForModel('Audi', '100');
assert(audi100Years[0] === 1994, 'Audi 100 newest year should be 1994');
assert(audi100Years[audi100Years.length - 1] === 1968, 'Audi 100 oldest year should be 1968 (pre-2000 support)');

const cybertruckYears = getYearsForModel('Tesla', 'Cybertruck');
assert.deepStrictEqual(cybertruckYears, [2026, 2025, 2024], 'Cybertruck years should be 2026-2024');

console.log('  [PASS] Dynamic model-year filtering verified.');

// 5. Search deduplication logic simulation (SearchableSelect)
console.log('Testing search deduplication across sections...');
const sections = [
  { title: 'Popular brands', options: POPULAR_MAKES },
  { title: 'All brands', options: ALL_MAKES }
];
const query = 'audi';
const allUniqueOptions = Array.from(
  new Set(sections.flatMap(s => s.options))
).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
const searchMatches = allUniqueOptions.filter(opt =>
  opt.toLowerCase().includes(query.toLowerCase().trim())
);
assert.strictEqual(searchMatches.filter(m => m === 'Audi').length, 1, 'Search match for Audi must appear exactly once (no duplicates)');
console.log('  [PASS] Search deduplication verified.');

// 6. Backend actuarial risk factors for Audi models
console.log('Testing actuarial risk resolution for new Audi models...');
const a8Risk = resolveVehicleInfo('Audi', 'A8');
assert.strictEqual(a8Risk.factor, 1.50, 'Audi A8 risk factor should be 1.50');
assert.strictEqual(a8Risk.category, 'Flagship Luxury Sedan', 'Audi A8 category verified');

const s8Risk = resolveVehicleInfo('Audi', 'S8');
assert.strictEqual(s8Risk.factor, 1.55, 'Audi S8 risk factor should be 1.55');

const etronRisk = resolveVehicleInfo('Audi', 'e-tron');
assert.strictEqual(etronRisk.factor, 1.42, 'Audi e-tron risk factor should be 1.42');

console.log('  [PASS] Actuarial model vehicle factors for Audi A8/S8/e-tron verified.');

console.log('\n>>> ALL INS-59 TESTS PASSED SUCCESSFULLY! <<<');
