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

    # 2. Trigger Render deploy hook
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
