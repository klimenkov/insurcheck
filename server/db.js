import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'insurcheck.db');

export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS insurers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_color TEXT NOT NULL,
  avg_monthly INTEGER NOT NULL,
  claims_rating REAL NOT NULL,
  support_rating REAL NOT NULL,
  price_rating REAL NOT NULL,
  total_reviews INTEGER DEFAULT 0,
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  direct_online INTEGER DEFAULT 1,
  broker_only INTEGER DEFAULT 0,
  website TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  insurer_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  rating REAL NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  had_accident INTEGER DEFAULT 0,
  claims_experience TEXT,
  payout_speed TEXT,
  author_city TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  monthly_premium INTEGER NOT NULL,
  FOREIGN KEY (insurer_id) REFERENCES insurers(id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  fsa TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  driver_age INTEGER NOT NULL,
  driver_profile TEXT NOT NULL,
  years_licensed INTEGER NOT NULL,
  clean_record INTEGER DEFAULT 1,
  provider_name TEXT NOT NULL,
  monthly_premium INTEGER NOT NULL,
  coverage_type TEXT NOT NULL,
  comment TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  current_premium INTEGER NOT NULL,
  estimated_savings INTEGER NOT NULL,
  status TEXT DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS platform_stats (
  key TEXT PRIMARY KEY,
  value REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS scraped_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  persona_id TEXT NOT NULL,
  persona_label TEXT NOT NULL,
  fsa TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  driver_age INTEGER NOT NULL,
  license_class TEXT NOT NULL,
  clean_record INTEGER DEFAULT 1,
  monthly_premium INTEGER NOT NULL,
  coverage_type TEXT NOT NULL,
  raw_payload TEXT
);
`);

console.log('Database initialized at:', dbPath);
