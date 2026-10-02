#!/usr/bin/env python3
"""
Sync existing InsurCheck production or local records to Google Sheets webhook.
Usage:
  python scripts/sync_to_google_sheets.py <WEBHOOK_URL>
  or (reads GOOGLE_SHEETS_WEBHOOK_URL from .env):
  python scripts/sync_to_google_sheets.py
"""

import os
import sys
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

WEBHOOK_URL = sys.argv[1] if len(sys.argv) > 1 else os.getenv("GOOGLE_SHEETS_WEBHOOK_URL")
PROD_BASE_URL = os.getenv("PROD_BASE_URL", "https://insurcheck.ca")

def sync():
    if not WEBHOOK_URL or not WEBHOOK_URL.startswith("http"):
        print("[ERROR] Please provide a valid Google Apps Script Webhook URL as argument or set GOOGLE_SHEETS_WEBHOOK_URL in .env")
        sys.exit(1)

    print(f"[SYNC] Connecting to Google Sheets Webhook: {WEBHOOK_URL[:45]}...")
    print(f"[SYNC] Fetching live data from {PROD_BASE_URL}...")

    # 1. Submissions
    try:
        r = requests.get(f"{PROD_BASE_URL}/api/submissions", timeout=10)
        subs = r.json().get("data", [])
        print(f"[SYNC] Found {len(subs)} submissions on production.")
        # Send in chronological order
        for sub in reversed(subs):
            payload = {
                "timestamp": sub.get("created_at") or "",
                "eventType": "submission",
                "summary": f"{sub.get('vehicle_year')} {sub.get('vehicle_make')} {sub.get('vehicle_model')} in {sub.get('fsa')} - ${sub.get('monthly_premium')}/mo",
                "payload": sub
            }
            res = requests.post(WEBHOOK_URL, json=payload, timeout=10)
            print(f"  -> Synced submission ID {sub.get('id')}: {res.status_code}")
            time.sleep(0.5)
    except Exception as e:
        print(f"[ERROR] Failed syncing submissions: {e}")

    # 2. Insurers and reviews
    try:
        r_ins = requests.get(f"{PROD_BASE_URL}/api/insurers", timeout=10)
        insurers = r_ins.json().get("data", [])
        total_revs = 0
        for ins in insurers:
            ins_id = ins.get("id")
            r_rev = requests.get(f"{PROD_BASE_URL}/api/insurers/{ins_id}/reviews", timeout=8)
            revs = r_rev.json().get("data", [])
            for rev in revs:
                total_revs += 1
                payload = {
                    "timestamp": rev.get("created_at") or "",
                    "eventType": "review",
                    "summary": f"{rev.get('rating')}★ review for {ins_id}: {rev.get('title')}",
                    "payload": rev
                }
                res = requests.post(WEBHOOK_URL, json=payload, timeout=10)
                print(f"  -> Synced review ID {rev.get('id')} ({ins_id}): {res.status_code}")
                time.sleep(0.5)
        print(f"[SYNC] Synced {total_revs} reviews.")
    except Exception as e:
        print(f"[ERROR] Failed syncing reviews: {e}")

    print("\n[OK] Historical synchronization to Google Sheets complete!")

if __name__ == "__main__":
    sync()
