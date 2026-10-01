import assert from 'node:assert';
import express from 'express';
import { db } from '../server/db.js';
import { leadsRouter } from '../server/routes/leads.js';
import { checkRouter } from '../server/routes/check.js';
import { territoriesRouter } from '../server/routes/territories.js';
import { FSA_RISK_MAP } from '../server/engine/ontarioData.js';

console.log('--- RUNNING INS-61 VERIFICATION TESTS ---');

const app = express();
app.use(express.json());
app.use('/api/leads', leadsRouter);
app.use('/api/check', checkRouter);
app.use('/api/territories', territoriesRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test FSA Count (Requirement 9)
    console.log('Testing FSA counts (Requirement 9)...');
    const uniqueFsas = Object.keys(FSA_RISK_MAP);
    assert.strictEqual(uniqueFsas.length, 143, `Expected 143 unique FSAs, got ${uniqueFsas.length}`);

    const resTerr = await fetch(`${baseUrl}/api/territories`);
    const terrJson = await resTerr.json();
    assert.strictEqual(terrJson.success, true);
    assert.strictEqual(terrJson.data.length, 143, `API /api/territories should return 143 items, got ${terrJson.data.length}`);

    // Verify categories sum to 143
    const extreme = terrJson.data.filter(t => t.tier === 'Extreme').length;
    const high = terrJson.data.filter(t => t.tier === 'High').length;
    const moderate = terrJson.data.filter(t => t.tier === 'Moderate').length;
    const low = terrJson.data.filter(t => t.tier === 'Low').length;
    assert.strictEqual(extreme + high + moderate + low, 143);
    console.log(`  [PASS] Exactly 143 FSAs verified: ${extreme} Extreme, ${high} High, ${moderate} Moderate, ${low} Low.`);

    // 2. Test Waitlist API (Requirement 7)
    console.log('Testing Broker Launch Waitlist API (Requirement 7)...');
    const testEmail = `test_driver_${Date.now()}@example.com`;

    // Valid registration
    const resWaitlist = await fetch(`${baseUrl}/api/leads/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const waitlistJson = await resWaitlist.json();
    assert.strictEqual(waitlistJson.success, true, 'Waitlist registration should succeed');
    assert.strictEqual(waitlistJson.message, "You're on the list. We'll email you when broker matching becomes available.");

    // Duplicate email registration
    const resDup = await fetch(`${baseUrl}/api/leads/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail.toUpperCase() })
    });
    const dupJson = await resDup.json();
    assert.strictEqual(dupJson.success, false);
    assert.strictEqual(dupJson.error, 'You are already registered on the launch waitlist.');

    // Invalid email
    const resInvalid = await fetch(`${baseUrl}/api/leads/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    const invalidJson = await resInvalid.json();
    assert.strictEqual(invalidJson.success, false);
    console.log('  [PASS] Broker launch waitlist registration, duplicate prevention, and validation verified.');

    // 3. Test Driver Profile in Calculator Output (Requirement 1 & 11)
    console.log('Testing Calculator Driver Profile output (Requirement 1 & 11)...');
    const resCheck = await fetch(`${baseUrl}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coverageLevel: 'standard',
        postalCode: 'M4G',
        vehicleMake: 'TOYOTA',
        vehicleModel: 'COROLLA',
        vehicleYear: 2022,
        driverAge: 32,
        yearsLicensed: 12,
        cleanRecord: true,
        currentPremium: 190,
        isEstimating: false,
        shareAnonymously: false
      })
    });
    const checkData = await resCheck.json();
    assert.strictEqual(checkData.success, true);
    assert.ok(checkData.data.driver, 'Response should include driver profile for compact summary');
    assert.strictEqual(checkData.data.driver.age, 32);
    assert.strictEqual(checkData.data.driver.yearsLicensed, 12);
    assert.strictEqual(checkData.data.driver.cleanRecord, true);

    // Verify confidence metric exists and is internal
    assert.ok(typeof checkData.data.reliabilityScore === 'number');
    assert.ok(checkData.data.reliabilityScore >= 70 && checkData.data.reliabilityScore <= 98);
    console.log(`  [PASS] Driver summary ({ age: 32, yearsLicensed: 12, cleanRecord: true }) and confidence (${checkData.data.reliabilityScore}%) verified.`);

    // 4. Test Coverage Tiers Configuration (Requirement 8)
    console.log('Testing Coverage definitions (Requirement 8)...');
    const tiers = checkData.data.coverageTiers;
    assert.ok(tiers.minimum && tiers.standard && tiers.comprehensive);
    assert.ok(tiers.standard.rate > tiers.minimum.rate);
    assert.ok(tiers.comprehensive.rate > tiers.standard.rate);
    console.log(`  [PASS] Coverage tiers: Minimum $${tiers.minimum.rate}, Standard $${tiers.standard.rate}, Full $${tiers.comprehensive.rate}.`);

    // Clean up test waitlist record
    db.prepare('DELETE FROM broker_launch_waitlist WHERE email = ?').run(testEmail);

    console.log('\n>>> ALL INS-61 BACKEND VERIFICATION TESTS PASSED! <<<\n');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
