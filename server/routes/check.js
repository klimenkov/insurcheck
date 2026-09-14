import express from 'express';
import { evaluateInsurance } from '../engine/model.js';
import { db } from '../db.js';

export const checkRouter = express.Router();

checkRouter.post('/', (req, res) => {
  try {
    const result = evaluateInsurance(req.body);

    // Update check count stat
    db.prepare("UPDATE platform_stats SET value = value + 1 WHERE key = 'total_checks_run'").run();

    if (result.monthlySavings > 0) {
      db.prepare("UPDATE platform_stats SET value = value + ? WHERE key = 'total_money_saved'").run(result.annualSavings);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error evaluating insurance:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});
