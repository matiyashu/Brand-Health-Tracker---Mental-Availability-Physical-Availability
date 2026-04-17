# Fortuna — Brand Health Tracker

**A CBM-compliant brand health tracking platform built by Prima Hanura Akbar.**  
Mental availability · Physical availability · Double Jeopardy normalization · AI-powered CEP generation · Survey distribution — all in one place.

> Built on Ehrenberg-Bass *Better Brand Health* methodology. Designed for brand strategists and insights teams who want rigorous, methodology-first brand tracking — not survey monkey clones.

---

## Quick Start

```bash
git clone https://github.com/matiyashu/Brand-Health-Tracker---Mental-Availability-Physical-Availability.git
cd Brand-Health-Tracker---Mental-Availability-Physical-Availability
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → landing page → **Open Dashboard**

No environment variables needed for demo mode — all data is sample data. Every page is fully functional out of the box.

---

## What This Platform Does

Fortuna is a **Category Buyer Memory (CBM)** brand health tracker. It measures how strongly your brand is linked to buying occasions — called **Category Entry Points (CEPs)** — in the minds of category buyers.

Unlike traditional brand tracking (awareness scores, likeability ratings), Fortuna measures the metrics that actually predict sales growth:

| Metric | Definition |
|---|---|
| **Mental Penetration (MPen)** | % of category buyers who link your brand to ≥1 CEP |
| **Mental Market Share (MMS)** | Your share of all CEP associations in the category |
| **Network Score (NS)** | Average number of CEPs linked per mental buyer |
| **Share of Mind (SoM)** | MMS weighted by CEP quality |
| **Physical Availability** | Channel coverage, portfolio efficiency, distinctive asset prominence |
| **Marketing Reach** | Effective reach × correct brand attribution |
| **WOM** | Positive / negative word of mouth per 100 category buyers |
| **Forecast** | Double jeopardy Law projections, MMS→Sales correlation, AI trend alerts |

---

## The CBM Mantra

Every screen, metric, and formula in Fortuna enforces three principles:

**1. Design for the Category**
CEPs describe category buying occasions — not brand-specific moments. Every brand is benchmarked against the same CEP set.

**2. Analyse for the Buyer**
Non-buyers and light buyers are the primary segment. They are the growth pool. Heavy buyers already prefer you.

**3. Report for the Brand**
All scores are Double Jeopardy (DJ) normalized. Small brands are fairly compared to large ones. Deviation from expected score is what matters, not raw score.

---

## Feature Overview

### Dashboard
Segment-aware command centre. Toggle between **Non-buyers + Light** (default, recruitment focus), **Heavy Buyers** (retention focus), and **Overall** (competitive benchmarking). Each segment shows a CEO-ready insight, full KPI set, and MMS vs SMS gap diagnosis.

### Brand KPIs (Analytics)
Competitive benchmarking across all brands. DJ-normalized bar charts, segment-aware ranking table, and a data requirements checklist.

### Mental Advantage Map
A brand × CEP heatmap showing deviation from DJ-expected scores.
- **DEFEND** (≥+5pp) — mental asset: protect with media spend
- **MAINTAIN** (±4pp) — on-par: continue current activity
- **BUILD** (≤−5pp) — mental gap: target in next campaign brief

```
Expected(brand, CEP) = (Row Total × Column Total) ÷ Grand Total
Deviation = Actual − Expected
```

### Physical Availability
Three-pillar audit:

| Pillar | Measures |
|---|---|
| **Presence** | Channel coverage % vs category norm (branches, ATM, online, agent banking) |
| **Portfolio** | SKU contribution, penetration efficiency, duplication of purchase gaps |
| **Prominence** | Fame × Uniqueness matrix for distinctive assets; rented prominence tracker |

Includes segment-aware Gap Analysis (MMS vs SMS diagnosis per segment).

### Marketing Reach
- **Effective Reach** — de-branded stimulus, measured against category buyer base
- **Correct Branding %** — unprompted brand recall after ad exposure
- **Branding Ratio** — Branded ÷ Noticed (below 60% flags "vampire creative")

### WOM Tracker
- PWOM and NWOM per 100 category buyers (binary format, not NPS)
- Net WOM = PWOM − NWOM; WOM Ratio = PWOM ÷ NWOM (>4× is strong)
- Competitive wave-on-wave trend chart

### Forecast Engine (5 methods)

| Tab | Method |
|---|---|
| **DJ Forecast** | Double Jeopardy scatter plot + scenario builder |
| **CEP Expected Scores** | Full brand × CEP Actual / Expected / Deviation matrix |
| **MMS → Sales** | MMS as leading indicator of SMS (r=0.83, 1–2 quarter lag) |
| **AI Predictions** | Media spend simulator, category twin benchmarks, trend alerts |
| **Growth Potential** | Non-buyer MPen waterfall, recruitment vs NS priority |

### CEP Builder
7W framework (Who, What, When, Where, Why, With What, With Whom) for building CBM-compliant attribute sets. Live composition meter enforces 60–70% CEPs. Wording linter flags superlatives, brand-specific phrasing, and duplicate entries.

### AI CEP Generator (Phase 5)
Powered by **Anthropic Claude**. Two modes:
- **Generate** — produces a CBM-compliant CEP portfolio tailored to your category and country, covering all 7W dimensions with correct composition mix
- **Critique** — audits your existing CEPs for wording violations, composition failures, and missing dimensions

Works in demo mode (returns sample CEPs) without an API key.

### Survey Builder (17-Block Library)
Block-based survey canvas with 17 pre-built question blocks locked to CBM methodology:
- Core blocks (mandatory) cannot be removed
- Non-core blocks are draggable
- Wording cannot be modified in ways that break compliance
- Supports CSV template download and results upload with AI analysis

### Survey Distribution (Phase 6)
Send survey invitations directly from Fortuna via:

| Channel | Provider | Config |
|---|---|---|
| **Email** | Resend (primary) | `RESEND_API_KEY` |
| **Email fallback** | nodemailer SMTP | `SMTP_HOST/USER/PASS` |
| **WhatsApp** | Meta Cloud API | `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` |

Features: CSV recipient import (name, email, phone), channel selector, batch sending, delivery receipts via webhook, branded email template.

### Exportable Reports (Phase 4)
Download branded reports directly from the platform:

| Format | Contents |
|---|---|
| **PPTX** | 6-slide deck: Cover, KPI Scorecard, Mental Advantage Map, WOM, Reach, Methodology |
| **PDF** | Executive summary, full KPI table, mental advantage map, WOM table |

Both formats pull live data from the DB or fall back to demo data automatically.

### Help & Manual
Full in-app product manual covering every page, every metric, and every formula — including CBM methodology reference, FAQ, and step-by-step data entry guides.

### Settings
Theme configuration, integration status panel, and data management tools.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS v3, custom `neon-green` (#0FA958) theme |
| Charts | Recharts (Bar, Line, Scatter, Pie) |
| State | React Context (segment toggle, global state) |
| Icons | Lucide React |
| API | tRPC v10 + @tanstack/react-query v4 (type-safe) |
| Database | PostgreSQL via Prisma v5 (ORM) |
| Auth | Clerk v4 (optional — app runs in demo mode without keys) |
| Analytics Engine | Python FastAPI microservice (MPen, MMS, NS, SoM, DJ normalization) |
| AI | Anthropic Claude (`claude-opus-4-6`) — CEP generation and critique |
| Email | Resend (primary) + nodemailer SMTP (fallback) |
| WhatsApp | Meta WhatsApp Business Cloud API v19.0 |
| Reports | pptxgenjs (PPTX) + Puppeteer (PDF) |
| Excel upload | xlsx package |
| CI/CD | GitHub Actions (lint, build, pytest, CBM formula contract guard) |

---

## Repository Structure

```
/
├── app/
│   ├── page.tsx                            # Landing page
│   ├── layout.tsx                          # Root layout
│   ├── globals.css                         # Global styles + neon-green token
│   ├── api/
│   │   ├── reports/route.ts                # GET → PPTX or PDF download
│   │   ├── upload/route.ts                 # POST → Excel/CSV data ingestion
│   │   ├── trpc/[trpc]/route.ts            # tRPC HTTP handler
│   │   ├── analytics/route.ts              # Proxy to Python service
│   │   ├── ai/
│   │   │   └── cep-generator/route.ts      # POST → AI CEP generate/critique
│   │   └── distribution/
│   │       ├── email/route.ts              # POST → send email invitations
│   │       ├── whatsapp/route.ts           # POST → send WhatsApp invitations
│   │       └── webhook/route.ts            # GET/POST → Meta delivery receipts
│   ├── dashboard/
│   │   ├── layout.tsx                      # Dashboard layout + SegmentProvider
│   │   ├── page.tsx                        # Overview (segment-aware)
│   │   ├── analytics/page.tsx              # Brand KPIs competitive view
│   │   ├── mental-advantage/page.tsx       # Mental map heatmap
│   │   ├── physical/page.tsx               # Physical availability (3 pillars)
│   │   ├── reach/page.tsx                  # Marketing reach tracker
│   │   ├── wom/page.tsx                    # WOM tracker
│   │   ├── forecast/page.tsx               # Forecast engine (5 tabs)
│   │   ├── ceps/page.tsx                   # CEP Builder + AI generator
│   │   ├── surveys/page.tsx                # Survey builder + upload + distribute
│   │   ├── reports/page.tsx                # Report download
│   │   ├── help/page.tsx                   # Full product manual
│   │   └── settings/page.tsx               # Theme, integrations
│   └── projects/
│       ├── page.tsx                        # Project switcher
│       └── generate/page.tsx               # AI project generator
│
├── analytics-service/
│   ├── main.py                             # FastAPI service (MPen, MMS, DJ curve)
│   ├── requirements.txt
│   └── tests/test_calculations.py          # Pytest suite (8 tests)
│
├── components/
│   ├── sidebar.tsx                         # Main navigation
│   ├── segment-toggle.tsx                  # Non-light / Heavy / Overall toggle
│   ├── data-entry-modal.tsx                # Manual + Excel upload modal
│   ├── kpi-card.tsx                        # Metric summary card
│   ├── wave-chart.tsx                      # Trend chart wrapper
│   ├── gap-diagnosis-card.tsx              # MMS vs SMS diagnosis
│   ├── brand-health-chart.tsx              # Competitive bar chart
│   └── cbm-guardrail-banner.tsx            # CBM compliance alert banner
│
├── contexts/
│   └── segment-context.tsx                 # Global segment state
│
├── lib/
│   ├── db.ts                               # Prisma v5 singleton
│   ├── utils.ts                            # cn() utility
│   ├── cbm-engine/
│   │   ├── formula-contracts/              # FROZEN — MPen, MMS, NS, SoM, DJ
│   │   ├── mantra-validators/              # CBM mantra compliance checks
│   │   ├── attribute-rules/                # Wording linter + composition validator
│   │   └── survey-guards/                  # Pre-launch survey compliance checks
│   ├── excel/
│   │   └── parser.ts                       # Excel/CSV → DB row parser (5 types)
│   ├── reports/
│   │   └── pptx.ts                         # pptxgenjs PPTX builder (6 slides)
│   └── trpc/
│       ├── init.ts                         # tRPC context, procedures
│       └── routers/
│           ├── _app.ts                     # Root router
│           ├── projects.ts
│           ├── waves.ts
│           ├── brands.ts
│           ├── ceps.ts                     # CEP CRUD + wording validator
│           ├── linkage.ts
│           ├── analytics.ts                # Calls Python service
│           └── distribution.ts             # send mutation + CSV parser
│
├── prisma/
│   └── schema.prisma                       # Data model (Project, Wave, Brand, CEP, Linkage…)
│
├── .github/
│   └── workflows/
│       └── ci.yml                          # lint, build, pytest, formula guard
│
├── .env.example                            # All required env vars documented
└── middleware.ts                           # Clerk auth (optional)
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+ (optional, for analytics service)
- PostgreSQL (optional, app runs in demo mode without it)

### 1. Install and run (demo mode — no DB needed)

```bash
npm install
npm run dev
```

### 2. Full setup with database

```bash
# Copy env template
cp .env.example .env.local

# Fill in DATABASE_URL (PostgreSQL), then:
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### 3. Run the Python analytics service (optional)

```bash
cd analytics-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Set `ANALYTICS_SERVICE_URL=http://localhost:8000` in `.env.local`.

---

## Environment Variables

All keys are optional — the app runs in demo mode when they are absent.

```bash
# Database
DATABASE_URL=""                         # PostgreSQL connection string

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# Analytics microservice
ANALYTICS_SERVICE_URL=http://localhost:8000

# AI (Anthropic Claude — CEP generator)
ANTHROPIC_API_KEY=""

# Email distribution
RESEND_API_KEY=""                       # Option A: Resend
EMAIL_FROM="survey@yourdomain.com"
SMTP_HOST=""                            # Option B: SMTP fallback
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# WhatsApp distribution (Meta Cloud API)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_TEMPLATE_NAME="survey_invite" # Approved template name
WHATSAPP_WEBHOOK_VERIFY_TOKEN="fortuna-webhook-verify"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## CBM Methodology Reference

### Survey Design Rules (Non-Negotiable)

- **Binary pick-any only** — no Likert scales, no numeric scales, no sliders
- **Alphabetical brand ordering** — no exceptions (eliminates position bias)
- **No modified attribute wording** — never use "most", "best", "more", "least", "first", "only"
- **Non-buyer quota** — minimum 30% of sample must be non/light buyers
- **Bounded recall** — 12-month screener → 3-month target period

### Attribute Composition Targets

```
60–70%   Category Entry Points (CEPs) — buying occasion associations
≤30%     Baseline competencies — functional table stakes
≤20%     Secondary / equity attributes
```

### Formula Contracts (Frozen)

**Mental Penetration (MPen)**
```
MPen = (Buyers linking ≥1 CEP to brand) ÷ Total sample × 100
```

**Mental Market Share (MMS)**
```
MMS = (Brand's total CEP links) ÷ (Total CEP links across all brands) × 100
```

**Network Score (NS)**
```
NS = (Total CEP links for brand) ÷ (Buyers with MPen for that brand)
```

**DJ Expected Score (Mental Advantage Map)**
```
Expected(brand, CEP) = (Row Total × Column Total) ÷ Grand Total
Deviation = Actual − Expected
DEFEND ≥ +5pp | MAINTAIN ±4pp | BUILD ≤ −5pp
```

**MMS → SMS Forecast**
```
r = 0.83 (MMS leads SMS by 1–2 quarters)
MMS > SMS → Physical availability gap
SMS > MMS → Mental availability gap
```

---

## Segment Definitions

| Segment | Who | Primary KPI | Strategic Goal |
|---|---|---|---|
| Non-buyers + Light | Infrequent or never-bought | MPen | Recruitment |
| Heavy Buyers | Frequent purchasers | SoM | Retention |
| Overall | Full sample | MMS | Competitive benchmarking |

---

## Data Pipeline

```
Survey results (.xlsx/.csv)
        ↓
  /api/upload (Next.js)
        ↓
  lib/excel/parser.ts
        ↓
  Prisma → PostgreSQL
  (Linkage, WaveKpi, WomData, ReachData, ChannelPresence)
        ↓
  /api/analytics → Python FastAPI
  (MPen, MMS, NS, SoM, DJ normalization)
        ↓
  WaveKpi table updated
        ↓
  Dashboard refreshes via tRPC
```

---

## Project Roadmap

| Phase | Description | Status |
|---|---|---|
| 0 | Repository scaffold, folder structure, CBM formula contracts | ✅ Done |
| 0.5 | Full UI — all dashboard pages, segment toggle, data entry modals | ✅ Done |
| 1 | Prisma schema, Clerk auth, tRPC v10, CI/CD pipeline | ✅ Done |
| 2 | Live data pipeline — Excel upload → PostgreSQL → dashboard refresh | ✅ Done |
| 3 | Python FastAPI analytics microservice — KPI calculation, DJ normalization | ✅ Done |
| 4 | Exportable reports — PPTX (6 slides) + PDF via Puppeteer | ✅ Done |
| 5 | AI CEP Generator — Anthropic Claude, generate + critique modes | ✅ Done |
| 6 | Survey distribution — Email (Resend/SMTP) + WhatsApp (Meta Cloud API) | ✅ Done |
| 7 | QA, Playwright e2e tests, performance audit, production deploy | 🔜 Next |

---

## Methodology Compliance

The CBM Engine in `/lib/cbm-engine/` enforces methodology compliance at every layer:

- **Formula contracts** (`/formula-contracts/`) — Frozen calculation logic. PRs that modify these require a `methodology-review-approved` label in CI.
- **Mantra validators** — Ensures non-buyer segment is the default, DJ normalization is always applied.
- **Attribute rules** — Wording linter flags superlatives, brand-specific phrasing, composition violations.
- **Survey guards** — Pre-launch checklist: binary format, alphabetical ordering, composition targets met.

---

## Contributing

1. Branch from `main`: `git checkout -b feature/your-feature`
2. **Never** modify `/lib/cbm-engine/formula-contracts/` without a methodology review
3. Run `npm run build` before opening a PR — ESLint and TypeScript must pass cleanly
4. Segment default must remain `NON_LIGHT` unless explicitly changed by user interaction
5. All CEP wording must pass the attribute rules linter (no superlatives)

---

## License

MIT — built by Prima Hanura Akbar.

---

*Fortuna is built on Ehrenberg-Bass Better Brand Health principles. Mental availability, physical availability, Double Jeopardy normalization, AI-powered CEP generation, and survey distribution — in one CBM-compliant platform.*
