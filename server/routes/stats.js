import express from 'express';
import { db } from '../db.js';

export const statsRouter = express.Router();

statsRouter.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM platform_stats').all();
    const stats = {};
    for (const r of rows) {
      stats[r.key] = r.value;
    }
    const countSubmissions = db.prepare('SELECT count(*) as count FROM submissions').get();
    stats.total_submissions = countSubmissions ? countSubmissions.count : 0;

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
