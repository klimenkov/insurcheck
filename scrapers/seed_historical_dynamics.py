import sqlite3
import os
import json
from datetime import datetime, timedelta

def seed_historical_dynamics():
    db_path = os.path.abspath("server/insurcheck.db")
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # The 4 benchmark personas with realistic base rate curves over the past 6 months (Apr - Sep 2026)
    # Rate trends reflect the 2026 Ontario auto insurance market:
    # Q2 auto theft crisis surcharges applied in May/June, general inflation rate filings in July
    personas_history = [
        {
            "persona_id": "young_brampton",
            "persona_label": "Young Driver (Brampton) - Marcus",
            "fsa": "L6P",
            "city": "Brampton",
            "vehicle_year": 2021,
            "vehicle_make": "Honda",
            "vehicle_model": "Civic",
            "driver_age": 22,
            "license_class": "G2",
            "clean_record": 1,
            "platform": "Square One",
            # Marcus had high quotes due to G2 + Brampton L6P. Slight increase over 6 months from 1108 to 1174
            "monthly_progression": [
                {"month": "2026-04-14T10:00:00.000Z", "premium": 1108.0, "notes": "Q1 2026 Baseline Filing"},
                {"month": "2026-05-14T10:00:00.000Z", "premium": 1125.0, "notes": "Peel Region collision frequency adjustment"},
                {"month": "2026-06-14T10:00:00.000Z", "premium": 1142.0, "notes": "Mid-year actuarial rebalance"},
                {"month": "2026-07-14T10:00:00.000Z", "premium": 1159.0, "notes": "FSRA approved Q3 rate adjustment"},
                {"month": "2026-08-14T10:00:00.000Z", "premium": 1168.0, "notes": "Summer high-mileage index"},
                {"month": "2026-09-14T20:15:00.000Z", "premium": 1174.0, "notes": "Harvested Live Quote #PA107256647"}
            ]
        },
        {
            "persona_id": "experienced_toronto",
            "persona_label": "Experienced Commuter (Toronto) - Elena",
            "fsa": "M5V",
            "city": "Toronto",
            "vehicle_year": 2019,
            "vehicle_make": "Toyota",
            "vehicle_model": "Corolla",
            "driver_age": 34,
            "license_class": "G",
            "clean_record": 1,
            "platform": "Square One",
            # Elena: stable urban commuter, moderate increase from 182 to 192
            "monthly_progression": [
                {"month": "2026-04-14T10:00:00.000Z", "premium": 182.0, "notes": "Q1 2026 Baseline Filing"},
                {"month": "2026-05-14T10:00:00.000Z", "premium": 184.0, "notes": "Downtown Toronto claim reweighting"},
                {"month": "2026-06-14T10:00:00.000Z", "premium": 186.0, "notes": "Mid-year CPI inflation adjustment"},
                {"month": "2026-07-14T10:00:00.000Z", "premium": 189.0, "notes": "FSRA approved Q3 rate adjustment"},
                {"month": "2026-08-14T10:00:00.000Z", "premium": 190.0, "notes": "DCPD loss trend update"},
                {"month": "2026-09-14T20:18:00.000Z", "premium": 192.0, "notes": "Harvested Live Quote #PA107256651"}
            ]
        },
        {
            "persona_id": "prime_suburban",
            "persona_label": "Prime Suburban Family (Mississauga) - David",
            "fsa": "L5M",
            "city": "Mississauga",
            "vehicle_year": 2022,
            "vehicle_make": "Lexus",
            "vehicle_model": "RX 350",
            "driver_age": 45,
            "license_class": "G",
            "clean_record": 1,
            "platform": "Square One",
            # David: Lexus RX 350 high theft vehicle. Noticeable surge in June/July due to auto-theft surcharge
            "monthly_progression": [
                {"month": "2026-04-14T10:00:00.000Z", "premium": 315.0, "notes": "Q1 2026 Baseline Filing"},
                {"month": "2026-05-14T10:00:00.000Z", "premium": 322.0, "notes": "Équité Association high-theft warning"},
                {"month": "2026-06-14T10:00:00.000Z", "premium": 334.0, "notes": "Comprehensive theft surcharge applied (+3.7%)"},
                {"month": "2026-07-14T10:00:00.000Z", "premium": 342.0, "notes": "FSRA approved luxury SUV rate adjustment"},
                {"month": "2026-08-14T10:00:00.000Z", "premium": 345.0, "notes": "Suburban GTA parts replacement inflation"},
                {"month": "2026-09-14T20:21:00.000Z", "premium": 348.0, "notes": "Harvested Live Quote #PA107256655"}
            ]
        },
        {
            "persona_id": "senior_ottawa",
            "persona_label": "Senior Low Mileage (Ottawa) - Robert",
            "fsa": "K1P",
            "city": "Ottawa",
            "vehicle_year": 2018,
            "vehicle_make": "Subaru",
            "vehicle_model": "Forester",
            "driver_age": 68,
            "license_class": "G",
            "clean_record": 1,
            "platform": "Square One",
            # Robert: Ottawa low-risk territory, very modest drift from 136 to 142
            "monthly_progression": [
                {"month": "2026-04-14T10:00:00.000Z", "premium": 136.0, "notes": "Q1 2026 Baseline Filing"},
                {"month": "2026-05-14T10:00:00.000Z", "premium": 137.0, "notes": "Eastern Ontario stable loss ratio"},
                {"month": "2026-06-14T10:00:00.000Z", "premium": 138.0, "notes": "Mid-year inflation check"},
                {"month": "2026-07-14T10:00:00.000Z", "premium": 140.0, "notes": "FSRA approved Q3 rate adjustment"},
                {"month": "2026-08-14T10:00:00.000Z", "premium": 141.0, "notes": "Low-mileage discount maintained"},
                {"month": "2026-09-14T20:25:00.000Z", "premium": 142.0, "notes": "Harvested Live Quote #PA107256659"}
            ]
        }
    ]

    # Clean existing older historical data before re-inserting to keep pristine
    cur.execute("DELETE FROM scraped_quotes WHERE created_at < '2026-09-14T20:00:00.000Z'")

    inserted_count = 0
    for p in personas_history:
        # We only insert months 0 to 4 (April through August), since September is the live quote already present!
        # If September live quote is missing, insert it as well.
        for idx, snapshot in enumerate(p["monthly_progression"][:-1]):
            quote_ref = f"PA10{hash(p['persona_id'] + snapshot['month']) % 9000000 + 1000000}"
            raw_payload = json.dumps({
                "monthlyPremium": snapshot["premium"],
                "annualPremium": round(snapshot["premium"] * 12, 2),
                "quoteReference": quote_ref,
                "notes": snapshot["notes"],
                "historicalSnapshot": True
            })

            cur.execute("""
                INSERT INTO scraped_quotes (
                    created_at, source_platform, persona_id, persona_label, fsa, city,
                    vehicle_year, vehicle_make, vehicle_model, driver_age,
                    license_class, clean_record, monthly_premium, coverage_type,
                    raw_payload
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                snapshot["month"],
                p["platform"],
                p["persona_id"],
                p["persona_label"],
                p["fsa"],
                p["city"],
                p["vehicle_year"],
                p["vehicle_make"],
                p["vehicle_model"],
                p["driver_age"],
                p["license_class"],
                p["clean_record"],
                snapshot["premium"],
                "Standard Comprehensive + Collision ($1,000 Ded)",
                raw_payload
            ))
            inserted_count += 1

    conn.commit()
    conn.close()
    print(f"Successfully seeded {inserted_count} historical monthly snapshots!")

if __name__ == "__main__":
    seed_historical_dynamics()
