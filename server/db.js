import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initialStats } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPath = fs.existsSync('/data')
  ? '/data/insurcheck.db'
  : path.join(__dirname, 'insurcheck.db');

export const dbPath = process.env.DB_PATH || defaultPath;

// Ensure parent directory exists (critical for persistent volume mounts like /data)
try {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
} catch (e) {
  console.warn('Could not create directory for database:', e.message);
}

// If persistent volume /data is mounted and target DB doesn't exist yet, migrate existing DB if present
if (fs.existsSync('/data') && dbPath.startsWith('/data') && !fs.existsSync(dbPath)) {
  const localDb = path.join(__dirname, 'insurcheck.db');
  if (fs.existsSync(localDb)) {
    try {
      fs.copyFileSync(localDb, dbPath);
      console.log(`Migrated initial database from ${localDb} to persistent ${dbPath}`);
    } catch (e) {
      console.warn('Could not copy local DB to persistent mount:', e.message);
    }
  }
}

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

CREATE TABLE IF NOT EXISTS benchmark_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  rating INTEGER NOT NULL,
  is_reasonable TEXT,
  matches_knowledge TEXT,
  use_before_renew TEXT,
  use_before_buy TEXT,
  trust_comment TEXT,
  postal_code TEXT,
  vehicle TEXT,
  benchmark_rate INTEGER,
  current_premium INTEGER
);

CREATE TABLE IF NOT EXISTS check_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  fsa TEXT,
  vehicle TEXT,
  is_estimating INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS broker_launch_waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS insurer_discussions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  insurer_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  user_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  FOREIGN KEY (insurer_id) REFERENCES insurers(id)
);

CREATE TABLE IF NOT EXISTS discussion_replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  discussion_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  user_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  body TEXT NOT NULL,
  is_staff INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  FOREIGN KEY (discussion_id) REFERENCES insurer_discussions(id)
);

CREATE TABLE IF NOT EXISTS review_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  voter_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(target_type, target_id, voter_key)
);

CREATE TABLE IF NOT EXISTS brokerages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  territories TEXT DEFAULT '["all"]',
  status TEXT DEFAULT 'approved',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS broker_users (
  id TEXT PRIMARY KEY,
  brokerage_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  token TEXT NOT NULL,
  role TEXT DEFAULT 'agent',
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  FOREIGN KEY (brokerage_id) REFERENCES brokerages(id)
);

CREATE TABLE IF NOT EXISTS marketplace_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  driver_age INTEGER NOT NULL,
  years_licensed INTEGER NOT NULL,
  clean_record INTEGER DEFAULT 1,
  coverage_type TEXT DEFAULT 'Standard',
  current_premium INTEGER,
  benchmark_rate INTEGER NOT NULL,
  estimated_savings INTEGER DEFAULT 0,
  renewal_timeline TEXT NOT NULL,
  discounts TEXT DEFAULT '[]',
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_pref TEXT DEFAULT 'phone',
  consent_contact INTEGER NOT NULL DEFAULT 1,
  consent_timestamp TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  claimed_by_brokerage_id TEXT,
  claimed_by_user_id TEXT,
  claimed_at TEXT,
  contacted_at TEXT,
  resolved_at TEXT,
  resolution_status TEXT,
  resolution_notes TEXT,
  lead_price_nominal INTEGER DEFAULT 15,
  FOREIGN KEY (claimed_by_brokerage_id) REFERENCES brokerages(id)
);

CREATE TABLE IF NOT EXISTS lead_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  event_type TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES marketplace_leads(id)
);
`);

// Migration helper for new rating dimensions and verified profiles (INS-62)
const addCol = (table, col, typeDef) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${typeDef};`);
  } catch (err) {
    // Column already exists
  }
};

addCol('insurers', 'overall_rating', 'REAL DEFAULT NULL');
addCol('insurers', 'rating_value', 'REAL DEFAULT NULL');
addCol('insurers', 'rating_claims', 'REAL DEFAULT NULL');
addCol('insurers', 'rating_support', 'REAL DEFAULT NULL');
addCol('insurers', 'rating_renewal', 'REAL DEFAULT NULL');
addCol('insurers', 'rating_ease', 'REAL DEFAULT NULL');

addCol('insurers', 'fy2025_revenue_cad', 'REAL DEFAULT NULL');
addCol('insurers', 'revenue_formatted', 'TEXT DEFAULT NULL');
addCol('insurers', 'revenue_metric', 'TEXT DEFAULT NULL');
addCol('insurers', 'revenue_source_url', 'TEXT DEFAULT NULL');
addCol('insurers', 'revenue_date', 'TEXT DEFAULT NULL');
addCol('insurers', 'customer_count', 'TEXT DEFAULT NULL');
addCol('insurers', 'customer_count_scope', 'TEXT DEFAULT NULL');
addCol('insurers', 'customer_source_url', 'TEXT DEFAULT NULL');
addCol('insurers', 'parent_group', 'TEXT DEFAULT NULL');
addCol('insurers', 'underwriting_entity', 'TEXT DEFAULT NULL');
addCol('insurers', 'distribution_channel', 'TEXT DEFAULT NULL');
addCol('insurers', 'editorial_score', 'REAL DEFAULT NULL');
addCol('insurers', 'editorial_claims', 'REAL DEFAULT NULL');
addCol('insurers', 'editorial_service', 'REAL DEFAULT NULL');
addCol('insurers', 'editorial_coverage', 'REAL DEFAULT NULL');
addCol('insurers', 'editorial_transparency', 'REAL DEFAULT NULL');
addCol('insurers', 'editorial_digital', 'REAL DEFAULT NULL');
addCol('insurers', 'verdict', 'TEXT DEFAULT NULL');
addCol('insurers', 'who_should_consider', 'TEXT DEFAULT NULL');
addCol('insurers', 'who_should_avoid', 'TEXT DEFAULT NULL');
addCol('insurers', 'strengths', 'TEXT DEFAULT NULL');
addCol('insurers', 'limitations', 'TEXT DEFAULT NULL');
addCol('insurers', 'claims_procedure', 'TEXT DEFAULT NULL');
addCol('insurers', 'discounts_telematics', 'TEXT DEFAULT NULL');
addCol('insurers', 'is_residual_market', 'INTEGER DEFAULT 0');
addCol('insurers', 'last_reviewed_date', 'TEXT DEFAULT NULL');
addCol('insurers', 'slug', 'TEXT DEFAULT NULL');

addCol('reviews', 'rating_value', 'REAL DEFAULT NULL');
addCol('reviews', 'rating_claims', 'REAL DEFAULT NULL');
addCol('reviews', 'rating_support', 'REAL DEFAULT NULL');
addCol('reviews', 'rating_renewal', 'REAL DEFAULT NULL');
addCol('reviews', 'rating_ease', 'REAL DEFAULT NULL');
addCol('reviews', 'user_email', 'TEXT DEFAULT NULL');
addCol('reviews', 'display_name', 'TEXT DEFAULT NULL');
addCol('reviews', 'author_name', 'TEXT DEFAULT NULL');
addCol('reviews', 'author_email', 'TEXT DEFAULT NULL');
addCol('reviews', 'author_display_name', 'TEXT DEFAULT NULL');
addCol('reviews', 'is_verified_customer', 'INTEGER DEFAULT 0');
addCol('reviews', 'is_verified_email', 'INTEGER DEFAULT 1');
addCol('reviews', 'status', 'TEXT DEFAULT "published"');
addCol('reviews', 'helpful_count', 'INTEGER DEFAULT 0');

addCol('insurer_discussions', 'author_name', 'TEXT DEFAULT NULL');
addCol('insurer_discussions', 'author_email', 'TEXT DEFAULT NULL');
addCol('discussion_replies', 'author_name', 'TEXT DEFAULT NULL');
addCol('discussion_replies', 'author_email', 'TEXT DEFAULT NULL');

// Submissions Discount Normalization Columns (INS-64)
addCol('submissions', 'discounts', 'TEXT DEFAULT "[]"');
addCol('submissions', 'discount_status', 'TEXT DEFAULT "legacy_unknown"');
addCol('submissions', 'other_discount_description', 'TEXT DEFAULT NULL');
addCol('submissions', 'estimated_premium_before_discounts', 'REAL DEFAULT NULL');
addCol('submissions', 'normalization_status', 'TEXT DEFAULT "legacy_assumed_base"');
addCol('submissions', 'calculation_version', 'TEXT DEFAULT NULL');
addCol('submissions', 'applied_discount_factors', 'TEXT DEFAULT NULL');

// Safe, non-destructive platform stats initialization
export function ensureStatsInitialized() {
  const initStat = db.prepare(`
    INSERT INTO platform_stats (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO NOTHING
  `);

  const checksFloor = (initialStats && typeof initialStats.total_checks_run === 'number')
    ? initialStats.total_checks_run
    : 12;

  initStat.run('total_money_saved', 2700);
  initStat.run('avg_monthly_overpay', 0);
  initStat.run('total_checks_run', checksFloor);

  // If total_checks_run was inflated by legacy mock seed numbers (> 500), restore real baseline count
  const row = db.prepare("SELECT value FROM platform_stats WHERE key = 'total_checks_run'").get();
  if (row && row.value > 500) {
    db.prepare("UPDATE platform_stats SET value = ? WHERE key = 'total_checks_run'").run(checksFloor);
    db.prepare("UPDATE platform_stats SET value = 2700 WHERE key = 'total_money_saved'").run();
    db.prepare("UPDATE platform_stats SET value = 0 WHERE key = 'avg_monthly_overpay'").run();
  } else if (row && row.value < checksFloor) {
    db.prepare("UPDATE platform_stats SET value = ? WHERE key = 'total_checks_run'").run(checksFloor);
  }
}

// Run stats initialization immediately
ensureStatsInitialized();

console.log('Database initialized at:', dbPath);
