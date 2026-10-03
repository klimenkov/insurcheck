import express from 'express';
import { insurersRouter, reviewsRouter, discussionsRouter } from '../server/routes/insurers.js';
import { db } from '../server/db.js';

const app = express();
app.use(express.json());
app.use('/api/insurers', insurersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/discussions', discussionsRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`\n--- RUNNING INS-62 VERIFICATION TESTS on port ${port} ---`);

  // Ensure clean baseline state for Wawanesa before test assertions
  db.prepare("DELETE FROM reviews WHERE insurer_id = 'wawanesa'").run();
  db.prepare(`
    UPDATE insurers 
    SET total_reviews = 0, overall_rating = NULL, rating_value = NULL, rating_claims = NULL, rating_support = NULL, rating_renewal = NULL, rating_ease = NULL 
    WHERE id = 'wawanesa'
  `).run();

  try {
    // 1. Test GET /api/insurers?sort=revenue
    console.log('Testing Revenue Sorting & Financial Scale...');
    const resRev = await fetch(`http://localhost:${port}/api/insurers?sort=revenue`);
    const jsonRev = await resRev.json();
    if (!jsonRev.success || !Array.isArray(jsonRev.data)) {
      throw new Error('Failed to fetch insurers with sort=revenue');
    }
    const insurers = jsonRev.data;
    if (insurers.length < 17) {
      throw new Error(`Expected at least 17 insurers, got ${insurers.length}`);
    }

    // Top commercial carrier should be Intact ($16.2B)
    const topCarrier = insurers[0];
    if (topCarrier.id !== 'intact' || topCarrier.fy2025_revenue_cad !== 16200000000) {
      throw new Error(`Expected top carrier to be Intact ($16.2B), got ${topCarrier.name} (${topCarrier.revenue_formatted})`);
    }

    // Facility Association must be flagged as residual market and appear at the end
    const facilityAssoc = insurers.find(i => i.id === 'facility');
    if (!facilityAssoc || facilityAssoc.is_residual_market !== 1) {
      throw new Error('Facility Association not properly flagged as residual market');
    }
    const lastInsurer = insurers[insurers.length - 1];
    if (lastInsurer.id !== 'facility') {
      throw new Error(`Expected last insurer to be Facility Association, got ${lastInsurer.id}`);
    }

    // Square One should have revenue_formatted 'Comparable revenue not publicly disclosed'
    const sqOne = insurers.find(i => i.id === 'squareone');
    if (!sqOne || sqOne.revenue_formatted !== 'Comparable revenue not publicly disclosed') {
      throw new Error('Square One revenue disclaimer missing');
    }
    console.log('  [PASS] Revenue sorting, residual market separation, and disclosure notes verified.');

    // 2. Test Review Reconciliation & Zero-State Integrity
    console.log('Testing Review Reconciliation & Zero States...');
    const wawanesa = insurers.find(i => i.id === 'wawanesa');
    if (!wawanesa) throw new Error('Wawanesa not found');
    if (wawanesa.total_reviews !== 0 || wawanesa.overall_rating !== null) {
      throw new Error(`Wawanesa must have 0 reviews and null rating, got ${wawanesa.total_reviews} reviews and ${wawanesa.overall_rating} rating`);
    }

    const intact = insurers.find(i => i.id === 'intact');
    if (!intact || intact.total_reviews !== 3 || intact.overall_rating !== 4.4) {
      throw new Error(`Intact review reconciliation failed: expected 3 reviews & 4.4 rating, got ${intact.total_reviews} reviews & ${intact.overall_rating}`);
    }
    console.log('  [PASS] Review count reconciliation and zero-state verified.');

    // 3. Test Editorial Scores & Sourced Breakdown
    console.log('Testing Editorial Scores & Methodology...');
    if (!intact.editorial_score || intact.editorial_score < 8 || intact.editorial_score > 10) {
      throw new Error(`Intact editorial score invalid: ${intact.editorial_score}`);
    }
    if (!intact.editorial_claims || !intact.editorial_service || !intact.editorial_coverage) {
      throw new Error('Intact 5-pillar editorial breakdown missing');
    }
    if (!intact.who_should_consider || !intact.who_should_avoid) {
      throw new Error('Intact consumer fit recommendations missing');
    }
    console.log('  [PASS] Editorial scores and suitability guidance verified.');

    // 4. Test Single Insurer Profile API with Discussions & Replies
    console.log('Testing GET /api/insurers/:id details...');
    const resProfile = await fetch(`http://localhost:${port}/api/insurers/caa`);
    const jsonProfile = await resProfile.json();
    if (!jsonProfile.success || !jsonProfile.data) {
      throw new Error('Failed to fetch CAA profile');
    }
    const profile = jsonProfile.data;
    if (profile.insurer.id !== 'caa') throw new Error('Incorrect insurer in profile response');
    if (!Array.isArray(profile.reviews) || profile.reviews.length !== 2) {
      throw new Error(`Expected 2 reviews for CAA, got ${profile.reviews.length}`);
    }
    if (!Array.isArray(profile.discussions) || profile.discussions.length === 0) {
      throw new Error('Expected CAA discussion topics');
    }
    const caaDisc = profile.discussions[0];
    if (!Array.isArray(caaDisc.replies) || caaDisc.replies.length === 0) {
      throw new Error('Expected discussion replies for CAA question');
    }
    console.log('  [PASS] Insurer profile, reviews, and Q&A discussion hierarchy verified.');

    // 5. Test Voluntary Review Submission (No defaulted 4-star subratings, conditional claims)
    console.log('Testing Voluntary Review Submission...');
    const submitReviewRes = await fetch(`http://localhost:${port}/api/insurers/wawanesa/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: 4.5,
        rating_value: 5,
        rating_support: 4,
        had_accident: false, // Claims rating omitted
        title: 'Solid regional insurer with fair pricing',
        body: 'Switched from a direct digital brand to Wawanesa through a broker. Saved $35/month.',
        author_city: 'Ottawa',
        vehicle: '2022 Subaru Outback',
        monthly_premium: 195,
        author_name: 'Jonathan K.',
        author_email: 'jonathan.k@example.com'
      })
    });
    const jsonSubmitReview = await submitReviewRes.json();
    if (!jsonSubmitReview.success) {
      throw new Error(`Review submission failed: ${jsonSubmitReview.error}`);
    }

    // Verify Wawanesa updated stats
    const updatedWawanesa = jsonSubmitReview.data.insurer;
    if (updatedWawanesa.total_reviews !== 1 || updatedWawanesa.overall_rating !== 4.5) {
      throw new Error(`Expected Wawanesa 1 review and 4.5 rating, got ${updatedWawanesa.total_reviews} reviews and ${updatedWawanesa.overall_rating}`);
    }
    if (updatedWawanesa.rating_claims !== null) {
      throw new Error(`Claims rating should be null for review without accident, got ${updatedWawanesa.rating_claims}`);
    }
    console.log('  [PASS] Voluntary review submission & mathematical stats calculation verified.');

    // 6. Test Asking a Question and Posting a Reply
    console.log('Testing Community Q&A Discussions & Replies...');
    const createDiscRes = await fetch(`http://localhost:${port}/api/insurers/wawanesa/discussions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_title: 'Do Wawanesa brokers offer multi-vehicle discounts?',
        question_body: 'Looking to insure two vehicles under one policy. What discount percentage can I expect?',
        author_name: 'David L.',
        author_email: 'david.l@ontariodrivers.org',
        category: 'pricing'
      })
    });
    const jsonCreateDisc = await createDiscRes.json();
    if (!jsonCreateDisc.success || !jsonCreateDisc.data?.id) {
      throw new Error(`Discussion creation failed: ${jsonCreateDisc.error}`);
    }
    const newDiscId = jsonCreateDisc.data.id;

    // Post reply
    const replyRes = await fetch(`http://localhost:${port}/api/discussions/${newDiscId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reply_body: 'Yes, Wawanesa typically offers a 10% to 15% discount when both vehicles are insured on the same policy with identical liability limits.',
        author_name: 'Sarah Broker',
        is_verified_customer: true
      })
    });
    const jsonReply = await replyRes.json();
    if (!jsonReply.success || !jsonReply.data?.id) {
      throw new Error(`Discussion reply failed: ${jsonReply.error}`);
    }
    console.log('  [PASS] Question posting and community replies verified.');

    // 7. Test Helpful Review Voting
    console.log('Testing Review Helpful Voting...');
    const voteRes = await fetch(`http://localhost:${port}/api/reviews/${jsonSubmitReview.data.review_id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_helpful: true,
        voter_hash: 'test-voter-ins62-1'
      })
    });
    const jsonVote = await voteRes.json();
    if (!jsonVote.success || jsonVote.data?.helpful_count !== 1) {
      throw new Error(`Review vote failed: expected helpful_count 1, got ${jsonVote.data?.helpful_count}`);
    }
    console.log('  [PASS] Review helpful voting verified.');

    console.log('\n>>> ALL INS-62 BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! <<<\n');
  } catch (err) {
    console.error('\nTest FAILED:', err);
    process.exitCode = 1;
  } finally {
    // Clean up test review and discussion from Wawanesa so DB stays pristine
    try {
      db.prepare("DELETE FROM reviews WHERE author_city = 'Ottawa' AND vehicle = '2022 Subaru Outback'").run();
      db.prepare("DELETE FROM insurer_discussions WHERE question_title = 'Do Wawanesa brokers offer multi-vehicle discounts?'").run();
      db.prepare("DELETE FROM insurers WHERE id = 'test-dummy'").run();
      // Re-zero Wawanesa
      db.prepare(`
        UPDATE insurers 
        SET total_reviews = 0, overall_rating = NULL, rating_value = NULL, rating_claims = NULL, rating_support = NULL, rating_renewal = NULL, rating_ease = NULL 
        WHERE id = 'wawanesa'
      `).run();
    } catch (e) {}

    server.close();
  }
});
