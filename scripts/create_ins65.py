import os
import sys
from dotenv import load_dotenv
import linear_helper

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

team = linear_helper.get_team_info("INS")
if not team:
    print("Could not find team INS")
    sys.exit(1)

team_id = team["id"]
in_progress_state_id = "aa9d15ac-896f-4502-b0db-7dbb5e5793ec"

title = "Insurcheck Broker Marketplace MVP (Closed Pilot)"

description = """**Objective**
Launch a closed pilot B2B2C marketplace connecting Ontario drivers seeking better auto insurance rates with vetted, licensed insurance brokers.

**Core Principles**
1. Independent benchmark: InsurCheck does not quote or bind policies; it calculates the open Estimated Market Benchmark.
2. Exclusive lead claiming: Exactly one broker claims a lead at a time. No simultaneous multi-broker spam calls.
3. 100% resolution guarantee: Every lead reaches a definitive resolution (Claimed/Contacted/Offer/Converted or Closed No Broker).
4. Closed pilot model: Free broker participation for 3–5 brokerage partners to validate activation, contact latency, and conversion.

**Scope & Modules**

**1. Database Schema & Data Architecture (Backend)**
- `brokerages`: id, name, license_number, contact_email, phone, territories, status ('pending', 'approved', 'suspended'), created_at.
- `broker_users`: id, brokerage_id, name, email, password_hash/token, role, status.
- `marketplace_leads`: id, submission_id, postal_code (FSA), city, vehicle_year, vehicle_make, vehicle_model, driver_age, years_licensed, clean_record, current_premium, benchmark_rate, estimated_savings, renewal_timeline, contact_name, contact_email, contact_phone, contact_pref, consent_timestamp, status ('new', 'available', 'backup_queue', 'claimed', 'contacted', 'offer_provided', 'converted', 'closed_no_deal', 'closed_no_broker', 'cancelled'), claimed_by_brokerage_id, claimed_at, resolution_notes, created_at.
- `lead_events`: id, lead_id, actor_type ('user', 'broker', 'admin', 'system'), actor_id, event_type, details, timestamp.

**2. Client-Side Lead Submission Flow (Frontend / Calculator)**
- On results page (`ResultCard.jsx`), replace static waitlist with active CTA: **"Find a broker who may offer you a better deal"**.
- Lead Request Modal:
  - Pre-fills vehicle, postal territory, driver age, licensed years, clean record, current premium vs benchmark.
  - Captures: Driver Name, Contact Email, Phone number, Preferred contact method (Phone / Email / WhatsApp).
  - Renewal timing: Immediate / Within 30 days / 1-3 months / Car shopping.
  - Explicit, un-preselected consent checkboxes for Ontario data processing and disclosure to licensed brokers.
  - Confirmation screen with unique tracking ID.

**3. Broker Portal / Dashboard (Frontend `/broker`)**
- Broker onboarding / invite access with mock/pilot auth.
- **Available Leads Catalog:**
  - Anonymized lead cards displaying vehicle, FSA territory, driver profile, current premium, InsurCheck benchmark, estimated monthly/annual difference, and renewal timeline.
  - Direct identifiers (Name, phone, email) remain STRICTLY HIDDEN prior to claiming.
  - Filters by territory/city, vehicle make, estimated savings, and renewal urgency.
- **Claim Lead Action:**
  - Broker clicks "Claim Lead".
  - System locks lead exclusively to the broker (`claimed_by_brokerage_id`), transitions status to `claimed`.
  - Discloses unlocked driver contact info and launches communication log.
- **Lead Lifecycle Management:**
  - Manage claimed leads: record contact attempts, mark "Contacted", "Offer Provided", "Converted", or "Closed - No Deal" with reason.

**4. Admin Oversight & Backup Queue (Backend `/api/admin/marketplace`)**
- Review and approve broker registrations.
- View entire lifecycle of all leads with full event audit log.
- Backup queue management: manual assignment of unclaimed leads (>12h).
- Automated resolution for unassigned leads (>48h) with status `closed_no_broker`.

**5. Verification & Testing**
- Full automated test suite for lead creation, exclusivity locking, anonymized data masking, and lifecycle transitions.
"""

created_issue = linear_helper.create_issue(
    team_id=team_id,
    title=title,
    description=description,
    priority=2, # High
    state_id=in_progress_state_id
)

print("Created issue:", created_issue)
