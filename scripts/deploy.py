import os
import requests
from dotenv import load_dotenv

load_dotenv()

HOOK_URL = os.getenv("RENDER_DEPLOY_HOOK")

def trigger_deploy():
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
