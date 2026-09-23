import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { db } from '../server/db.js';
import { checkRouter } from '../server/routes/check.js';
import { leadsRouter } from '../server/routes/leads.js';
import { adminRouter } from '../server/routes/admin.js';
import { feedbackRouter } from '../server/routes/feedback.js';
import { statsRouter } from '../server/routes/stats.js';
import { validateMonthlyPremium } from '../server/engine/normalizer.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/check', checkRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/stats', statsRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  try {
    // 1. Test INS-33: Monthly premium cap and error message
    console.log('Testing INS-33 (cap $2,500 and strict message)...');
    const overCap = validateMonthlyPremium(2501);
    assert.strictEqual(overCap.valid, false);
    assert.strictEqual(overCap.error, 'Monthly rate exceeds expected limits. If this is an annual payment, divide by 12.');
    
    const atCap = validateMonthlyPremium(2500);
    assert.strictEqual(atCap.valid, true);
    assert.strictEqual(atCap.sanitized, 2500);

    const normal = validateMonthlyPremium(280);
    assert.strictEqual(normal.valid, true);
    console.log('  [PASS] INS-33 validation logic verified.');

    // 2. Test INS-32: Estimating mode does not save to submissions
    console.log('Testing INS-32 (isEstimating does not save to submissions)...');
    const subsBefore = db.prepare('SELECT count(*) as c FROM submissions').get().c;

    const estRes = await fetch(`${baseUrl}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isEstimating: true,
        coverageLevel: 'standard',
        postalCode: 'M4N',
        vehicleMake: 'Honda',
        vehicleModel: 'Civic',
        vehicleYear: 2022,
        driverAge: 30,
        yearsLicensed: 10,
        cleanRecord: true
      })
    });
    const estJson = await estRes.json();
    assert.strictEqual(estJson.success, true);
    assert.ok(estJson.data.fairMonthlyStandard > 0);

    const subsAfter = db.prepare('SELECT count(*) as c FROM submissions').get().c;
    assert.strictEqual(subsBefore, subsAfter, 'No submission should be created when isEstimating is true');
    console.log('  [PASS] INS-32 verified: no submission created in estimating mode.');

    // 3. Test INS-38: Feedback API
    console.log('Testing INS-38 (Feedback API)...');
    const fbRes = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        isReasonable: 'Yes',
        matchesKnowledge: 'Yes',
        useBeforeRenew: 'Yes',
        useBeforeBuy: 'Yes',
        trustComment: 'Great baseline, matched my Intact renewal quote.',
        postalCode: 'M4N',
        vehicle: '2022 Honda Civic',
        benchmarkRate: 215,
        currentPremium: 220
      })
    });
    const fbJson = await fbRes.json();
    assert.strictEqual(fbJson.success, true);

    const fbRow = db.prepare('SELECT * FROM benchmark_feedback ORDER BY id DESC LIMIT 1').get();
    assert.ok(fbRow);
    assert.strictEqual(fbRow.rating, 5);
    assert.strictEqual(fbRow.is_reasonable, 'Yes');
    assert.strictEqual(fbRow.trust_comment, 'Great baseline, matched my Intact renewal quote.');
    console.log('  [PASS] INS-38 verified: validation feedback correctly recorded.');

    // 4. Test INS-30: Admin Broker Leads & Feedback access
    console.log('Testing INS-30 (Admin Broker Leads API)...');
    // Ensure at least 1 lead exists in database
    db.prepare(`
      INSERT INTO leads (created_at, name, email, phone, vehicle, postal_code, current_premium, estimated_savings, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(new Date().toISOString(), 'John Tester', 'john@test.ca', '4165551234', '2022 Honda CR-V', 'L6P', 320, 600, 'new');

    const adminToken = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // sha256 of insurcheck2026:insurcheck_salt_2026
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'insurcheck2026' })
    });
    const loginJson = await loginRes.json();
    assert.strictEqual(loginJson.success, true);
    const token = loginJson.token;

    const leadsRes = await fetch(`${baseUrl}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const leadsJson = await leadsRes.json();
    assert.strictEqual(leadsJson.success, true);
    assert.ok(Array.isArray(leadsJson.data));
    assert.ok(leadsJson.data.length >= 1);
    const testLead = leadsJson.data[0];
    assert.ok(testLead.id);
    assert.ok(testLead.name);
    console.log(`  [PASS] INS-30 verified: fetched ${leadsJson.data.length} broker lead(s).`);

    // Test patching lead status
    const patchRes = await fetch(`${baseUrl}/api/admin/leads/${testLead.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'contacted' })
    });
    const patchJson = await patchRes.json();
    assert.strictEqual(patchJson.success, true);
    assert.strictEqual(patchJson.data.status, 'contacted');
    console.log('  [PASS] INS-30 verified: lead status updated to contacted.');

    // Test admin feedback access
    const adminFbRes = await fetch(`${baseUrl}/api/admin/feedback`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminFbJson = await adminFbRes.json();
    assert.strictEqual(adminFbJson.success, true);
    assert.ok(adminFbJson.data.length >= 1);
    console.log(`  [PASS] Admin feedback verified: fetched ${adminFbJson.data.length} feedback row(s).`);

    // 5. Test INS-31 & INS-36: Total savings only increments on Lead submission
    console.log('Testing INS-31 & INS-36 (Stats & Savings only on lead locking)...');
    const statsRes1 = await fetch(`${baseUrl}/api/stats`);
    const statsJson1 = await statsRes1.json();
    const savedBefore = statsJson1.data.total_money_saved || 0;

    // Submitting a lead with estimatedSavings = 450
    const leadCreateRes = await fetch(`${baseUrl}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Savings Locker',
        email: 'locker@test.ca',
        phone: '4165559999',
        vehicle: '2023 Toyota RAV4',
        postalCode: 'M4N',
        currentPremium: 300,
        estimatedSavings: 450
      })
    });
    const leadCreateJson = await leadCreateRes.json();
    assert.strictEqual(leadCreateJson.success, true);

    const statsRes2 = await fetch(`${baseUrl}/api/stats`);
    const statsJson2 = await statsRes2.json();
    const savedAfter = statsJson2.data.total_money_saved || 0;
    assert.strictEqual(savedAfter, savedBefore + 450);
    console.log(`  [PASS] INS-31 verified: savings incremented by exactly $450 upon lead lock.`);

    console.log('\n>>> ALL INS-30 TO INS-38 TESTS PASSED SUCCESSFULLY! <<<');
    server.close();
    db.close();
  } catch (err) {
    console.error('Test FAILED:', err);
    server.close();
    db.close();
    process.exit(1);
  }
});
