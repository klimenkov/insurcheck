# InsurCheck 🚗🇨🇦
### Ontario Auto Insurance Sanity-Check & Rate Benchmark Platform

> **"Stop guessing if you're getting ripped off. Check your Ontario auto insurance rate in 60 seconds — without 40 tedious forms or spam calls."**

In Ontario (especially the Greater Toronto Area), auto insurance is notorious for extreme price variations, annual renewal rate hikes, and lack of transparency. **InsurCheck** solves this by offering a fast 6-question sanity check against crowdsourced benchmarks, insurer claims-satisfaction reviews, and a broker savings pipeline.

---

## Features
- ⚡ **60-Second Sanity Check**: Compare your current monthly premium with regional Ontario benchmarks (Brampton, Mississauga, Toronto, Markham, Ottawa, etc.).
- 📊 **3-Tier Coverage Estimates**: Realistic price bands for *Minimum Liability (1M)*, *Standard Coverage*, and *Comprehensive*.
- 🎯 **Confidence / Reliability Score**: Displays data density and sample size for your specific vehicle and postal code (FSA).
- 👥 **Crowdsourced Rate Database**: See what real Ontario drivers with your car are paying right now.
- ⭐ **Claims & Support Reviews**: Honest community ratings on claims payouts (ДТП experience), adjuster turnaround, and customer support for Intact, Belairdirect, Desjardins, Aviva, TD Insurance, Sonnet, CAA, and Onlia.
- 💰 **Savings Tracker & Broker Connect**: Live counter of estimated user savings and lead capture for licensed insurance brokers.
- 🔬 **Automated Market Watch & Rate Telemetry**: Multi-step Playwright quote harvesting engine in `scrapers/` querying live carrier actuarial funnels (Square One, etc.) for standardized Ontario driver archetypes.
- ⚖️ **FSRA Actuarial Fair Rate Benchmark**: Independent baseline computed using Ontario Financial Services Regulatory Authority (FSRA) territorial rating matrices, graduated licensing curves, and Équité vehicle theft factors to detect overpayment.
- 📈 **Price Dynamics & Timestamped Snapshots**: Periodic rate snapshots (`created_at`) to track monthly carrier pricing trends, inflation adjustments, and rate filings over time.

---

## Actuarial Methodology & Regulatory Benchmark

For a detailed breakdown of how FSRA Fair Rate is computed, quote capture frequencies, and the upcoming Ontario Territorial Heat Map, see:
👉 **[docs/METHODOLOGY_AND_ROADMAP.md](docs/METHODOLOGY_AND_ROADMAP.md)**

---

## Quick Start

### 1. Prerequisites
- Node.js >= 20 (Node 24 recommended, uses native `node:sqlite`)
- Python 3.10+ (for scraper/modeling tools)

### 2. Install & Seed
```bash
# Install root dependencies
npm install

# Seed the SQLite database with Ontario benchmarks and insurer ratings
npm run seed

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Run Development Server
```bash
npm run dev
```
- Backend API runs on: `http://localhost:5000`
- Frontend UI runs on: `http://localhost:5173`

---

## Architecture
- **Backend**: Node.js + Express + native `node:sqlite` database (`server/insurcheck.db`).
- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons.
- **Parametric Rate Engine**: Ontario FSA regional risk factors + Vehicle theft/loss index + Driver experience curves (`server/engine/model.js`).
- **Scraper Pipeline**: Isolated `scraped_quotes` table strictly separated from crowdsourced submissions (`submissions`).

