import express from 'express';
import { db } from '../db.js';
import { sendToGoogleSheets } from '../services/googleSheetsWebhook.js';

export const contactRouter = express.Router();

// Create contact_messages table if not exists
db.exec(`
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);
`);

// POST /api/contact
contactRouter.post('/', (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const dateStr = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO contact_messages (created_at, name, email, message)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(dateStr, name, email, message);

    sendToGoogleSheets('contact', {
      id: result.lastInsertRowid,
      created_at: dateStr,
      name,
      email,
      message
    }, `Contact message from ${name} (${email})`).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});
