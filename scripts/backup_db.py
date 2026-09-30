import os
import sys
import json
import shutil
import datetime
import hashlib
import subprocess
import requests

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_DIR = os.path.join(BASE_DIR, "backups")
LOCAL_DB = os.path.join(BASE_DIR, "server", "insurcheck.db")
PROD_BASE_URL = os.getenv("PROD_BASE_URL", "https://insurcheck.ca")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "insurcheck2026")
EXPECTED_TOKEN = hashlib.sha256(f"{ADMIN_PASSWORD}:insurcheck_salt_2026".encode("utf-8")).hexdigest()

def ensure_backup_dir():
    os.makedirs(BACKUP_DIR, exist_ok=True)

def backup_local_sqlite():
    if not os.path.exists(LOCAL_DB):
        print(f"[BACKUP] No local SQLite file at {LOCAL_DB} to snapshot.")
        return None
    ensure_backup_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = os.path.join(BACKUP_DIR, f"insurcheck_local_{timestamp}.db")
    shutil.copy2(LOCAL_DB, dest)
    print(f"[BACKUP] Local SQLite snapshotted to {dest}")
    return dest

def backup_live_production():
    ensure_backup_dir()
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"prod_backup_{timestamp}.json")
    latest_file = os.path.join(BACKUP_DIR, "latest_prod_backup.json")

    print(f"[BACKUP] Fetching live data from {PROD_BASE_URL}...")
    backup_data = {
        "timestamp": datetime.datetime.now().isoformat(),
        "prod_base_url": PROD_BASE_URL,
        "stats": None,
        "submissions": [],
        "insurers": [],
        "reviews": {},
        "feedback": [],
        "leads": [],
        "scraped_quotes": []
    }

    try:
        r_stats = requests.get(f"{PROD_BASE_URL}/api/stats", timeout=10)
        if r_stats.status_code == 200:
            backup_data["stats"] = r_stats.json().get("data", {})
    except Exception as e:
        print(f"[BACKUP WARNING] Failed to fetch stats: {e}")

    try:
        r_subs = requests.get(f"{PROD_BASE_URL}/api/submissions", timeout=10)
        if r_subs.status_code == 200:
            backup_data["submissions"] = r_subs.json().get("data", [])
    except Exception as e:
        print(f"[BACKUP WARNING] Failed to fetch submissions: {e}")

    try:
        r_insurers = requests.get(f"{PROD_BASE_URL}/api/insurers", timeout=10)
        if r_insurers.status_code == 200:
            insurers = r_insurers.json().get("data", [])
            backup_data["insurers"] = insurers
            for ins in insurers:
                ins_id = ins.get("id")
                if not ins_id:
                    continue
                try:
                    r_rev = requests.get(f"{PROD_BASE_URL}/api/insurers/{ins_id}/reviews", timeout=8)
                    if r_rev.status_code == 200:
                        backup_data["reviews"][ins_id] = r_rev.json().get("data", [])
                except Exception as e_rev:
                    print(f"[BACKUP WARNING] Failed reviews for {ins_id}: {e_rev}")
    except Exception as e:
        print(f"[BACKUP WARNING] Failed to fetch insurers: {e}")

    # Fetch admin protected data (feedback & leads)
    admin_headers = {"Authorization": f"Bearer {EXPECTED_TOKEN}"}
    try:
        r_fb = requests.get(f"{PROD_BASE_URL}/api/admin/feedback", headers=admin_headers, timeout=10)
        if r_fb.status_code == 200:
            backup_data["feedback"] = r_fb.json().get("data", [])
    except Exception as e:
        print(f"[BACKUP WARNING] Failed to fetch feedback: {e}")

    try:
        r_leads = requests.get(f"{PROD_BASE_URL}/api/admin/leads", headers=admin_headers, timeout=10)
        if r_leads.status_code == 200:
            backup_data["leads"] = r_leads.json().get("data", [])
    except Exception as e:
        print(f"[BACKUP WARNING] Failed to fetch leads: {e}")

    with open(backup_file, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)

    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False)

    sub_count = len(backup_data["submissions"])
    rev_count = sum(len(v) for v in backup_data["reviews"].values())
    fb_count = len(backup_data["feedback"])
    leads_count = len(backup_data["leads"])
    print(f"[BACKUP OK] Production snapshot complete: {sub_count} submissions, {rev_count} reviews, {fb_count} feedback, {leads_count} leads saved to {backup_file}")

    return backup_file

if __name__ == "__main__":
    backup_local_sqlite()
    backup_live_production()
