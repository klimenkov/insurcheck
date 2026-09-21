import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

LINEAR_API_KEY = os.getenv("LINEAR_API_KEY")
LINEAR_URL = "https://api.linear.app/graphql"

def query_linear(query, variables=None):
    headers = {
        "Authorization": LINEAR_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    res = requests.post(LINEAR_URL, headers=headers, json=payload)
    data = res.json()
    if "errors" in data:
        raise Exception(f"Linear API error: {data['errors']}")
    return data.get("data", {})

def get_issue(identifier):
    q = """
    query GetIssue($id: String!) {
      issue(id: $id) {
        id
        identifier
        title
        description
        priority
        state { id name }
      }
    }
    """
    res = query_linear(q, {"id": identifier})
    return res.get("issue")

def get_team_info(team_key="INS"):
    q = """
    query GetTeam($key: String!) {
      teams(filter: { key: { eq: $key } }) {
        nodes {
          id
          key
          name
          states {
            nodes {
              id
              name
              type
            }
          }
        }
      }
    }
    """
    res = query_linear(q, {"key": team_key})
    nodes = res.get("teams", {}).get("nodes", [])
    return nodes[0] if nodes else None

def create_issue(team_id, title, description, priority=3, state_id=None):
    q = """
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
    """
    inp = {
        "teamId": team_id,
        "title": title,
        "description": description,
        "priority": priority
    }
    if state_id:
        inp["stateId"] = state_id
    res = query_linear(q, {"input": inp})
    return res.get("issueCreate", {}).get("issue")

def update_issue(issue_id, title=None, description=None, priority=None, state_id=None):
    q = """
    mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
    """
    inp = {}
    if title is not None:
        inp["title"] = title
    if description is not None:
        inp["description"] = description
    if priority is not None:
        inp["priority"] = priority
    if state_id is not None:
        inp["stateId"] = state_id

    res = query_linear(q, {"id": issue_id, "input": inp})
    return res.get("issueUpdate", {}).get("issue")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        issue = get_issue(sys.argv[1])
        print(json.dumps(issue, indent=2, ensure_ascii=False))
    else:
        team = get_team_info()
        print(f"Team: {team['name']} ({team['key']}, ID: {team['id']})")
        print("States:")
        for s in team['states']['nodes']:
            print(f"  - {s['name']} (ID: {s['id']}, type: {s['type']})")
