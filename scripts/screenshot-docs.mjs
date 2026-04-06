/**
 * Fortuna — Screenshot + Documentation Generator
 * Run: node scripts/screenshot-docs.mjs
 * Requires: npm run dev (server on port 3002)
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const SHOTS_DIR = path.join(ROOT, 'screenshots')
const BASE      = 'http://localhost:3000'

if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true })

const PAGES = [
  {
    id: 'landing', label: 'Landing Page', url: '/', wait: 800,
    overview: 'The entry point of Fortuna. Presents the platform value proposition and provides one-click access to the dashboard. Built around the CBM (Category Buyer Memory) methodology.',
    howToUse: [
      'Click <strong>Open Dashboard</strong> to enter the analytics suite — no login required in demo mode.',
      'The page describes the measurement approach: Mental Availability, Physical Availability, and Double Jeopardy normalization.',
      'Navigate to <strong>/projects</strong> to switch between multiple studies.',
    ],
    interpretation: [
      'Orientation page only — no analytical data is displayed here.',
      'The tagline summarises the core promise: linking your brand to buying occasions in buyers minds.',
    ],
  },
  {
    id: 'projects', label: 'Projects', url: '/projects', wait: 800,
    overview: 'The project hub. Manage multiple brand tracking studies from one place. Each project represents one category in one country (e.g. Indonesian Credit Cards). Switch projects or create new ones here.',
    howToUse: [
      'Click a project card to load that study into the dashboard.',
      'Status badge: <strong>Active</strong> (live wave in field), <strong>Draft</strong> (not launched), <strong>Complete</strong> (all waves closed).',
      'Click <strong>AI Generate Project</strong> to scaffold a new project — AI suggests category, brands, and initial CEP set.',
    ],
    interpretation: [
      'A project with Active status has an open fieldwork wave — check Surveys for response counts.',
      'If no wave data shows, use Surveys > Upload Results to import collected responses.',
      'AI Generate creates a starting point — always review the CEP list before fieldwork.',
    ],
  },
  {
    id: 'dashboard', label: 'Dashboard Overview', url: '/dashboard', wait: 1200,
    overview: 'The command centre. CEO-ready summary of the current wave with segment-aware KPIs, strategic insight, and gap diagnosis. All metrics update dynamically when the segment toggle changes.',
    howToUse: [
      '<strong>Segment Toggle</strong> (top-right) — switch between Non-buyers + Light (default), Heavy Buyers, Overall.',
      '<strong>KPI Cards</strong> — MPen, MMS, NS, SoM with wave-on-wave delta (green triangle up = improved).',
      '<strong>Key Insight Panel</strong> — read the headline. Three metric bars explain the drivers. Bottom recommendation = single next action.',
      '<strong>MMS vs SMS Gap bar</strong> — identifies whether the gap is mental or physical availability.',
      'Click <strong>Add Data</strong> to open the data entry modal.',
    ],
    interpretation: [
      '<strong>Non-buyers + Light is always the primary segment.</strong> This is the growth pool. Low MPen here = limited mental availability among non-buyers.',
      '<strong>MMS greater than SMS gap</strong> = Physical availability problem. Buyers think of the brand but cannot buy it. Fix distribution first.',
      '<strong>SMS greater than MMS gap</strong> = Mental availability problem. Buyers can find the brand but do not think of it first. Fix CEP reach in media.',
      'A +2pp MPen increase in non-light segment is a significant growth signal — more non-buyers are linking the brand to at least one buying occasion.',
      'Heavy Buyers segment: high SoM is expected. Concern is if NS is low — loyal buyers associate the brand with few occasions.',
    ],
  },
  {
    id: 'analytics', label: 'Brand KPIs (Analytics)', url: '/dashboard/analytics', wait: 1200,
    overview: 'Competitive benchmarking page. All brands shown side-by-side, DJ-normalized for fair comparison across different-sized brands. Focal brand highlighted in neon green. Rankings shift per segment.',
    howToUse: [
      'Chart ranks brands by the active segment primary KPI — MPen for non-light, SoM for heavy, MMS for overall.',
      'Change the segment toggle to see how competitive rankings shift between buyer groups.',
      '<strong>Competitive Analysis</strong> panel below the chart gives a strategic summary for the current segment.',
      '<strong>Data Requirements</strong> checklist shows what is missing — red items must be resolved before reporting.',
    ],
    interpretation: [
      '<strong>Double Jeopardy check:</strong> Brands with higher MPen should also have higher NS. High MPen + low NS = buyers know you broadly but you are not used across many occasions.',
      '<strong>MMS vs SoM:</strong> MMS greater than SoM = outperforming mentally, expect sales growth. SoM greater than MMS = living off past equity, mental decline coming.',
      '<strong>NS is the strongest quality indicator.</strong> MPen 40% NS 4.5 outperforms MPen 55% NS 2.1 in long-term growth potential.',
      'Look for competitors with high MPen but low MMS — they spread thin. A targeted CEP campaign can steal mind share from them.',
    ],
  },
  {
    id: 'mental-advantage', label: 'Mental Advantage Map', url: '/dashboard/mental-advantage', wait: 1200,
    overview: 'Brand x CEP heatmap showing performance relative to DJ-expected score. The most strategically actionable page — directly drives creative briefs and media planning decisions.',
    howToUse: [
      'Each cell shows <strong>deviation</strong> from DJ-expected score (Actual minus Expected, in percentage points).',
      '<strong>Green cells (DEFEND, at least +5pp)</strong> — mental assets. Feature consistently in all media.',
      '<strong>Gray cells (MAINTAIN, within 4pp)</strong> — on-par. Hold current activity.',
      '<strong>Red cells (BUILD, minus 5pp or worse)</strong> — mental gaps. Prioritise in next campaign brief.',
      'Strategic Summary cards count DEFEND / MAINTAIN / BUILD cells per brand.',
    ],
    interpretation: [
      '<strong>DJ Expected Score:</strong> Expected = (Row Total x Column Total) divided by Grand Total. Removes the size effect — large brands naturally get more linkages.',
      '<strong>DEFEND cells are media assets.</strong> A +17pp deviation means the brand wins disproportionately there — anchor all media to it.',
      '<strong>BUILD cells are opportunities.</strong> A -14pp deviation means one targeted campaign can shift this significantly.',
      '<strong>Read down columns (CEP view):</strong> All MAINTAIN cells in a column = no brand owns that occasion — blue ocean opportunity.',
      '<strong>Urgent signal:</strong> If a competitor holds DEFEND on the most important category CEP and you hold BUILD, that is the highest-priority strategic gap.',
    ],
  },
  {
    id: 'physical', label: 'Physical Availability', url: '/dashboard/physical', wait: 1200,
    overview: 'Three-pillar physical availability audit: Presence (where buyers find you), Portfolio (what they buy), and Prominence (visibility at point of purchase). Five tabs cover the full physical picture.',
    howToUse: [
      '<strong>Overview Tab</strong> — four KPI cards give headline numbers. Three pillar cards explain each score.',
      '<strong>Presence Tab</strong> — channel coverage vs category norm. Shows if coverage is above or below category average per channel.',
      '<strong>Portfolio Tab</strong> — SKU Efficiency Ratio (Sales% divided by Penetration%). Above 1.0 = star product. Below 1.0 = underperforming.',
      '<strong>Prominence Tab</strong> — Fame x Uniqueness matrix. Top-right quadrant = Distinctive Brand Assets (DBAs).',
      '<strong>Gap Analysis Tab</strong> — changes per segment toggle. Shows MMS vs SMS gap and physical actions to address it.',
    ],
    interpretation: [
      'Coverage below category norm in high-traffic channels = direct explanation for MMS vs SMS gap. Fix distribution before increasing media spend.',
      '<strong>Efficiency Ratio above 1.5:</strong> Disproportionate sales driver — always in stock, prominently placed.',
      '<strong>Efficiency Ratio below 0.5:</strong> SKU has reach but does not convert — investigate pricing, placement, or relevance.',
      '<strong>High fame / low uniqueness asset</strong> = generic. Buyers know it but it does not distinguish the brand. Refresh.',
      '<strong>High uniqueness / low fame asset</strong> = hidden gem — invest in amplification.',
    ],
  },
  {
    id: 'reach', label: 'Marketing Reach', url: '/dashboard/reach', wait: 1200,
    overview: 'Measures advertising effectiveness: whether buyers noticed the creative (Effective Reach) and whether they correctly attributed it to the brand (Correct Branding). Uses de-branded stimuli for unbiased measurement.',
    howToUse: [
      'Four <strong>summary KPI cards</strong> give the overall picture for the current wave.',
      '<strong>Trend chart</strong> — Noticed % (dark) vs Correctly Branded % (green) per creative across waves.',
      '<strong>Creative Performance Table</strong> — all creatives with scores and rating: Strong / Medium / Weak.',
      '<strong>Branding Ratio</strong> (Branded divided by Noticed) = % of people who saw the ad and knew it was yours. Most important single metric.',
    ],
    interpretation: [
      '<strong>Branding Ratio below 60%</strong> = Vampire Creative. Noticed but not attributed to brand. Media spend builds category awareness, not brand awareness.',
      '<strong>Branding Ratio above 80%</strong> = Strong branding. Target for all creatives.',
      'High Noticed% + Low Branded% = attention-grabbing but brand-generic. Increase logo, brand colours, distinctive asset presence.',
      'Low Noticed% + High Branded% = well-branded but not reaching enough people. Media placement or frequency problem, not creative.',
      'Cross-reference with Mental Advantage Map: if a campaign aimed to build a specific CEP but Branding Ratio is below 60%, the spend went to category, not brand.',
    ],
  },
  {
    id: 'wom', label: 'WOM Tracker', url: '/dashboard/wom', wait: 1200,
    overview: 'Tracks Positive Word of Mouth (PWOM) and Negative Word of Mouth (NWOM) per 100 category buyers. Binary past-month measurement — not NPS. WOM is one of the strongest organic growth levers in CBM.',
    howToUse: [
      'Four <strong>summary cards</strong> — PWOM, NWOM, Net WOM (PWOM minus NWOM), WOM Ratio (PWOM divided by NWOM).',
      '<strong>Competitive WOM Table</strong> — all brands ranked by Net WOM. Single number to track for organic growth health.',
      '<strong>Trend Chart</strong> — PWOM and NWOM wave-on-wave for the focal brand.',
    ],
    interpretation: [
      'Net WOM negative = more people warning against than advocating. Manage customer experience before increasing media spend.',
      '<strong>WOM Ratio above 4x</strong> = strong. For every person warning against, five are recommending. Healthy organic engine.',
      '<strong>NWOM spike</strong> (sudden increase) often precedes brand health decline by 1-2 waves. The earliest warning signal in the platform.',
      'High PWOM + High Reach = compound growth (earned and paid amplify each other).',
      'PWOM greater than MPen = people recommending without strong CEP link. Brand inertia — will erode without investment.',
    ],
  },
  {
    id: 'forecast', label: 'Forecast Engine', url: '/dashboard/forecast', wait: 1500,
    overview: 'Five forecast tools: Double Jeopardy Law, CEP expected score matrix, MMS-to-Sales correlation, AI media simulation, and growth potential waterfall. Use to build the investment case and set next-wave targets.',
    howToUse: [
      '<strong>DJ Forecast tab:</strong> Scatter of brands on DJ curve + scenario builder. Set target MPen to predict resulting NS.',
      '<strong>CEP Expected Scores tab:</strong> Full brand x CEP matrix with Actual / Expected / Deviation. Export to Excel.',
      '<strong>MMS to Sales tab:</strong> Dual-line chart with 1-2 quarter lead projection (r=0.83 correlation).',
      '<strong>AI Predictions tab:</strong> Media spend multiplier slider, category twin benchmarks, AI trend alerts.',
      '<strong>Growth Potential tab:</strong> MPen by segment, growth waterfall, Recruitment vs Network Size priority.',
    ],
    interpretation: [
      'Brands above the DJ curve have disproportionately loyal buyers. Brands below have distribution or relevance problems.',
      'MMS rising but SMS flat = expect SMS to follow in 1-2 quarters. This is the invest-now, harvest-later argument.',
      'Growth Potential bars above zero = untapped MPen among non-buyers who know the category. Easiest growth to unlock.',
      '<strong>Recruitment priority</strong> (low MPen, acceptable NS): invest in reach — more non-buyer exposure.',
      '<strong>NS priority</strong> (acceptable MPen, low NS): invest in CEP breadth — more occasion associations.',
    ],
  },
  {
    id: 'ceps', label: 'CEP Builder', url: '/dashboard/ceps', wait: 1200,
    overview: 'Design the attribute list for your brand tracking survey using the 7W framework (Who, What, When, Where, Why, With What, With Whom). CBM Engine validates every attribute in real time and enforces correct portfolio composition.',
    howToUse: [
      'Use <strong>7W tabs</strong> to organise CEPs by buying occasion dimension — ensures balanced coverage.',
      'Classify each attribute as <strong>CEP</strong>, <strong>Baseline</strong>, or <strong>Secondary</strong>.',
      '<strong>Composition Meter</strong> — target 60-70% CEPs, max 30% Baseline, max 20% Secondary.',
      'Attributes with superlatives (most, best, more, least, worst, first, only) are flagged — rephrase in plain language.',
      'Click <strong>AI Generate</strong> to auto-draft a portfolio. Use <strong>Critique mode</strong> to audit an existing list.',
    ],
    interpretation: [
      'Wording rule: "Accepted everywhere I shop" is correct. "The most accepted brand" is a violation (superlative).',
      'Lists dominated by WHAT and WHY miss WHEN and WHERE — the highest-traffic entry points in most categories.',
      'Composition red at above 30% Baseline = functional attributes dilute the occasion-based signal.',
      'AI Generate: review every suggestion — AI applies CBM rules but does not know your market\'s cultural nuance.',
    ],
  },
  {
    id: 'surveys', label: 'Surveys', url: '/dashboard/surveys', wait: 1200,
    overview: 'Build and manage fieldwork waves. Block-based survey canvas with 17-block library, CBM compliance checking, Excel upload pipeline, and full distribution system for email and WhatsApp.',
    howToUse: [
      '<strong>Survey Waves tab</strong> — all waves with status, response progress, and compliance score.',
      '<strong>17-Block Library tab</strong> — all CBM question blocks. Core blocks (CORE badge) are mandatory.',
      '<strong>Survey Builder tab</strong> — drag blocks onto canvas. Core blocks cannot be removed.',
      '<strong>Upload Results tab</strong> — drag and drop Excel fieldwork file. System validates, calculates KPIs, shows preview.',
      '<strong>Distribute tab</strong> — send invitations via Email (Resend/SMTP) or WhatsApp (Meta Cloud API). Paste or upload CSV of recipients.',
    ],
    interpretation: [
      'Compliance score below 100% = expand compliance panel to see which CBM rules are failing.',
      'Core blocks must never be removed: Category Screener sets the sampling frame. Mental Availability (block 09) is the most valuable data.',
      'Email suits professional samples. WhatsApp is more effective for consumer panels in mobile-first markets like Indonesia.',
      'CSV format: headers must be "name", "email", "phone". Phone in E.164 format (+62... for Indonesia).',
    ],
  },
  {
    id: 'reports', label: 'Reports', url: '/dashboard/reports', wait: 1000,
    overview: 'Generate client-ready outputs from the latest wave data. Download a branded 6-slide PPTX deck or PDF executive summary — both auto-populated from live DB data, with demo data fallback.',
    howToUse: [
      'Select the <strong>wave</strong> and <strong>segment</strong> from the dropdowns.',
      'Click <strong>Download PPTX</strong> — generates: Cover, KPI Scorecard, Mental Advantage Map, WOM, Marketing Reach, Methodology.',
      'Click <strong>Download PDF</strong> — generates: cover, KPI table, mental advantage summary, WOM table, footnotes.',
      'API access: <code>/api/reports?waveId=ID&amp;format=pptx&amp;segment=NON_LIGHT</code>',
    ],
    interpretation: [
      'PPTX Slide 2 (KPI Scorecard): focal brand row in green. Any brand with MMS greater than SoM has untapped sales potential.',
      'PPTX Slide 3 (Mental Advantage Map): DEFEND cells = strengths to present. BUILD cells = priorities for next planning cycle.',
      'PPTX Slide 5 (Marketing Reach): Branding Ratio below 60% = flag creative for rework in client meeting.',
      'PDF Executive Summary: MMS vs SMS gap is the single most important number for the CEO conversation.',
    ],
  },
  {
    id: 'help', label: 'Help and Manual', url: '/dashboard/help', wait: 1000,
    overview: 'Full in-app product manual. Three sections: Getting Started (intro and first-time workflow), Page Manual (10 pages with usage and interpretation guides), and Reference (methodology, KPI formulas, 10-item FAQ).',
    howToUse: [
      'New to the platform? Start with <strong>Getting Started</strong> — read the CBM Mantra and follow the 7-step First-Time Setup.',
      'For any specific page, go to <strong>Page Manual</strong> and find the page by name.',
      'For formula lookups, go to <strong>KPI Reference</strong> — all 8 KPIs with formula, range, and benchmark.',
      'For survey design questions, go to <strong>Methodology Guide</strong>.',
    ],
    interpretation: [
      'Help page is documentation only — no analytical data displayed.',
      'CBM Basics is the recommended starting point for new team members unfamiliar with CBM.',
      'Methodology Guide is the source of truth for all survey design decisions — reference before every wave build.',
    ],
  },
  {
    id: 'settings', label: 'Settings — Integrations and API', url: '/dashboard/settings', wait: 1000,
    overview: 'Platform configuration hub. The Integrations and API tab (default) connects all seven external services in one place. Additional tabs cover appearance, layout, regional, and data/privacy controls.',
    howToUse: [
      '<strong>Connection Status panel</strong> — shows at a glance which services are connected (Core, AI, Distribution).',
      'Click any <strong>integration card</strong> to expand. Enter API keys or service URLs.',
      'Secret fields have a <strong>show/hide toggle</strong> (eye icon). Use <strong>Test connection</strong> to verify before saving.',
      '<strong>.env.local template</strong> at the bottom — click Copy All to get a ready-to-fill template.',
      'Setup guide links open the provider documentation in a new tab.',
    ],
    interpretation: [
      'Demo Mode (amber) = unconfigured but app still functional with sample data.',
      'Not configured (red) = feature unavailable. Without ANTHROPIC_API_KEY, AI CEP Generator returns demo CEPs only.',
      'Priority setup order: 1) DATABASE_URL, 2) Clerk auth, 3) Analytics Service, 4) Anthropic Claude, 5) Resend or SMTP, 6) WhatsApp Meta API.',
      'WhatsApp webhook URL must be registered in Meta App Dashboard before delivery receipts will work.',
    ],
  },
]

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildHTML(pages) {
  const toc = pages.map((p, i) =>
    `<li><a href="#page-${p.id}">${String(i+1).padStart(2,'0')}. ${p.label}</a></li>`
  ).join('\n')

  const sections = pages.map((p, i) => {
    const usage = p.howToUse.map(f => `<li>${f}</li>`).join('')
    const interp = p.interpretation.map(f => `<li>${f}</li>`).join('')
    return `
<div class="page-section" id="page-${p.id}">
  <div class="page-header">
    <div class="page-number">${String(i+1).padStart(2,'0')}</div>
    <div><h2>${p.label}</h2><span class="route">${p.url==='/'?BASE:BASE+p.url}</span></div>
  </div>
  <div class="screenshot-box">
    <img src="screenshots/${p.id}.png" alt="${p.label}"
      onerror="this.parentElement.innerHTML='<div class=no-shot>Screenshot not captured</div>'" />
  </div>
  <div class="section-body">
    <div class="overview-block">
      <div class="section-label">Overview</div>
      <p>${p.overview}</p>
    </div>
    <div class="two-col">
      <div>
        <div class="section-label">How to Use</div>
        <ul class="guide-list usage">${usage}</ul>
      </div>
      <div>
        <div class="section-label">How to Interpret Data and Results</div>
        <ul class="guide-list interp">${interp}</ul>
      </div>
    </div>
  </div>
</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Fortuna — Feature Guide and Data Interpretation Manual</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11pt;color:#1a1a1a;background:#f0f2f5;line-height:1.55}
a{color:#0FA958;text-decoration:none}a:hover{text-decoration:underline}
.cover{background:#111827;color:#fff;padding:72px 64px;min-height:100vh;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.cover-logo{width:72px;height:72px;background:#0FA958;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:30pt;font-weight:900;color:#fff;margin-bottom:32px}
.cover h1{font-size:28pt;color:#fff;margin-bottom:8px}
.cover .sub{font-size:13pt;color:#9ca3af;margin-bottom:40px}
.ctable{border-collapse:collapse;font-size:10.5pt}.ctable td{padding:5px 24px 5px 0}
.ctable .lbl{color:#6b7280}.ctable .val{color:#fff;font-weight:700}
.cover-meta{margin-top:44px;padding-top:20px;border-top:1px solid #374151;font-size:9.5pt;color:#4b5563}
.toc-page{background:#fff;padding:56px 64px;border-bottom:4px solid #0FA958;page-break-after:always}
.toc-page h2{font-size:14pt;color:#0FA958;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em}
.toc-sub{font-size:10pt;color:#9ca3af;margin-bottom:28px}
.toc-page ol{columns:2;column-gap:48px;padding-left:24px}
.toc-page li{margin-bottom:10px;break-inside:avoid;font-size:11pt}
.toc-page a{color:#1a1a1a;font-weight:600}
.method-box{background:#f0fdf4;border-left:4px solid #0FA958;border-radius:6px;padding:16px 20px;margin-top:32px;font-size:10.5pt;color:#166534;line-height:1.65}
.method-box strong{color:#14532d}
.page-section{background:#fff;margin:28px auto;max-width:1040px;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.07);page-break-before:always}
.page-header{display:flex;align-items:flex-start;gap:20px;padding:24px 36px 18px;background:#f8fafc;border-bottom:2px solid #f1f5f9}
.page-number{background:#0FA958;color:#fff;font-size:15pt;font-weight:900;width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.page-header h2{font-size:15pt;color:#111827;margin-bottom:5px}
.route{font-family:Consolas,'Courier New',monospace;font-size:9pt;background:#f1f5f9;color:#64748b;padding:2px 10px;border-radius:4px;border:1px solid #e2e8f0}
.screenshot-box{padding:24px 36px;background:#f8fafc;border-bottom:1px solid #e5e7eb}
.screenshot-box img{width:100%;border-radius:6px;border:1px solid #d1d5db;box-shadow:0 4px 16px rgba(0,0,0,.10);display:block}
.no-shot{height:160px;display:flex;align-items:center;justify-content:center;font-size:10pt;color:#9ca3af;background:#f1f5f9;border-radius:6px;border:2px dashed #d1d5db}
.section-body{padding:0 36px 32px}
.overview-block{padding:24px 0 20px;border-bottom:1px solid #f1f5f9}
.overview-block p{font-size:11pt;color:#374151;line-height:1.65}
.section-label{font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.10em;color:#94a3b8;margin-bottom:12px;margin-top:22px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:4px}
.guide-list{list-style:none;padding:0;margin:0}
.guide-list li{font-size:10.5pt;color:#374151;padding:7px 0 7px 22px;border-bottom:1px solid #f8fafc;position:relative;line-height:1.55}
.guide-list li:last-child{border-bottom:none}
.guide-list.usage li::before{content:"▶";color:#0FA958;font-size:7pt;position:absolute;left:4px;top:10px}
.guide-list.interp li::before{content:"◆";color:#f59e0b;font-size:7pt;position:absolute;left:4px;top:10px}
.guide-list li strong{color:#111827;font-weight:700}
.guide-list li code{font-family:Consolas,monospace;font-size:9.5pt;background:#f1f5f9;padding:1px 5px;border-radius:3px;color:#64748b}
.doc-footer{max-width:1040px;margin:0 auto 48px;padding:20px 36px;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.05);display:flex;align-items:center;justify-content:space-between;font-size:9.5pt;color:#9ca3af}
.doc-footer strong{color:#0FA958}
@media print{body{background:#fff}.page-section{page-break-before:always;box-shadow:none;margin:0;border-radius:0;max-width:100%}.cover{page-break-after:always}.toc-page{page-break-after:always}.two-col{grid-template-columns:1fr 1fr}}
</style></head><body>

<div class="cover">
  <div class="cover-logo">F</div>
  <h1>Fortuna Brand Health Tracker</h1>
  <p class="sub">Complete Feature Guide and Data Interpretation Manual</p>
  <p style="color:#6b7280;font-size:11pt;margin-bottom:40px;line-height:1.65">
    Visual reference of every page, feature, and analytical output in the platform.<br/>
    Step-by-step usage instructions and detailed data interpretation guidance.<br/>
    Built on CBM (Category Buyer Memory) methodology — Ehrenberg-Bass Institute.
  </p>
  <table class="ctable">
    <tr><td class="lbl">Pages Covered</td><td class="val">${pages.length}</td></tr>
    <tr><td class="lbl">Methodology</td><td class="val">CBM — Category Buyer Memory (Ehrenberg-Bass)</td></tr>
    <tr><td class="lbl">Platform Stack</td><td class="val">Next.js 14 · Prisma · Python FastAPI · tRPC</td></tr>
    <tr><td class="lbl">AI Integration</td><td class="val">Anthropic Claude (claude-opus-4-6)</td></tr>
    <tr><td class="lbl">Distribution</td><td class="val">Resend Email + Meta WhatsApp Cloud API</td></tr>
    <tr><td class="lbl">Built by</td><td class="val">Prima Hanura Akbar</td></tr>
    <tr><td class="lbl">Version</td><td class="val">Phase 6 Complete · April 2026</td></tr>
  </table>
  <div class="cover-meta">
    GitHub: https://github.com/matiyashu/Brand-Health-Tracker---Mental-Availability-Physical-Availability<br/>
    Reference: Romaniuk and Sharp — Better Brand Health (2022) · Ehrenberg-Bass Institute
  </div>
</div>

<div class="toc-page">
  <h2>Table of Contents</h2>
  <p class="toc-sub">Click any item to jump to that section.</p>
  <ol>${toc}</ol>
  <div class="method-box">
    <strong>The CBM Mantra — Every page in Fortuna enforces three principles:</strong><br/>
    <strong>1. Design for the Category</strong> — CEPs describe category buying occasions, not brand-specific moments.<br/>
    <strong>2. Analyse for the Buyer</strong> — Non-buyers and light buyers are always the primary analysis segment.<br/>
    <strong>3. Report for the Brand</strong> — All scores are Double Jeopardy normalised. Deviation from expected score matters, not the raw number.
  </div>
</div>

<div style="padding:0 24px">
${sections}
</div>

<div class="doc-footer">
  <div><strong>Fortuna Brand Health Tracker</strong> — Feature Guide and Interpretation Manual<br/>Built by Prima Hanura Akbar · April 2026</div>
  <div style="text-align:right">CBM Methodology: Ehrenberg-Bass Institute<br/>Romaniuk and Sharp — Better Brand Health (2022)</div>
</div>
</body></html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Fortuna Screenshot + Documentation Generator')
  console.log('Target: ' + BASE + '\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  let captured = 0
  for (const p of PAGES) {
    process.stdout.write('  Capturing ' + p.label.padEnd(38) + '... ')
    try {
      await page.goto(BASE + p.url, { waitUntil: 'networkidle2', timeout: 20000 })
      await new Promise(r => setTimeout(r, p.wait))
      await page.screenshot({ path: path.join(SHOTS_DIR, p.id + '.png'), fullPage: false })
      console.log('OK')
      captured++
    } catch (err) {
      console.log('FAILED: ' + err.message.split('\n')[0])
    }
  }
  await browser.close()

  console.log('\nCaptured ' + captured + '/' + PAGES.length + ' screenshots')
  console.log('Building HTML...')

  const outFile = path.join(ROOT, 'Fortuna_Feature_Guide.html')
  fs.writeFileSync(outFile, buildHTML(PAGES), 'utf8')
  const kb = Math.round(fs.statSync(outFile).size / 1024)

  console.log('\nDone — Fortuna_Feature_Guide.html (' + kb + ' KB)')
  console.log('Open in Word: File > Open > Fortuna_Feature_Guide.html > Save As .docx')
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1) })
