# InsurCheck Ontario: Insurer Reviews & Editorial Reconciliation Guide

**Document Version:** 1.0  
**Effective Date:** October 2026  
**Scope:** Ontario Property & Casualty (P&C) Automobile Insurance Directory & Rate Transparency  

---

## 1. Executive Overview

This document specifies the data integrity standards, financial scale methodology, editorial evaluation rubric, and review reconciliation logic powering InsurCheck's Ontario Insurer Directory (`/reviews`) and dedicated company profile pages (`/reviews/:slug`).

Prior to this rebuild, consumer review aggregators often suffered from unverified phantom counters (e.g. displaying scores and counters when zero published reviews existed), pre-filled 4-star defaults distorting community feedback, and vague sorting criteria with no financial grounding.

InsurCheck establishes an authoritative standard:
1. **Audited FY2025 Financial Scale**: Ranking insurers by verified Direct Written Premiums (Canada P&C) sourced from official regulatory filings, annual reports, and AM Best disclosures.
2. **True Mathematical Reconciliation**: An insurer with 0 published driver reviews strictly displays **0 reviews** and **"No ratings yet"** (`overall_rating = NULL`).
3. **No Defaulted Star Ratings**: Drivers must explicitly click stars to rate; subcategories are strictly voluntary, and claims ratings are only captured when an actual accident occurred.
4. **Independent Editorial Scores (/10)**: Side-by-side with Community Driver Ratings (/5) across 5 core pillars.
5. **Clear Residual Market Segregation**: Facility Association is identified as Ontario's residual pool of last resort (`is_residual_market: 1`) and separated from commercial carrier rankings.

---

## 2. FY2025 Financial Scale & Revenue Methodology

Carriers are ordered by their audited financial scale in Canadian Property & Casualty insurance. Figures reflect full-year FY2025 Direct Written Premiums (DWP) or parent group Canadian P&C net premiums where personal auto underwriting is consolidated.

### 2.1 Carrier Hierarchy Table

| Carrier | Parent Group / Underwriter | FY2025 Scale (CAD) | Metric & Regulatory Scope | Distribution Channel |
| :--- | :--- | :--- | :--- | :--- |
| **Intact Insurance** | Intact Financial Corporation | **$16.2B** | Direct Written Premiums (P&C Canada) | Independent Brokers |
| **Desjardins Insurance** | Desjardins General Insurance Inc. (DGIG) | **$7.4B** | Direct Premiums Written (P&C Canada) | Direct Online / Exclusive Agents |
| **Aviva Canada** | Aviva plc / Aviva Insurance Co. of Canada | **$6.2B** | Gross Written Premiums (Canada P&C) | Independent Brokers / Direct |
| **TD Insurance** | TD Bank Group / Security National | **$5.8B** | Direct Written Premiums (Canada P&C) | Direct Online / Phone |
| **Wawanesa Insurance** | Wawanesa Mutual Insurance Co. | **$4.6B** | Gross Written Premiums (Canada P&C) | Independent Brokers |
| **Co-operators** | Co-operators General Insurance Company | **$4.5B** | Direct Written Premiums (Canada P&C) | Exclusive Financial Advisors |
| **Beneva** | Beneva Inc. (La Capitale + SSQ) | **$3.3B** | Gross Written Premiums (Canada P&C) | Direct Online / Brokers |
| **Definity (Economical)** | Definity Financial / Economical Mutual | **$4.3B** | Gross Written Premiums (Canada P&C) | Independent Brokers / Sonnet Direct |
| **Travelers Canada** | The Travelers Companies / Travelers Canada | **$2.3B** | Direct Written Premiums (Canada P&C) | Independent Brokers |
| **Allstate Canada** | Allstate Insurance Company of Canada | **$2.2B** | Direct Written Premiums (Canada P&C) | Exclusive Agents / Direct |
| **Northbridge Insurance**| Fairfax Financial Holdings / Northbridge | **$3.6B** | Gross Written Premiums (Canada Commercial/Fleet)| Independent Brokers |
| **Gore Mutual** | Gore Mutual Insurance Company | **$720M** | Direct Written Premiums (Ontario/BC P&C)| Independent Brokers |
| **CAA Insurance** | CAA South Central Ontario / CAA Insurance Co.| **$850M** | Direct Written Premiums (Ontario/Maritimes Auto)| Direct / CAA Clubs / Brokers |
| **Belairdirect** | Intact Financial Corporation | Consolidated in Intact | Direct-to-consumer digital division | Direct Digital App / Phone |
| **Sonnet Insurance** | Definity Financial Corporation | Consolidated in Definity | Direct-to-consumer digital division | Direct Web Portal |
| **Onlia Insurance** | Achmea Canada Holding Inc. / Verassur | **$110M** | Direct Written Premiums (Ontario Auto) | Direct Digital App |
| **Square One Insurance**| Square One Insurance Services Inc. | Broker entity | *Comparable revenue not publicly disclosed* | Direct Online Broker |
| **Facility Association**| Facility Association (Residual Market) | **$950M** | Shared Ontario High-Risk Market Pool | All Licensed Ontario Brokers |

---

## 3. High-Risk Residual Market Treatment (Facility Association)

Facility Association is established under the Ontario *Compulsory Automobile Insurance Act* to guarantee that every licensed driver who cannot obtain auto insurance through commercial private carriers can secure statutory minimum coverage.

- **Flag:** `is_residual_market: 1`
- **Directory Ranking:** Excluded from standard commercial carrier comparisons; listed at the conclusion of rankings with a distinct banner ("Residual High-Risk Market Pool").
- **Consumer Notice:** Clear educational guidance explaining that premiums with Facility Association are significantly higher by statute, and drivers should seek to remediate driving records to return to the standard voluntary market after 1 to 3 claim-free years.

---

## 4. InsurCheck Editorial Score Rubric (/10)

The InsurCheck Editorial Score evaluates carriers independently of driver star ratings, relying on underwriting flexibility, claims turnaround guarantees, and telematics transparency.

### 4.1 Pillars & Weightings

1. **Claims Integrity & Speed (25%)**:
   - Priority collision repair networks with lifetime guarantees (e.g. Intact Rely Network, Aviva Premiere).
   - Emergency response availability, rental car coordination, and direct adjuster access.
2. **Customer Service & Broker Access (20%)**:
   - Support responsiveness across phone, local agent offices, and independent broker representation.
3. **Coverage Options & Endorsements (20%)**:
   - Availability of OPCF 20 (Loss of Use), OPCF 27 (Rental Vehicle Liability), OPCF 43 (Waiver of Depreciation), and specialized rideshare/delivery endorsements.
4. **Rate Stability & Transparency (20%)**:
   - Renewal hike frequency, rating volatility in high-theft FSAs (e.g. Brampton, Mississauga), and clarity of premium adjustments.
5. **Digital App & Self-Service (15%)**:
   - Telematics apps (Ajusto, automerit, My Drive, CAA MyPace), digital pink slips in Apple/Google Wallet, and self-service deductible modifications.

---

## 5. Review Reconciliation & Anti-Distortion Rules

To maintain driver trust:
1. **Mathematical Consistency**:
   - Database queries strictly aggregate published rows: `status = 'published'`.
   - `total_reviews` = `COUNT(*)` of published reviews.
   - `overall_rating` = `ROUND(AVG(rating), 1)`.
   - If `total_reviews == 0`, `overall_rating` is strictly set to `NULL` and displayed as `"No ratings yet"`.
2. **Voluntary Subcategories**:
   - Only `overall_rating` is mandatory on review submission.
   - Subratings (Value, Support, Renewal, Ease) default to `null` and are averaged using SQL `AVG()`, which naturally ignores unselected categories without skewing averages down to 0 or up to 4.
3. **Conditional Claims Scoring**:
   - Claims ratings (`rating_claims`) are only permitted when the reviewer explicitly checks `had_accident === true`.
   - Insurers are not penalized in claims scores by drivers who never filed a claim.
4. **Verified Badging**:
   - Reviews providing a valid email address receive an internal verification flag (`is_verified_email = 1`) and the public badge "Verified Driver". Email addresses are never exposed publicly.
5. **Helpful Voting**:
   - Community members can upvote reviews (`/api/reviews/:id/vote`). Unique voter hashes prevent double-voting.
