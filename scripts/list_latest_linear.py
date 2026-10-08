import os
import sys
import json
import requests
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_URL = "https://api.linear.app/graphql"

query = """
query {
  issues(first: 30, filter: { team: { key: { eq: "INS" } } }, orderBy: createdAt) {
    nodes {
      identifier
      title
      priority
      priorityLabel
      state {
        name
      }
      createdAt
      updatedAt
    }
  }
}
"""

res = requests.post(LINEAR_URL, headers={"Authorization": LINEAR_API_KEY, "Content-Type": "application/json"}, json={"query": query})
data = res.json()
if "errors" in data:
    print("Error:", data["errors"])
    sys.exit(1)

issues = data.get("data", {}).get("issues", {}).get("nodes", [])
# Sort by identifier descending (numerical part)
def get_num(ident):
    try:
        return int(ident.split('-')[1])
    except:
        return 0

issues_sorted = sorted(issues, key=lambda x: get_num(x['identifier']), reverse=True)

print(f"Total issues fetched: {len(issues_sorted)}\n")
for i in issues_sorted[:15]:
    print(f"[{i['identifier']}] ({i['state']['name']}) - {i['title']} (Priority: {i['priorityLabel']}, Created: {i['createdAt']})")
