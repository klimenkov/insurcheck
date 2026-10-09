import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { TOP_12_INSURERS, calculateInsurerMatches } from '../server/engine/suitability.js';
import { evaluateInsurance } from '../server/engine/model.js';
import { db } from '../server/db.js';

console.log('--- RUNNING INS-66 INTEGRATION TESTS ---\n');

// 1. Catalog Verification
console.log('Test 1: Verify Top 12 Ontario Insurers Catalog');
assert.strictEqual(TOP_12_INSURERS.length, 12, 'Must have exactly 12 top Ontario insurers');

const requiredFields = ['id', 'name', 'marketShareRank', 'annualRevenue', 'channel', 'channelType', 'primaryStrength', 'pros', 'website'];
for (const ins of TOP_12_INSURERS) {
  for (const field of requiredFields) {
    assert(ins[field] !== undefined, `Insurer ${ins.id} missing required field: ${field}`);
  }
}

// Check that top IDs exist in DB
const dbInsurers = db.prepare('SELECT id FROM insurers').all().map(r => r.id);
for (const ins of TOP_12_INSURERS) {
  assert(dbInsurers.includes(ins.id), `Top 12 insurer ${ins.id} must exist in the database`);
}
console.log('  ✓ Top 12 catalog verified against database');

// 2. Young Tech-Savvy Driver Scenario
console.log('\nTest 2: Young Driver with Telematics (Appetite Alignment)');
const youngResult = calculateInsurerMatches({
  driverAge: 23,
  yearsLicensed: 4,
  cleanRecord: true,
  postalCode: 'M5V',
  locationInfo: { city: 'Toronto (Downtown)', risk: 1.11 },
  vehicleMake: 'Honda',
  vehicleModel: 'Civic',
  discounts: ['driving_app']
});

assert(youngResult.topMatches.length === 3, 'Must return top 3 matches');
assert(youngResult.allMatches.length === 12, 'Must score all 12 insurers');

// Belairdirect or Desjardins should lead
const topYoungIds = youngResult.topMatches.map(m => m.id);
assert(
  topYoungIds.includes('belairdirect') || topYoungIds.includes('desjardins'),
  'Young tech-savvy driver must have Belairdirect or Desjardins in top matches'
);
const belairMatch = youngResult.allMatches.find(m => m.id === 'belairdirect');
assert(belairMatch.matchScore >= 85, 'Belairdirect score must be >= 85% for young driver with app');
assert(
  belairMatch.matchReasons.some(r => r.toLowerCase().includes('young') || r.toLowerCase().includes('app') || r.toLowerCase().includes('automerit')),
  'Must include relevant match reason'
);
console.log(`  ✓ Young driver scenario verified (Top: ${youngResult.topMatches[0].name} - ${youngResult.topMatches[0].matchScore}%)`);

// 3. EV / Tesla Driver Scenario
console.log('\nTest 3: EV / Tesla Driver Scenario');
const evResult = calculateInsurerMatches({
  driverAge: 33,
  yearsLicensed: 14,
  cleanRecord: true,
  postalCode: 'L6P',
  locationInfo: { city: 'Brampton', risk: 1.48 },
  vehicleMake: 'Tesla',
  vehicleModel: 'Model 3',
  discounts: ['driving_app', 'winter_tires']
});

const desjardinsEV = evResult.allMatches.find(m => m.id === 'desjardins');
assert(desjardinsEV.matchScore >= 90, 'Desjardins must score >= 90% for EV with telematics');
assert(
  desjardinsEV.matchReasons.some(r => r.toLowerCase().includes('electric') || r.toLowerCase().includes('green')),
  'Must highlight electric/green vehicle synergy'
);
console.log(`  ✓ EV/Tesla scenario verified (Desjardins: ${desjardinsEV.matchScore}%)`);

// 4. Mature Driver in Southwestern Ontario Scenario
console.log('\nTest 4: Mature Driver with Home Bundle in Low-Risk Territory');
const matureResult = calculateInsurerMatches({
  driverAge: 56,
  yearsLicensed: 35,
  cleanRecord: true,
  postalCode: 'N6A',
  locationInfo: { city: 'London', risk: 0.95 },
  vehicleMake: 'Subaru',
  vehicleModel: 'Outback',
  discounts: ['bundle_home', 'winter_tires']
});

const topMatureIds = matureResult.topMatches.map(m => m.id);
assert(
  topMatureIds.includes('wawanesa') || topMatureIds.includes('td') || topMatureIds.includes('caa'),
  'Mature driver in London with home bundle must match Wawanesa, TD, or CAA'
);
const wawanesaMatch = matureResult.allMatches.find(m => m.id === 'wawanesa');
assert(wawanesaMatch.matchScore >= 90, 'Wawanesa must score >= 90% in low-loss territory');
console.log(`  ✓ Mature driver scenario verified (Top: ${matureResult.topMatches[0].name} - ${matureResult.topMatches[0].matchScore}%)`);

// 5. Driver with Prior Tickets / Minor Claim Scenario
console.log('\nTest 5: Driver with Prior Claims (Forgiveness & Broad Appetite)');
const nonCleanResult = calculateInsurerMatches({
  driverAge: 38,
  yearsLicensed: 18,
  cleanRecord: false,
  postalCode: 'M1P',
  locationInfo: { city: 'Toronto (Scarborough)', risk: 1.26 },
  vehicleMake: 'Toyota',
  vehicleModel: 'RAV4',
  discounts: []
});

const intactMatch = nonCleanResult.allMatches.find(m => m.id === 'intact');
const avivaMatch = nonCleanResult.allMatches.find(m => m.id === 'aviva');
const caaMatch = nonCleanResult.allMatches.find(m => m.id === 'caa');
assert(intactMatch.matchScore > caaMatch.matchScore, 'Intact must score higher than conservative CAA for non-clean record');
assert(avivaMatch.matchScore > caaMatch.matchScore, 'Aviva must score higher than conservative CAA for non-clean record');
console.log(`  ✓ Forgiveness appetite verified (Intact: ${intactMatch.matchScore}%, CAA: ${caaMatch.matchScore}%)`);

// 6. Multi-Vehicle Household Scenario
console.log('\nTest 6: Multi-Vehicle Household Scenario');
const multiCarResult = calculateInsurerMatches({
  driverAge: 42,
  yearsLicensed: 22,
  cleanRecord: true,
  postalCode: 'L5B',
  locationInfo: { city: 'Mississauga', risk: 1.27 },
  vehicleMake: 'Toyota',
  vehicleModel: 'Highlander',
  discounts: ['multi_vehicle', 'bundle_home']
});

const avivaMulti = multiCarResult.allMatches.find(m => m.id === 'aviva');
const cooperatorsMulti = multiCarResult.allMatches.find(m => m.id === 'cooperators');
assert(avivaMulti.matchScore >= 88, 'Aviva must score highly for multi-vehicle');
assert(cooperatorsMulti.matchScore >= 88, 'Co-operators must score highly for multi-car family bundle');
console.log(`  ✓ Multi-vehicle synergy verified (Aviva: ${avivaMulti.matchScore}%, Co-operators: ${cooperatorsMulti.matchScore}%)`);

// 7. Full Model Evaluation Integration Test
console.log('\nTest 7: evaluateInsurance returns suitability data');
const evalResult = evaluateInsurance({
  vehicleMake: 'Ford',
  vehicleModel: 'F-150',
  vehicleYear: 2023,
  postalCode: 'L6P',
  driverAge: 36,
  yearsLicensed: 16,
  cleanRecord: true,
  currentPremium: 260,
  discounts: ['winter_tires']
});

assert(evalResult.recommendedInsurers, 'Must include recommendedInsurers');
assert.strictEqual(evalResult.recommendedInsurers.length, 3, 'Must include exactly 3 recommended insurers');
assert.strictEqual(evalResult.recommendedInsurers[0].rank, 1, 'Top match must have rank 1');
assert.strictEqual(evalResult.recommendedInsurers[0].isTopMatch, true, 'Top match must have isTopMatch true');
assert(evalResult.allInsurerMatches, 'Must include allInsurerMatches');
assert.strictEqual(evalResult.allInsurerMatches.length, 12, 'Must include 12 matches');

for (const m of evalResult.allInsurerMatches) {
  assert(m.matchScore >= 62 && m.matchScore <= 98, `Match score ${m.matchScore} must be bounded between 62 and 98`);
}
console.log('  ✓ evaluateInsurance API payload fully verified');

// 8. Client Components Verification
console.log('\nTest 8: Client UI Components Exist & Render');
const matchCardPath = path.resolve('client/src/components/InsurerMatchCard.jsx');
const resultCardPath = path.resolve('client/src/components/ResultCard.jsx');

assert(fs.existsSync(matchCardPath), 'InsurerMatchCard.jsx must exist');
const matchCardCode = fs.readFileSync(matchCardPath, 'utf8');
assert(matchCardCode.includes('InsurerMatchCard'), 'Must export InsurerMatchCard');
assert(matchCardCode.includes('Fit Score:'), 'Must display Fit Score');
assert(matchCardCode.includes('Why this insurer fits your profile:'), 'Must display match reasons');

const resultCardCode = fs.readFileSync(resultCardPath, 'utf8');
assert(resultCardCode.includes('InsurerMatchCard'), 'ResultCard must import InsurerMatchCard');
assert(resultCardCode.includes('<InsurerMatchCard'), 'ResultCard must render InsurerMatchCard');
console.log('  ✓ Client component code and rendering integration verified');

console.log('\n--- ALL INS-66 INTEGRATION TESTS PASSED ---\n');
