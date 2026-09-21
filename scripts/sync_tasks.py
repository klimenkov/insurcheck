import os
import sys
from scripts.linear_helper import get_team_info, create_issue, update_issue, get_issue

def main():
    team = get_team_info('INS')
    team_id = team['id']
    states = {s['name']: s['id'] for s in team['states']['nodes']}
    todo_state_id = states.get('Todo')

    # 1. Update INS-8
    ins8 = get_issue('INS-8')
    if ins8:
        updated_desc = ins8['description'] + """

---
### 📌 Telegram Update (2026-09-21)
- **Chosen Domain:** `insurcheck.ca` (confirmed by Sasha @Paul_Merinque).
- **Registration Process:** Being registered via a local Canadian resident (Sanya) to satisfy CIRA Canadian Presence Requirements.
- **Next Step:** Awaiting registrar confirmation and DNS details to configure CNAME/ALIAS on Render.
"""
        update_issue(ins8['id'], title='Connect Custom Domain (insurcheck.ca)', description=updated_desc)
        print("[OK] Updated INS-8")

    # 2. Create INS-28
    task_28_title = "Add Square One to Supported Insurers & Fix Subtitle Pricing"
    task_28_desc = """## Context
Reported via Telegram chat with @Paul_Merinque:
1. **Missing Insurer:** 'Square One Insurance' is missing from the standardized insurer dropdown and reviews database, even though it serves as one of the baseline comparison references.
2. **Subtitle Pricing Bug:** In the Insurance Reviews / Database tab, the subtitle incorrectly shows pricing text or an unexpected price indicator.

## Acceptance Criteria
- [ ] Add **Square One Insurance** to the canonical Ontario insurers list (`server/data` / dropdowns / filters).
- [ ] Investigate and fix the erroneous price display in the Insurance tab subtitle.
- [ ] Verify that Square One can be selected when submitting renewal rates and writing carrier reviews.
"""
    issue28 = create_issue(team_id, task_28_title, task_28_desc, priority=2, state_id=todo_state_id)
    print(f"[OK] Created {issue28['identifier']}: {issue28['title']} ({issue28['url']})")

    # 3. Create INS-29
    task_29_title = "Display Created Date Timestamp on Insurer Reviews"
    task_29_desc = """## Context
Requested via Telegram chat with @Paul_Merinque:
Currently, carrier review cards on the Insurance Reviews page do not show when the review was written. Drivers and moderators need to see the recency of reviews (e.g., '2 days ago', 'Sept 2026').

## Acceptance Criteria
- [ ] Ensure `createdAt` (ISO timestamp) is stored with each carrier review in the database.
- [ ] Render formatted relative or localized date (e.g., `September 2026` or `2 days ago`) on each review card in the UI.
- [ ] Display the review submission timestamp in the `/admin` moderation portal.
"""
    issue29 = create_issue(team_id, task_29_title, task_29_desc, priority=3, state_id=todo_state_id)
    print(f"[OK] Created {issue29['identifier']}: {issue29['title']} ({issue29['url']})")

if __name__ == "__main__":
    main()
