import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__)))
import linear_helper

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

team = linear_helper.get_team_info("INS")
if not team:
    print("Could not find team INS")
    sys.exit(1)

team_id = team["id"]
in_progress_state_id = "aa9d15ac-896f-4502-b0db-7dbb5e5793ec"

title = "Insurer Suitability & Best-Fit Matching Algorithm (Top 12 Ontario Providers)"

description = """**Objective**
Implement an algorithmic Insurer Suitability & Matching engine (INS-66) that analyzes driver profile, vehicle, territory, discounts, and coverage preferences to determine which of Ontario's Top 12 largest auto insurance providers offer the best actuarial fit and cost-to-value proposition.

**Top 12 Insurers Catalog & Appetite Profiles:**
1. **Intact Insurance** ($16.2B): Largest Canadian network, #1 claims speed and direct repair reliability. Best for drivers seeking maximum claims peace-of-mind via broker.
2. **Desjardins Insurance** ($7.4B): Leader in telematics (Ajusto up to 25%), competitive suburban home/auto bundle. Best for tech-open drivers and suburban families.
3. **Aviva Canada** ($6.8B): Rideshare/commercial-use endorsement, strong broker presence. Best for multi-vehicle households and gig/rideshare drivers.
4. **TD Insurance** ($5.9B): Strongest alumni, university, and professional association group rates. Best for professionals and existing TD banking clients.
5. **Wawanesa Insurance** ($4.8B): Mutual insurer with competitive rates outside extreme GTA zones and high broker customer retention.
6. **Co-operators** ($4.5B): Dedicated agent network, exceptional client service, strong family bundle savings.
7. **Economical Insurance / Definity** ($4.4B): Comprehensive broker distribution, well-balanced standard vehicle coverage.
8. **Belairdirect** ($4.2B): 100% digital self-serve, Automerit app discount. Best for drivers wanting fast digital management without broker fees.
9. **Travelers Canada** ($1.9B): Strong property+auto packaging, high reliability for established suburban drivers.
10. **Allstate Insurance** ($1.6B): Drivewise telematics, dedicated community agents, excellent safe driving rewards.
11. **CAA Insurance** ($1.2B): CAA MyPace pay-per-km and 20% CAA member savings. #1 choice for low-mileage, retirees, and CAA members.
12. **Gore Mutual** ($720M): Oldest Canadian mutual, strong competitive rates in Southwestern and Eastern Ontario.

**Matching Dimensions (Deterministic Composite 0–100% Score):**
1. **Driver Experience & Age Index:** Young drivers (<25) vs Established (25–55) vs Mature/Senior (55+).
2. **Territory Risk Compatibility:** High claim frequency/theft FSAs (Brampton, Scarborough) vs suburban/rural low-risk territories.
3. **Vehicle Profile:** EV/Tesla, Luxury, Family SUV, or standard commuter.
4. **Discount Synergy:** Telematics driving app, home bundle, winter tires, multi-car.
5. **Distribution & Service Fit:** 100% Direct Digital vs Independent Broker vs Dedicated Agent.

**Deliverables:**
1. `server/engine/suitability.js`: Actuarial scoring model computing match score, top fit rank, and customized "Why this fits you" reasons.
2. API Integration (`server/engine/model.js` & `server/routes/check.js`): Return top 3 matched insurers in `/api/check` response.
3. Frontend UI (`ResultCard.jsx`): Interactive "Top Insurer Matches for Your Profile" card with percentage match badges, channel icons, key pros, and direct broker connect trigger.
4. Automated verification: `scripts/testIns66.js` and `npm test` verification.
"""

created_issue = linear_helper.create_issue(
    team_id=team_id,
    title=title,
    description=description,
    priority=2, # High
    state_id=in_progress_state_id
)

print("Created issue:", created_issue)
