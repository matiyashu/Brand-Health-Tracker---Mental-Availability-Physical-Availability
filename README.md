# Fortuna — Brand Health Tracker

**A CBM-compliant brand health tracking platform built by Prima Hanura Akbar.**  
Mental availability · Physical availability · Double Jeopardy normalization · Forecast engine — in one place.

> Built on science-based brand measurement principles (Better Brand Health methodology). Designed for brand strategists and insights teams who want rigorous, methodology-first brand tracking.

---

## Live Demo

```
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → landing page  
Click **Open Dashboard** → full analytics suite

---

## What This Platform Does

Fortuna is a Category Buyer Memory (CBM) brand health tracker. It measures how strongly your brand is present in buyers' minds at the moments they enter a category — called **Category Entry Points (CEPs)**.

Unlike traditional brand tracking (awareness, likeability scores), Fortuna measures:

| What | Why |
|---|---|
| **Mental Penetration (MPen)** | % of category buyers who link your brand to ≥1 CEP |
| **Mental Market Share (MMS)** | Your share of all CEP links in the category |
| **Network Score (NS)** | Average breadth of CEP coverage per mental buyer |
| **Physical Availability** | Whether buyers can actually buy you when the impulse strikes |
| **Marketing Reach** | % who noticed your ad AND correctly attributed it to your brand |
| **WOM** | Positive and negative word of mouth per 100 category buyers |
| **Forecast** | DJ Law projections, MMS→Sales correlation, growth potential |

---

## The CBM Mantra

Every screen, metric, and formula in Fortuna enforces three principles:

**1. Design for the Category**  
CEPs describe the category's buying occasions — not brand-specific moments. Every brand is benchmarked against the same CEP set.

**2. Analyse for the Buyer**  
Non-buyers and light buyers are the primary segment. They are the growth pool. Heavy buyers already prefer your brand.

**3. Report for the Brand**  
All scores are Double Jeopardy (DJ) normalized. A small brand is fairly compared to a large one. Deviation from expected score is what matters.

---

## Feature Overview

### Dashboard Overview
Segment-aware command centre. Toggle between **Non-buyers + Light** (default, recruitment focus), **Heavy Buyers** (retention focus), and **Overall** (competitive benchmarking). Each segment shows a different CEO-ready insight, KPI set, and MMS vs SMS gap diagnosis.

### Brand KPIs (Analytics)
Competitive benchmarking across all brands in the category. DJ-normalized bar charts, segment-aware ranking, and a data requirements checklist.

### Mental Advantage Map
A brand × CEP heatmap showing deviation from DJ-expected scores.
- **DEFEND** (≥+5pp): mental asset — protect in media
- **MAINTAIN** (±4pp): on-par — continue activity
- **BUILD** (≤−5pp): mental gap — target in next campaign brief

Formula: `Expected = (Row Total × Column Total) ÷ Grand Total`

### Physical Availability
Three-pillar audit:
| Pillar | What it measures |
|---|---|
| **Presence** | Channel coverage % vs category norm (branches, ATM, online, agent banking, WhatsApp) |
| **Portfolio** | SKU contribution, penetration efficiency, duplication of purchase gaps |
| **Prominence** | Fame × Uniqueness matrix for distinctive assets; rented prominence tracker |

Includes segment-aware **Gap Analysis** (MMS vs SMS diagnosis per segment).

### Marketing Reach
- **Effective Reach (Noticed %)** — via de-branded stimulus, category buyer base
- **Correct Branding %** — unprompted recall after exposure
- **Branding Ratio** — Branded ÷ Noticed (below 60% = "vampire creative" flag)
- Creative performance table: Strong / Medium / Weak scoring

### WOM Tracker
- PWOM and NWOM per 100 category buyers (binary format only — not NPS)
- Net WOM = PWOM − NWOM
- WOM Ratio = PWOM ÷ NWOM (>4× is strong)
- Competitive table with wave-on-wave trend chart

### Forecast Engine (5 methods)
| Tab | Method |
|---|---|
| **DJ Forecast** | Double Jeopardy Law — penetration vs frequency scatter + scenario builder |
| **CEP Expected Scores** | Full brand × CEP matrix with Actual / Expected / Deviation |
| **MMS → Sales** | MMS as leading indicator of SMS (r=0.83, 1–2 quarter lag) + projection |
| **AI Predictions** | Media spend simulator, category twin benchmarks, trend alerts |
| **Growth Potential** | Non-buyer MPen analysis, growth waterfall, recruitment vs NS priority |

### CEP Builder
7W framework for building CBM-compliant attribute lists. Composition meter enforces 60–70% CEPs. Wording linter flags violations (superlatives, brand-specific CEPs, duplicates).

### Surveys
Block-based survey canvas with 17-block library. Core blocks (mandatory) cannot be removed. CSV template download and results upload with AI analysis.

### Reports
PDF (executive summary), PPTX (full deck), CBM Compliance Report, Raw Data XLSX export.

---

## Data Entry

Every analytics page supports two methods of data input:

1. **Manual entry** — form with field-level validation and hints
2. **Excel upload** — drag-and-drop with a downloadable pre-formatted CSV template

Each modal also shows a **Data Requirements checklist** — CBM methodology compliance flags that must be satisfied before data is considered valid for reporting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS v3, custom `neon-green` (#0FA958) theme |
| Charts | Recharts (Bar, Line, Scatter) |
| State | React Context (segment toggle global state) |
| Icons | Lucide React |
| UI Primitives | shadcn/ui |
| CBM Engine | Custom formula contracts in `/lib/cbm-engine/` |

---

## Repository Structure

```
/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles + neon-green token
│   ├── dashboard/
│   │   ├── layout.tsx                  # Dashboard layout + SegmentProvider
│   │   ├── page.tsx                    # Dashboard overview (segment-aware)
│   │   ├── analytics/page.tsx          # Brand KPIs competitive view
│   │   ├── mental-advantage/page.tsx   # Mental map heatmap
│   │   ├── physical/page.tsx           # Physical availability (5 tabs)
│   │   ├── reach/page.tsx              # Marketing reach tracker
│   │   ├── wom/page.tsx                # WOM tracker
│   │   ├── forecast/page.tsx           # Forecast engine (5 tabs)
│   │   ├── ceps/page.tsx               # CEP Builder
│   │   ├── surveys/page.tsx            # Survey builder + upload
│   │   ├── reports/page.tsx            # Report generation
│   │   ├── help/page.tsx               # Full product manual
│   │   └── settings/page.tsx           # Theme, integrations
│   └── projects/
│       ├── page.tsx                    # Project switcher
│       └── generate/page.tsx           # AI project generator
│
├── components/
│   ├── sidebar.tsx                     # Main navigation
│   ├── segment-toggle.tsx              # Non-light / Heavy / Overall toggle
│   ├── data-entry-modal.tsx            # Reusable manual + upload modal
│   ├── kpi-card.tsx                    # Metric summary card
│   ├── wave-chart.tsx                  # Trend chart wrapper
│   ├── gap-diagnosis-card.tsx          # MMS vs SMS diagnosis
│   ├── brand-health-chart.tsx          # Competitive bar chart
│   └── cbm-guardrail-banner.tsx        # CBM compliance alert banner
│
├── contexts/
│   └── segment-context.tsx             # Global segment state (React Context)
│
└── lib/
    ├── utils.ts                        # cn() utility
    └── cbm-engine/
        ├── formula-contracts/          # FROZEN — MPen, MMS, NS, SoM, Mental Advantage
        ├── mantra-validators/          # CBM mantra compliance checks
        ├── attribute-rules/            # Wording linter + composition validator
        └── survey-guards/              # Pre-launch survey compliance checks
```

---

## Local Setup

### Prerequisites
- Node.js 18+

### Installation

```bash
# Clone
git clone https://github.com/matiyashu/Brand-Health-Tracker---Mental-Availability-Physical-Availability.git
cd Brand-Health-Tracker---Mental-Availability-Physical-Availability

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

No environment variables required for the current UI build — all data is sample/demo data. Auth, database, and API integrations are planned for Phase 1.

---

## CBM Methodology Reference

### Survey Design Rules (Non-Negotiable)
- **Binary pick-any only** — no Likert scales, no numeric scales
- **Alphabetical brand ordering** — no exceptions (eliminates position bias)
- **No modified attribute wording** — avoid "most", "best", "more" (superlatives)
- **Non-buyer quota** — minimum 30% of sample must be non/light buyers
- **Bounded recall** — 12-month screener, 3-month target period

### Attribute Composition Targets
```
60–70%   Category Entry Points (CEPs)
≤30%     Baseline competencies (functional attributes)
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

**DJ Expected Score (Mental Advantage)**
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
| Non-buyers + Light | Infrequent / never-bought | MPen | Recruitment |
| Heavy Buyers | Frequent purchasers | SoM | Retention |
| Overall | Full sample | MMS | Competitive benchmarking |

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| 0 | Repository scaffold, folder structure, formula contracts | ✅ Done |
| 0.5 | Full UI — all dashboard pages, segment toggle, data entry modals | ✅ Done |
| 1 | Foundation — Prisma schema, Clerk auth, tRPC, CI/CD | 🔜 Next |
| 2 | Live data pipeline — survey upload → DB → dashboard refresh | ⏳ Pending |
| 3 | Analytics engine (Python FastAPI), KPI recalculation, DJ normalization at scale | ⏳ Pending |
| 4 | Report generation — PDF/PPTX export via headless Chrome | ⏳ Pending |
| 5 | AI CEP Generator, category twin matching, media spend modelling | ⏳ Pending |
| 6 | WhatsApp survey distribution, multi-project management | ⏳ Pending |
| 7 | QA, Playwright e2e tests, performance audit, production deploy | ⏳ Pending |

---

## Methodology Compliance

The CBM Engine in `/lib/cbm-engine/` enforces methodology compliance at every layer:

- **Formula contracts** — Frozen calculation logic for all KPIs. PRs modifying these require a `methodology-review-approved` label.
- **Mantra validators** — Checks that analysis defaults (non-buyer primary, DJ normalization) are applied.
- **Attribute rules** — Wording linter flags superlatives, brand-specific phrasing, and duplicate CEPs.
- **Survey guards** — Pre-launch checklist: binary format, alphabetical order, composition targets.

---

## Contributing

1. Branch from `main`: `feature/your-feature-name`
2. Never modify `/lib/cbm-engine/formula-contracts/` without a methodology review
3. Run `npm run build` before opening a PR — ESLint and TypeScript must pass
4. Segment default must remain `non-light` unless explicitly changed by user action

---

## License

MIT — built by Prima Hanura Akbar.

---

*Fortuna is built on science-based brand measurement principles. Mental availability, physical availability, and Double Jeopardy normalization — in one platform.*
