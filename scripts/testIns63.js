import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- RUNNING INS-63 VERIFICATION TESTS ---');

const sanityCheckerPath = path.resolve('client/src/components/SanityChecker.jsx');
const navbarPath = path.resolve('client/src/components/Navbar.jsx');
const appPath = path.resolve('client/src/App.jsx');

const sanityCheckerCode = fs.readFileSync(sanityCheckerPath, 'utf-8');
const navbarCode = fs.readFileSync(navbarPath, 'utf-8');
const appCode = fs.readFileSync(appPath, 'utf-8');

// 1. Verify Mode 1 Heading & Supporting Paragraph
console.log('Testing Mode 1 copy (Check my current premium)...');
assert.ok(
  sanityCheckerCode.includes('How does your premium compare?'),
  'Must include exact heading: How does your premium compare?'
);
assert.ok(
  sanityCheckerCode.includes('Enter your current premium and insurance details to compare your price with InsurCheck’s estimate.'),
  'Must include exact supporting paragraph for Mode 1'
);
console.log('  [PASS] Mode 1 heading and supporting paragraph verified.');

// 2. Verify Mode 2 Heading & Supporting Paragraph
console.log('Testing Mode 2 copy (Estimate insurance for a car)...');
assert.ok(
  sanityCheckerCode.includes('What could insurance cost for this car?'),
  'Must include exact heading: What could insurance cost for this car?'
);
assert.ok(
  sanityCheckerCode.includes('Enter the car, location, and driving details to get an estimate from InsurCheck’s pricing model. Actual quotes may differ.'),
  'Must include exact supporting paragraph for Mode 2'
);
console.log('  [PASS] Mode 2 heading and supporting paragraph verified.');

// 3. Verify Removal of Old Notice in Step 4
console.log('Testing removal of old redundant Estimating Mode notice...');
assert.ok(
  !sanityCheckerCode.includes('Estimating Mode: We’ll estimate an insurance benchmark'),
  'Must NOT contain the old redundant Estimating Mode notice'
);
console.log('  [PASS] Old redundant estimating notice successfully removed.');

// 4. Verify Supporting Paragraph Styling (16px / 24px)
console.log('Testing supporting paragraph typography (16px / 24px)...');
assert.ok(
  sanityCheckerCode.includes('text-base leading-6 text-slate-400'),
  'Supporting paragraph must use 16px (text-base) and 24px (leading-6)'
);
console.log('  [PASS] Supporting paragraph typography verified.');

// 5. Verify Links Row (How we calculate your estimate · Privacy Policy)
console.log('Testing methodology and privacy links row...');
assert.ok(
  sanityCheckerCode.includes('How we calculate your estimate'),
  'Must include link: How we calculate your estimate'
);
assert.ok(
  sanityCheckerCode.includes('Privacy Policy'),
  'Must include link: Privacy Policy'
);
assert.ok(
  sanityCheckerCode.includes('text-teal-400 underline hover:text-teal-300'),
  'Links must use teal accent and underline'
);
assert.ok(
  sanityCheckerCode.includes('pt-3 pb-3'),
  'Links row must have 12px vertical spacing above and below (pt-3 pb-3)'
);
console.log('  [PASS] Methodology and privacy links row verified.');

// 6. Verify Wiring in App.jsx
console.log('Testing wiring in App.jsx...');
assert.ok(
  appCode.includes('onOpenMethodology={() => setFsraModalOpen(true)}'),
  'App.jsx must pass onOpenMethodology handler to SanityChecker'
);
assert.ok(
  appCode.includes("onOpenPrivacy={() => navigateTab('privacy')}"),
  'App.jsx must pass onOpenPrivacy handler to SanityChecker'
);
console.log('  [PASS] App.jsx modal and privacy navigation wiring verified.');

// 7. Verify Navbar Brand Logo uses favicon.svg
console.log('Testing Navbar brand logo matching search snippet favicon...');
assert.ok(
  navbarCode.includes('/favicon.svg'),
  'Navbar must display /favicon.svg to match search snippet logo'
);
assert.ok(
  !navbarCode.includes('ShieldAlert'),
  'Navbar must no longer use the mismatched ShieldAlert icon'
);
console.log('  [PASS] Navbar logo matches search snippet favicon.');

console.log('\n>>> ALL INS-63 VERIFICATION TESTS PASSED! <<<\n');
