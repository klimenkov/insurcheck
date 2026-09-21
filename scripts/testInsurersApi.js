import express from 'express';
import { insurersRouter } from '../server/routes/insurers.js';
import { db } from '../server/db.js';

const app = express();
app.use(express.json());
app.use('/api/insurers', insurersRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    // 1. Check insurers list
    const resInsurers = await fetch(`http://localhost:${port}/api/insurers`);
    const jsonInsurers = await resInsurers.json();
    console.log(`Insurers count: ${jsonInsurers.data?.length}`);
    const sq = jsonInsurers.data?.find(i => i.id === 'squareone');
    if (!sq) throw new Error('Square One not in /api/insurers response');
    console.log('Square One in /api/insurers:', sq.name, 'Overall rating:', sq.overall_rating);

    // 2. Check Square One reviews
    const resReviews = await fetch(`http://localhost:${port}/api/insurers/squareone/reviews`);
    const jsonReviews = await resReviews.json();
    console.log(`Square One reviews count: ${jsonReviews.data?.length}`);
    if (jsonReviews.data?.length === 0) throw new Error('No reviews for Square One');
    const firstRev = jsonReviews.data[0];
    console.log('Sample review:', {
      title: firstRev.title,
      rating: firstRev.rating,
      created_at: firstRev.created_at,
      author_city: firstRev.author_city
    });

    if (!firstRev.created_at) throw new Error('created_at missing from review!');

    console.log('All Insurers & Reviews API tests PASSED!');
  } catch (err) {
    console.error('Test FAILED:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
