import os
import sys
import subprocess
import requests
from dotenv import load_dotenv

load_dotenv()

HOOK_URL = os.getenv("RENDER_DEPLOY_HOOK")

def trigger_deploy():
    # 1. Run automated pre-deploy backup
    print("[DEPLOY] Running pre-deploy data backup...")
    try:
        scripts_dir = os.path.dirname(os.path.abspath(__file__))
        backup_script = os.path.join(scripts_dir, "backup_db.py")
        subprocess.run([sys.executable, backup_script], check=True)
    except Exception as e:
        print(f"[DEPLOY WARNING] Pre-deploy backup encountered error: {e}")

    # 2. Check if server/initialData.js was updated by live backup, commit and push
    try:
        status = subprocess.run(["git", "status", "--porcelain", "server/initialData.js"], capture_output=True, text=True).stdout.strip()
        if status:
            print("[DEPLOY] Live database state updated, committing server/initialData.js...")
            subprocess.run(["git", "add", "server/initialData.js"], check=True)
            subprocess.run(["git", "commit", "-m", "chore(data): auto-sync platform data snapshot before deploy"], check=True)
            subprocess.run(["git", "push", "origin", "main"], check=True)
            print("[DEPLOY] Pushed latest data snapshot to main.")
    except Exception as e:
        print(f"[DEPLOY WARNING] Error auto-committing data snapshot: {e}")

    # 3. Trigger Render deploy hook
    if not HOOK_URL:
        print("ERROR: RENDER_DEPLOY_HOOK is not set in .env")
        return False
    print(f"Triggering Render deploy via deploy hook...")
    res = requests.post(HOOK_URL)
    if res.status_code in (200, 201):
        print("[OK] Render deploy successfully triggered! Check dashboard.render.com for progress.")
        return True
    else:
        print(f"ERROR: Failed to trigger deploy (Status {res.status_code}): {res.text}")
        return False

if __name__ == "__main__":
    trigger_deploy()
