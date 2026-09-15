"""
InsurCheck Scraper-to-Database Sync Pipeline.
Ingests automated quote JSON artifacts from scrapers/output/
and populates the dedicated `scraped_quotes` table in insurcheck.db,
keeping automated bot data strictly separated from real crowdsourced submissions.
"""

import json
import sqlite3
import sys
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = ROOT_DIR / "server" / "insurcheck.db"
OUTPUT_DIR = Path(__file__).resolve().parent / "output"

def init_db(conn):
    """Ensures the scraped_quotes table exists."""
    conn.execute("""
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
    """)
    conn.commit()

def sync_scraped_quotes():
    print(f"Connecting to database at: {DB_PATH}")
    if not DB_PATH.exists():
        print(f"[ERROR] Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    json_files = list(OUTPUT_DIR.glob("quote_*.json"))
    if not json_files:
        print(f"No scraped quote files found in {OUTPUT_DIR}")
        return

    print(f"Found {len(json_files)} scraped quote artifact(s). Syncing...")

    synced_count = 0
    for file_path in json_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                payload = json.load(f)

            persona = payload.get("persona", {})
            scrape_res = payload.get("scrape_result", {})
            target = scrape_res.get("target", "automated_scraper").title()
            
            # Extract rate: either from effective_rate, monthly_premium, or extracted_base_rates
            effective_rate = scrape_res.get("effective_rate")
            monthly_prem = scrape_res.get("monthly_premium")
            extracted_rates = scrape_res.get("extracted_base_rates", [])
            
            if effective_rate is not None:
                premium = int(round(float(effective_rate)))
            elif monthly_prem is not None:
                premium = int(round(float(monthly_prem)))
            elif extracted_rates:
                premium = int(round(float(extracted_rates[0])))
            else:
                premium = 0

            if premium == 0:
                print(f"  [WARN] Skipping {file_path.name} - no authentic quote rate found.")
                continue

            vehicle = persona.get("vehicle", {})
            fsa = (persona.get("postal_code", "")[:3]).upper()

            # Upsert or check existing by persona_id and source_platform
            existing = conn.execute(
                "SELECT id FROM scraped_quotes WHERE persona_id = ? AND source_platform = ?",
                (persona.get("id"), target)
            ).fetchone()

            if existing:
                conn.execute("""
                    UPDATE scraped_quotes SET
                        created_at = ?,
                        fsa = ?, city = ?, vehicle_year = ?, vehicle_make = ?, vehicle_model = ?,
                        driver_age = ?, license_class = ?, clean_record = ?, monthly_premium = ?,
                        coverage_type = ?, raw_payload = ?
                    WHERE id = ?
                """, (
                    scrape_res.get("timestamp", datetime.now().isoformat()),
                    fsa,
                    persona.get("city", "Ontario"),
                    vehicle.get("year", 2022),
                    vehicle.get("make", "Unknown"),
                    vehicle.get("model", "Unknown"),
                    persona.get("age", 30),
                    persona.get("license_class", "G"),
                    1 if persona.get("history", {}).get("clean_record") else 0,
                    premium,
                    "Standard Coverage",
                    json.dumps(scrape_res),
                    existing[0]
                ))
                conn.commit()
                synced_count += 1
                print(f"  [UPDATED] {persona.get('label')} -> ${premium}/mo from {target} (Table: scraped_quotes)")
                continue

            conn.execute("""
                INSERT INTO scraped_quotes (
                    created_at, source_platform, persona_id, persona_label,
                    fsa, city, vehicle_year, vehicle_make, vehicle_model,
                    driver_age, license_class, clean_record, monthly_premium,
                    coverage_type, raw_payload
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                run_timestamp,
                target,
                persona.get("id", "unknown"),
                persona.get("label", "Standard Persona"),
                fsa,
                persona.get("city", "Ontario"),
                vehicle.get("year", 2022),
                vehicle.get("make", "Unknown"),
                vehicle.get("model", "Unknown"),
                persona.get("age", 30),
                persona.get("license_class", "G"),
                1 if persona.get("history", {}).get("clean_record") else 0,
                premium,
                "Standard Coverage",
                json.dumps(scrape_res)
            ))
            conn.commit()
            synced_count += 1
            print(f"  [SYNCED] {persona.get('label')} -> ${premium}/mo from {target} (Table: scraped_quotes)")

        except Exception as e:
            print(f"  [ERROR] Failed to sync {file_path.name}: {e}")

    # Summary
    total_in_db = conn.execute("SELECT count(*) FROM scraped_quotes").fetchone()[0]
    total_crowdsourced = conn.execute("SELECT count(*) FROM submissions").fetchone()[0]
    conn.close()

    print("\n==========================================")
    print(f"✅ Sync Complete: {synced_count} new quote(s) inserted into `scraped_quotes`.")
    print(f"📊 Total Scraped Quotes in DB: {total_in_db}")
    print(f"👥 Real Crowdsourced Submissions in DB: {total_crowdsourced} (Untouched)")
    print("==========================================")

if __name__ == "__main__":
    sync_scraped_quotes()
