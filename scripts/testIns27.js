import express from 'express';
import { submissionsRouter } from '../server/routes/submissions.js';
import { checkRouter } from '../server/routes/check.js';
import { db } from '../server/db.js';

const app = express();
app.use(express.json());
app.use('/api/submissions', submissionsRouter);
app.use('/api/check', checkRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Test POST /api/submissions with custom age & record
    const subPayload = {
      postalCode: 'M5V',
      vehicleMake: 'Honda',
      vehicleModel: 'Civic',
      vehicleYear: 2021,
      driverAge: 24,
      yearsLicensed: 3,
      cleanRecord: false,
      providerName: 'Belairdirect',
      monthlyPremium: 275,
      coverageType: 'Full',
      comment: 'Test submission from INS-27 modal',
      shareAnonymously: true
    };

    const res1 = await fetch(`http://localhost:${port}/api/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subPayload)
    });
    const json1 = await res1.json();
    if (!json1.success) throw new Error(`POST /api/submissions failed: ${json1.error}`);
    console.log('[OK] POST /api/submissions succeeded');

    // Verify record in database
    const latestSub = db.prepare('SELECT * FROM submissions ORDER BY id DESC LIMIT 1').get();
    console.log('[OK] Latest submission in DB:', {
      id: latestSub.id,
      driver_age: latestSub.driver_age,
      years_licensed: latestSub.years_licensed,
      clean_record: latestSub.clean_record,
      coverage_type: latestSub.coverage_type,
      provider_name: latestSub.provider_name
    });

    if (latestSub.driver_age !== 24 || latestSub.years_licensed !== 3 || latestSub.clean_record !== 0 || latestSub.coverage_type !== 'Full') {
      throw new Error('Database values do not match submitted payload!');
    }

    // 2. Test POST /api/check with shareAnonymously: true
    const checkPayload = {
      coverageLevel: 'standard',
      postalCode: 'L6P',
      vehicleMake: 'Toyota',
      vehicleModel: 'RAV4',
      vehicleYear: 2023,
      currentPremium: 220,
      insuranceCompany: 'TD Insurance',
      driverAge: 45,
      yearsLicensed: 20,
      cleanRecord: true,
      shareAnonymously: true
    };

    const countBefore = db.prepare('SELECT count(*) as c FROM submissions').get().c;

    const res2 = await fetch(`http://localhost:${port}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkPayload)
    });
    const json2 = await res2.json();
    if (!json2.success) throw new Error(`POST /api/check failed: ${json2.error}`);
    console.log('[OK] POST /api/check succeeded');

    const countAfter = db.prepare('SELECT count(*) as c FROM submissions').get().c;
    if (countAfter !== countBefore + 1) {
      throw new Error(`Expected submissions count to increase by 1, was ${countBefore} -> ${countAfter}`);
    }

    const checkSub = db.prepare('SELECT * FROM submissions ORDER BY id DESC LIMIT 1').get();
    console.log('[OK] Submission automatically created from Sanity Check:', {
      id: checkSub.id,
      city: checkSub.city,
      fsa: checkSub.fsa,
      driver_age: checkSub.driver_age,
      years_licensed: checkSub.years_licensed,
      clean_record: checkSub.clean_record,
      monthly_premium: checkSub.monthly_premium,
      comment: checkSub.comment
    });

    if (checkSub.driver_age !== 45 || checkSub.monthly_premium !== 220 || checkSub.clean_record !== 1) {
      throw new Error('Check submission record does not match check inputs!');
    }

    // 3. Test POST /api/check with shareAnonymously: false (should NOT create a row)
    const checkNoSharePayload = {
      ...checkPayload,
      currentPremium: 250,
      shareAnonymously: false
    };

    const countBefore2 = db.prepare('SELECT count(*) as c FROM submissions').get().c;
    await fetch(`http://localhost:${port}/api/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkNoSharePayload)
    });
    const countAfter2 = db.prepare('SELECT count(*) as c FROM submissions').get().c;
    if (countAfter2 !== countBefore2) {
      throw new Error('Check with shareAnonymously: false created a submission row!');
    }
    console.log('[OK] shareAnonymously: false respected (no submission created)');

    console.log('\n>>> ALL INS-27 INTEGRATION TESTS PASSED! <<<');
  } catch (err) {
    console.error('Test FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
