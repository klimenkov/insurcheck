# InsurCheck: Actuarial Methodology, Market Watch & Roadmap

This document outlines the actuarial foundation of InsurCheck, the automated carrier quote harvesting pipeline, and key strategic features including historical price tracking and territorial heat maps.

---

## 1. Automated Carrier Quotes & Price Dynamics Tracking

### 1.1 Ingestion Frequency & Timestamps
Auto insurance rates in Ontario do not change in real-time; insurance carriers adjust their actuarial rating algorithms on a **monthly or quarterly basis** following regulatory review by FSRA.
- **Timestamping**: Every harvested quote stored in `scraped_quotes` includes a strict ISO 8601 timestamp (`created_at`), along with carrier session tokens and reference numbers (e.g. `Quote #PA107256647`).
- **Harvest Schedule**: The multi-step Playwright quote harvester runs on a monthly schedule (or bi-weekly interval) rather than on every user visit. This avoids triggering carrier rate-limit blocks and captures meaningful macro pricing trends.

### 1.2 Tracking Price Dynamics Over Time
- **Historical Snapshots**: Quotes are stored as historical records rather than overwriting existing entries.
- **Price Trend Visualizer**: By plotting `monthly_premium` over consecutive monthly snapshots (`created_at`) for each standardized persona (e.g., Young Brampton, Experienced Toronto), InsurCheck displays:
  - Macro inflation adjustments across Ontario carriers.
  - Quarterly rate hike cycles submitted by insurers to FSRA.
  - Seasonal fluctuations in risk rating.

---

## 2. What is FSRA Fair Rate?

### 2.1 The Regulatory Foundation (FSRA)
The **Financial Services Regulatory Authority of Ontario (FSRA)** is the statutory government agency that regulates all automobile insurance in Ontario. In Ontario:
- Automobile insurance is mandatory for all road vehicles.
- Private insurers (Intact, TD, Aviva, Desjardins, Square One, etc.) cannot arbitrarily set or modify rates.
- Every insurer must submit detailed actuarial rate filings to FSRA for approval before changing consumer prices.

### 2.2 The "Fair Rate" Actuarial Benchmark
The **FSRA Fair Rate** in InsurCheck (`server/engine/model.js`) represents the **actuarially fair price of pure risk**—what a policy *should* cost mathematically based on empirical loss data and regulatory standards, without predatory markups, broker commissions, or punitive carrier surcharges.

### 2.3 Mathematical Formula & Weightings
The actuarial benchmark is calculated using the standard Ontario rating algorithm:

$$\text{Fair Premium} = \text{Base Rate} \times R_{\text{Territory}} \times R_{\text{Vehicle}} \times R_{\text{CarAge}} \times R_{\text{DriverAge}} \times R_{\text{Experience}} \times R_{\text{Record}}$$

1. **Ontario Base Rate ($175/month)**: The province-wide baseline for a neutral adult driver with a full G license and standard policy terms ($2M Liability, Comprehensive & Collision $1,000 deductible, DCPD, and Statutory Accident Benefits).
2. **Territorial Risk Matrix ($R_{\text{Territory}}$)**: Keyed to the first 3 characters of the postal code (Forward Sortation Area, FSA):
   - *Brampton (L6P, L6R, L6T)*: **1.45 – 1.50** (highest collision frequency and legal claim severity in Canada).
   - *Mississauga (L5M, L5B)*: **1.20 – 1.30**.
   - *Downtown Toronto (M5V, M5A)*: **1.05 – 1.15**.
   - *Ottawa (K1P, K2A)*: **0.80 – 0.85** (one of the safest statistical territories in Ontario).
3. **Driver Age & Licensing Relativity ($R_{\text{DriverAge}}$, $R_{\text{Experience}}$)**:
   - Novice G2 driver (Age 20–24): **1.75** (steep risk curve due to historical loss frequency).
   - Prime Experienced driver (Age 35–55, G): **0.95 – 0.98**.
   - Low-mileage Senior (Age 65+): **0.88 – 0.90**.
4. **Vehicle Risk & Équité Theft Factor ($R_{\text{Vehicle}}$)**:
   - *Lexus RX 350*: Équité Association Top-1 stolen vehicle in Canada. Incorporates theft risk surcharge (+30% to comprehensive).
   - *Honda Civic*: High accident frequency tier among younger demographics (factor 1.10).
   - *Subaru Forester / Toyota RAV4*: Standard family crossover risk (1.00 – 1.05).

---

## 3. Ontario Territorial Heat Map (FSA Geo Explorer)

### 3.1 Motivation
In Ontario, geographic location is the single largest determinant of auto insurance premiums. Two identical drivers with identical cars can see premium swings of $200–$400/month simply by living 10 kilometers apart across municipal borders (e.g., Brampton vs. Caledon, or Mississauga vs. Oakville).

### 3.2 Heat Map Implementation Specification
- **Geo Data Source**: Ontario Forward Sortation Areas (FSA) from `server/engine/ontarioData.js`.
- **Color-Coded Risk Tiers**:
  - 🟢 **Green Zone ($110 – $155/mo)**: Ottawa, Kingston, Guelph, rural Eastern/Southwestern Ontario.
  - 🟡 **Yellow/Amber Zone ($170 – $220/mo)**: Downtown Toronto, Oakville, Burlington, London.
  - 🔴 **Red/Crimson Zone ($280 – $500+/mo)**: Brampton, Vaughan, Scarborough, North York.
- **Interactive Features**:
  - FSA Lookup input: Driver enters their postal code to locate their risk tier.
  - Interactive clickable map polygons showing median rate, territorial surcharge, theft index, and top 3 competitive carriers for that zone.
