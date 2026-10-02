import assert from 'node:assert';
import http from 'node:http';
import express from 'express';
import { sendToGoogleSheets } from '../server/services/googleSheetsWebhook.js';
import { submissionsRouter } from '../server/routes/submissions.js';
import { leadsRouter } from '../server/routes/leads.js';
import { contactRouter } from '../server/routes/contact.js';
import { feedbackRouter } from '../server/routes/feedback.js';
import { db } from '../server/db.js';

console.log('--- RUNNING GOOGLE SHEETS WEBHOOK INTEGRATION TESTS ---');

async function runTests() {
  // Test 1: Unconfigured webhook graceful no-op
  delete process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const noopResult = await sendToGoogleSheets('test', { foo: 'bar' });
  assert.strictEqual(noopResult.success, false);
  assert.strictEqual(noopResult.reason, 'unconfigured');
  console.log('  [PASS] Unconfigured webhook returns graceful no-op.');

  // Test 2: Mock Google Apps Script Webhook Server
  const receivedEvents = [];
  let shouldFail = false;

  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (shouldFail) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Internal Server Error' }));
      } else {
        const parsed = JSON.parse(body);
        receivedEvents.push(parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      }
    });
  });

  await new Promise(resolve => mockServer.listen(0, resolve));
  const mockPort = mockServer.address().port;
  const mockUrl = `http://localhost:${mockPort}/webhook`;
  process.env.GOOGLE_SHEETS_WEBHOOK_URL = mockUrl;

  try {
    // Direct service dispatch
    const directRes = await sendToGoogleSheets('submission', { id: 999, fsa: 'M5V', monthly_premium: 200 }, 'Test summary');
    assert.strictEqual(directRes.success, true);
    assert.strictEqual(receivedEvents.length, 1);
    assert.strictEqual(receivedEvents[0].eventType, 'submission');
    assert.strictEqual(receivedEvents[0].payload.id, 999);
    assert.strictEqual(receivedEvents[0].summary, 'Test summary');
    console.log('  [PASS] Direct sendToGoogleSheets dispatches formatted payload.');

    // Test 3: API Express App integration
    const app = express();
    app.use(express.json());
    app.use('/api/submissions', submissionsRouter);
    app.use('/api/leads', leadsRouter);
    app.use('/api/contact', contactRouter);
    app.use('/api/feedback', feedbackRouter);

    const appServer = app.listen(0);
    const appPort = appServer.address().port;
    const apiBase = `http://localhost:${appPort}/api`;

    // 3a. Submission endpoint
    const resSub = await fetch(`${apiBase}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postalCode: 'M4G',
        vehicleMake: 'TOYOTA',
        vehicleModel: 'CAMRY',
        vehicleYear: 2023,
        driverAge: 35,
        yearsLicensed: 15,
        cleanRecord: true,
        providerName: 'TD Insurance',
        monthlyPremium: 180,
        coverageType: 'Standard',
        comment: 'Automated test submission'
      })
    });
    const subJson = await resSub.json();
    assert.strictEqual(subJson.success, true);

    // Give asynchronous webhook 100ms to arrive
    await new Promise(r => setTimeout(r, 150));
    assert.ok(receivedEvents.some(e => e.eventType === 'submission' && e.payload.vehicle_make === 'TOYOTA'));
    console.log('  [PASS] POST /api/submissions successfully triggers Google Sheets event.');

    // 3b. Waitlist endpoint
    const testEmail = `gs_test_${Date.now()}@example.com`;
    const resWait = await fetch(`${apiBase}/leads/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const waitJson = await resWait.json();
    assert.strictEqual(waitJson.success, true);

    await new Promise(r => setTimeout(r, 150));
    assert.ok(receivedEvents.some(e => e.eventType === 'waitlist' && e.payload.email === testEmail));
    console.log('  [PASS] POST /api/leads/waitlist successfully triggers Google Sheets event.');

    // 3c. Contact endpoint
    const resContact = await fetch(`${apiBase}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Test',
        email: 'alex@example.com',
        message: 'Hello Google Sheets!'
      })
    });
    const contactJson = await resContact.json();
    assert.strictEqual(contactJson.success, true);

    await new Promise(r => setTimeout(r, 150));
    assert.ok(receivedEvents.some(e => e.eventType === 'contact' && e.payload.name === 'Alex Test'));
    console.log('  [PASS] POST /api/contact successfully triggers Google Sheets event.');

    // 3d. Feedback endpoint
    const resFb = await fetch(`${apiBase}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 5,
        isReasonable: 'Yes',
        matchesKnowledge: 'Very close',
        trustComment: 'Great tool!',
        postalCode: 'M5V',
        vehicle: 'Honda Civic',
        benchmarkRate: 210,
        currentPremium: 220
      })
    });
    const fbJson = await resFb.json();
    assert.strictEqual(fbJson.success, true);

    await new Promise(r => setTimeout(r, 150));
    assert.ok(receivedEvents.some(e => e.eventType === 'feedback' && e.payload.rating === 5));
    console.log('  [PASS] POST /api/feedback successfully triggers Google Sheets event.');

    // Test 4: Webhook failure is non-blocking and never crashes user requests
    shouldFail = true;
    const resFailSafe = await fetch(`${apiBase}/leads/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `failsafe_${Date.now()}@example.com` })
    });
    const failSafeJson = await resFailSafe.json();
    assert.strictEqual(failSafeJson.success, true, 'User request must succeed even if webhook fails');
    console.log('  [PASS] Non-blocking fail-safe: API endpoint succeeds even when webhook returns HTTP 500.');

    // Clean up test waitlist records from local test db
    db.prepare('DELETE FROM broker_launch_waitlist WHERE email LIKE ?').run('gs_test_%');
    db.prepare('DELETE FROM broker_launch_waitlist WHERE email LIKE ?').run('failsafe_%');
    db.prepare('DELETE FROM submissions WHERE comment = ?').run('Automated test submission');
    db.prepare('DELETE FROM contact_messages WHERE email = ?').run('alex@example.com');
    db.prepare('DELETE FROM benchmark_feedback WHERE trust_comment = ?').run('Great tool!');

    appServer.close();
    console.log('\n>>> ALL GOOGLE SHEETS WEBHOOK TESTS PASSED! <<<\n');
    process.exit(0);
  } finally {
    mockServer.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
