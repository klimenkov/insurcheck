import express from 'express';
import { db } from '../db.js';

export const insurersRouter = express.Router();

insurersRouter.get('/', (req, res) => {
  try {
    const insurers = db.prepare('SELECT * FROM insurers ORDER BY claims_rating DESC').all();
    res.json({ success: true, data: insurers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

insurersRouter.get('/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews WHERE insurer_id = ? ORDER BY id DESC').all(req.params.id);
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
