// InsurCheck API Server
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkRouter } from './routes/check.js';
import { submissionsRouter } from './routes/submissions.js';
import { insurersRouter } from './routes/insurers.js';
import { leadsRouter } from './routes/leads.js';
import { statsRouter } from './routes/stats.js';
import { scrapedQuotesRouter } from './routes/scrapedQuotes.js';
import { territoriesRouter } from './routes/territories.js';
import { contactRouter } from './routes/contact.js';
import { adminRouter } from './routes/admin.js';
import { ensureQuotesPopulated } from './seedQuotes.js';
import { ensureInsurersPopulated } from './seedInsurers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure insurers, quotes and rate dynamics are populated in SQLite
ensureInsurersPopulated();
ensureQuotesPopulated();

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
app.use('/api/leads', leadsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve client in production if built
const distPath = path.join(__dirname, '../client/dist');
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
