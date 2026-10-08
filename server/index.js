// InsurCheck API Server
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkRouter } from './routes/check.js';
import { submissionsRouter } from './routes/submissions.js';
import { insurersRouter, reviewsRouter, discussionsRouter } from './routes/insurers.js';
import { leadsRouter } from './routes/leads.js';
import { statsRouter } from './routes/stats.js';
import { scrapedQuotesRouter } from './routes/scrapedQuotes.js';
import { territoriesRouter } from './routes/territories.js';
import { contactRouter } from './routes/contact.js';
import { adminRouter } from './routes/admin.js';
import { feedbackRouter } from './routes/feedback.js';
import { marketplaceRouter } from './routes/marketplace.js';
import fs from 'node:fs';
import { dbPath } from './db.js';
import { ensureQuotesPopulated } from './seedQuotes.js';
import { ensureMarketplacePopulated } from './seedMarketplace.js';
import {
  ensureInsurersPopulated,
  ensureReviewsPopulated,
  ensureDiscussionsPopulated,
  ensureSubmissionsPopulated,
  ensureFeedbackPopulated,
  ensureLeadsPopulated
} from './seedInsurers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure insurers, quotes, reviews, discussions, submissions, feedback, leads, marketplace and rate dynamics are populated in SQLite
ensureInsurersPopulated();
ensureQuotesPopulated();
ensureReviewsPopulated();
ensureDiscussionsPopulated();
ensureSubmissionsPopulated();
ensureFeedbackPopulated();
ensureLeadsPopulated();
ensureMarketplacePopulated();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/check', checkRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/scraped-quotes', scrapedQuotesRouter);
app.use('/api/territories', territoriesRouter);
app.use('/api/insurers', insurersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/marketplace', marketplaceRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbPath,
    dataMounted: fs.existsSync('/data'),
    dbExists: fs.existsSync(dbPath),
    dbSize: fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0
  });
});

// Serve client in production if built
const distPath = path.join(__dirname, '../client/dist');

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(distPath, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(distPath, 'robots.txt'));
});

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('InsurCheck API Server Running. Start Vite client for development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚗 InsurCheck Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`===========================================`);
});
