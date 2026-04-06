import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SHOTS_DIR = path.join(ROOT, 'screenshots')
const BASE = 'http://localhost:3000'

if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true })

// ── Pages to capture ────────────────────────────────────────────────────────
const PAGES = [
  {
    id: 'landing',
    label: 'Landing Page',
    url: '/',
    wait: 800,
    description: 'The entry point of Fortuna. Presents the platform value proposition and provides access to the dashboard. Includes a brief overview of CBM methodology and a direct call-to-action to open the dashboard.',
    features: [
      'Platform introduction — Fortuna brand identity and tagline',
      '"Open Dashboard" button — direct entry to the analytics suite',
      'CBM methodology badge (Science-Based, CBM-Compliant)',
      'Platform description highlighting Mental Availability, Physical Availability, and Double Jeopardy normalization',
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    url: '/projects',
    wait: 800,
    description: 'The project hub. Manage multiple brand tracking studies from one place. Switch between active projects or create new ones.',
    features: [
      'Project cards — each card represents a brand tracking programme (e.g. Indonesian Credit Cards, Coffee Shops Jakarta)',
      'Status badges — shows wave status (Active, Draft, Completed)',
      'Quick-access links to each project\'s dashboard',
      '"AI Generate Project" — automatically generate a new project structure from a brand brief',
      'Project metadata — category, country, last wave date',
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    url: '/dashboard',
    wait: 1000,
    description: 'The command centre of the brand health programme. Provides a CEO-ready summary of the current wave with full segment-aware analysis. All metrics and insights update dynamically when the segment toggle changes.',
    features: [
      'Segment Toggle — switch between Non-buyers + Light (default), Heavy Buyers, Overall',
      'Segment Banner — shows active segment, primary KPI, and strategic goal',
      '4 KPI Cards — Mental Penetration, Mental Market Share, Network Score, Share of Mind with wave-on-wave deltas',
      'Key Insight Panel — CEO-ready headline + 3 metric analysis bars + recommendation (all segment-specific)',
      'MMS vs SMS Gap Diagnosis — identifies whether the gap is a mental or physical availability problem',
      'Add Data button — opens the data entry modal for manual input or Excel upload',
    ]
  },
  {
    id: 'analytics',
    label: 'Brand KPIs',
    url: '/dashboard/analytics',
    wait: 1000,
    description: 'Competitive benchmarking page. Shows all brands in the category side-by-side, ranked by the active segment\'s focal KPI. DJ-normalized scores ensure fair comparison across brands of different sizes.',
    features: [
      'Competitive Bar Chart — all brands ranked by MPen (non-light), SoM (heavy), or MMS (overall)',
      'Focal brand (BCA) highlighted in neon green; competitors in gray',
      'Segment-aware ranking — order changes between segments',
      'Competitive analysis panel — headline + key insight per segment',
      'Data requirements checklist — CBM compliance flags for the current wave',
      'DJ normalization applied — deviation from expected shown in data table',
    ]
  },
  {
    id: 'mental-advantage',
    label: 'Mental Advantage',
    url: '/dashboard/mental-advantage',
    wait: 1000,
    description: 'The Mental Advantage map shows a brand × CEP heatmap. Each cell displays how much a brand over- or under-performs its DJ-expected score on a specific Category Entry Point. This drives the creative and media brief.',
    features: [
      'Brand × CEP Heatmap — matrix of all brands vs all CEPs with deviation scores',
      'DEFEND cells (green, ≥+5pp) — mental assets; feature consistently in media',
      'MAINTAIN cells (gray, ±4pp) — on-par performance; hold current activity',
      'BUILD cells (red, ≤−5pp) — mental gaps; prioritise in next campaign',
      'DJ Expected Score Formula — Expected = (Row Total × Col Total) ÷ Grand Total',
      'Strategic Summary Cards — per-brand count of DEFEND / MAINTAIN / BUILD cells',
      'Add Data button — upload the full linkage matrix via CSV',
    ]
  },
  {
    id: 'physical',
    label: 'Physical Availability',
    url: '/dashboard/physical',
    wait: 1000,
    description: 'Three-pillar physical availability audit. Measures whether buyers can actually find and buy your brand across all distribution channels and touchpoints. Contains five tabs for different measurement dimensions.',
    features: [
      'Overview Tab — 4 KPI cards (coverage %, active channels, strong assets, MMS gap) + pillar summary',
      'Presence Tab — channel coverage table vs category norm, emerging outlets tracker',
      'Portfolio Tab — SKU contribution matrix (sales %, penetration %, efficiency ratio), duplication of purchase gaps',
      'Prominence Tab — Fame × Uniqueness matrix for distinctive assets, rented prominence tracker',
      'Gap Analysis Tab — segment-aware MMS vs SMS diagnosis (changes content per segment toggle)',
      'Add Data button on each tab — specific fields and CSV templates per pillar',
    ]
  },
  {
    id: 'reach',
    label: 'Marketing Reach',
    url: '/dashboard/reach',
    wait: 1000,
    description: 'Measures the effectiveness of advertising — both whether it reached category buyers (Noticed %) and whether they correctly attributed it to the brand (Correct Branding %). Uses de-branded stimuli for accurate measurement.',
    features: [
      'Summary KPI Cards — overall Noticed %, Correct Branding %, Branding Ratio, creative count',
      'Trend Chart — wave-on-wave bars for Noticed % vs Correctly Branded % per creative',
      'Creative Performance Table — all creatives with scores, Strong / Medium / Weak rating, wave period',
      'Branding Ratio — Branded ÷ Noticed. Below 60% flags as "vampire creative"',
      'Upload Creative button — store the raw ad file alongside its scores',
      'Add Data modal — Noticed %, Branded %, wave period per creative',
    ]
  },
  {
    id: 'wom',
    label: 'WOM Tracker',
    url: '/dashboard/wom',
    wait: 1000,
    description: 'Tracks Positive and Negative Word of Mouth per 100 category buyers. Uses binary measurement (did you / didn\'t you recommend in the past month) — not NPS intent scale. One of the strongest leading indicators of organic brand growth.',
    features: [
      'WOM Summary Cards — PWOM, NWOM, Net WOM (PWOM − NWOM), WOM Ratio (PWOM ÷ NWOM)',
      'Competitive WOM Table — all brands ranked by Net WOM with PWOM and NWOM breakdown',
      'Trend Chart — PWOM and NWOM bars wave over wave for BCA',
      'Analysis Panel — segment-aware headline + recommendation',
      'WOM Ratio target: >4× is considered strong advocacy balance',
      'Add WOM Data button — enter per-brand PWOM and NWOM per wave',
    ]
  },
  {
    id: 'forecast',
    label: 'Forecast Engine',
    url: '/dashboard/forecast',
    wait: 1200,
    description: 'Five forward-looking forecast tools in one page. Covers mechanistic laws (Double Jeopardy), formula-based projections (CEP expected scores), statistical correlation (MMS→Sales), AI simulation, and growth potential mapping.',
    features: [
      'Tab 1 — DJ Forecast: Scatter chart of brands on DJ curve + interactive scenario builder (drag pen target → predicted frequency)',
      'Tab 2 — CEP Expected Scores: Full brand × CEP numerical matrix with Actual / Expected / Deviation columns',
      'Tab 3 — MMS → Sales: Dual-line chart history + projection (r=0.83 correlation, 1–2 quarter lag)',
      'Tab 4 — AI Predictions: Media spend multiplier slider, category twin benchmarks, AI-generated trend alerts',
      'Tab 5 — Growth Potential: MPen by segment cards, growth waterfall chart, Recruitment vs Network Size priority framework',
    ]
  },
  {
    id: 'ceps',
    label: 'CEP Builder',
    url: '/dashboard/ceps',
    wait: 1000,
    description: 'Design a CBM-compliant attribute list for your brand tracking survey. Uses the 7W framework to generate Category Entry Points. The CBM Engine validates each attribute and flags violations before survey launch.',
    features: [
      '7W Framework Tabs — Who, What, When, Where, Why, With What, With Whom',
      'Attribute List Builder — add, edit, classify attributes as CEP / Baseline / Secondary',
      'Composition Meter — visual gauge showing % split; target 60–70% CEPs',
      'CBM Violation Flags — red border on attributes with superlatives, brand-specific wording, or duplicates',
      'AI Generate button — auto-draft CEPs from a brand brief or URL',
      'Violation types caught: modified wording, brand-specific CEPs, duplicate occasions',
    ]
  },
  {
    id: 'surveys',
    label: 'Surveys',
    url: '/dashboard/surveys',
    wait: 1000,
    description: 'Build and manage brand health fieldwork waves. Includes a block-based survey canvas, a 17-block question library, compliance checking, and a results upload pipeline.',
    features: [
      'Block Library — 17 question blocks categorised as Core (mandatory), Standard (recommended), Optional',
      'Survey Canvas — drag-and-drop blocks to build a wave in the correct CBM order',
      'Core Blocks (teal border) — mandatory, cannot be removed: Category Screener, Brand Awareness, CEP Linkage, Purchase Behaviour',
      'CBM Compliance Panel — real-time flags before survey export',
      'Upload Results Tab — drag-and-drop Excel fieldwork data with 5-row preview',
      'AI Analysis — auto-generated summary of key changes after upload',
      'WhatsApp distribution support (via Settings → Integrations)',
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    url: '/dashboard/reports',
    wait: 800,
    description: 'Generate client-ready outputs from the latest wave data. Four output formats covering different audiences — from C-suite PDF summaries to pivot-ready Excel exports.',
    features: [
      'Executive Summary PDF — one-page CEO brief, auto-populated from latest wave',
      'Full Report PPTX — multi-slide deck covering all analytics pages',
      'CBM Compliance Report — methodology audit before client delivery',
      'Raw Data Export XLSX — respondent-level or aggregate, pivot-ready format',
      'Wave period selector — choose which wave to generate the report from',
      'Section selector — choose which pages to include in PPTX',
    ]
  },
  {
    id: 'help',
    label: 'Help & Documentation',
    url: '/dashboard/help',
    wait: 800,
    description: 'Full in-app product manual with three sections: Getting Started (intro + first-time workflow), Page Manual (how to use and interpret every page), and Reference (methodology, KPI formulas, FAQ).',
    features: [
      'Getting Started — platform introduction, CBM Mantra, platform structure, 7-step first-time workflow',
      'Page Manual — 10 pages covered with step-by-step how-to and data interpretation guides',
      'CBM Basics — what brand tracking is, what CBM is, why non-buyers are primary',
      'Methodology Guide — survey design rules, attribute composition, DJ normalization, analysis defaults',
      'KPI Reference — 8 KPIs with formula, range, and target benchmark',
      'FAQ — 10 common questions with detailed answers',
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    url: '/dashboard/settings',
    wait: 800,
    description: 'Platform configuration. Manage theme preferences, integrations, data connections, and account settings.',
    features: [
      'Theme settings — light/dark mode toggle',
      'Integrations panel — WhatsApp Business API, Anthropic Claude API, Resend email',
      'Data connections — database and external data source configuration',
      'Account and organisation management',
    ]
  },
]

// ── HTML template ────────────────────────────────────────────────────────────
function buildHTML(pages) {
  const toc = pages.map((p, i) =>
    `<li><a href="#page-${p.id}">${i + 1}. ${p.label}</a></li>`
  ).join('\n    ')

  const sections = pages.map((p, i) => {
    const imgSrc = `screenshots/${p.id}.png`
    const features = p.features.map(f => `<li>${f}</li>`).join('\n            ')
    return `
  <!-- ══ ${p.label.toUpperCase()} ══ -->
  <div class="page-section" id="page-${p.id}">
    <div class="page-header">
      <div class="page-number">${String(i + 1).padStart(2, '0')}</div>
      <div>
        <h2>${p.label}</h2>
        <code class="route">${PAGES[i].url === '/' ? 'http://localhost:3000' : `http://localhost:3000${PAGES[i].url}`}</code>
      </div>
    </div>

    <div class="screenshot-box">
      <img src="${imgSrc}" alt="${p.label} screenshot" onerror="this.parentElement.innerHTML='<div class=&quot;no-shot&quot;>Screenshot not available</div>'" />
    </div>

    <div class="description-block">
      <h3>Overview</h3>
      <p>${p.description}</p>
    </div>

    <div class="features-block">
      <h3>Features &amp; Components</h3>
      <ul>
        ${features}
      </ul>
    </div>
  </div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Fortuna — Page-by-Page Feature Guide</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Calibri, Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    margin: 0;
    background: #f9fafb;
  }
  a { color: #0FA958; }

  /* Cover */
  .cover {
    background: #1a1a1a;
    color: white;
    padding: 80px 60px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .cover .logo {
    width: 64px; height: 64px;
    background: #0FA958;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28pt; font-weight: 900; color: white;
    margin-bottom: 28px;
  }
  .cover h1 { font-size: 32pt; margin: 0 0 10px; color: white; }
  .cover .sub { font-size: 14pt; color: #9ca3af; margin: 0 0 40px; }
  .cover .meta { font-size: 10pt; color: #6b7280; border-top: 1px solid #374151; padding-top: 20px; }
  .cover .green { color: #0FA958; }

  /* TOC */
  .toc-page {
    background: white;
    padding: 60px;
    border-bottom: 3px solid #0FA958;
  }
  .toc-page h2 { font-size: 16pt; color: #0FA958; margin-top: 0; }
  .toc-page ol { columns: 2; column-gap: 40px; padding-left: 20px; }
  .toc-page li { margin-bottom: 8px; break-inside: avoid; }
  .toc-page a { color: #0FA958; text-decoration: none; font-size: 11pt; }
  .toc-page a:hover { text-decoration: underline; }

  /* Page section */
  .page-section {
    background: white;
    margin: 24px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    page-break-before: always;
  }
  .page-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 24px 32px 16px;
    border-bottom: 2px solid #f3f4f6;
    background: #fafafa;
  }
  .page-number {
    background: #0FA958;
    color: white;
    font-size: 16pt;
    font-weight: 900;
    width: 52px; height: 52px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    shrink: 0;
    flex-shrink: 0;
  }
  .page-header h2 { margin: 0 0 4px; font-size: 16pt; color: #1a1a1a; }
  .route {
    font-family: Consolas, monospace;
    font-size: 9.5pt;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 4px;
    color: #6b7280;
  }

  /* Screenshot */
  .screenshot-box {
    padding: 20px 32px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .screenshot-box img {
    width: 100%;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    display: block;
  }
  .no-shot {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 10pt;
    background: #f3f4f6;
    border-radius: 6px;
    border: 2px dashed #e5e7eb;
  }

  /* Description + features */
  .description-block, .features-block {
    padding: 20px 32px;
  }
  .description-block { border-bottom: 1px solid #f3f4f6; }
  h3 {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin: 0 0 10px;
  }
  .description-block p {
    margin: 0;
    font-size: 11pt;
    color: #374151;
    line-height: 1.6;
  }
  .features-block ul {
    margin: 0;
    padding-left: 20px;
    list-style: none;
  }
  .features-block li {
    font-size: 10.5pt;
    color: #4b5563;
    margin-bottom: 5px;
    padding-left: 4px;
    position: relative;
    line-height: 1.5;
  }
  .features-block li::before {
    content: "→";
    color: #0FA958;
    font-weight: bold;
    position: absolute;
    left: -16px;
  }

  /* Content wrapper */
  .content { max-width: 960px; margin: 0 auto; padding: 0 24px 60px; }

  @media print {
    .page-section { page-break-before: always; box-shadow: none; margin: 0; border-radius: 0; }
    .cover { page-break-after: always; }
    .toc-page { page-break-after: always; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="logo">F</div>
  <h1>Fortuna Brand Health Tracker</h1>
  <p class="sub">Page-by-Page Feature Guide · Screenshots &amp; Explanations</p>
  <p style="color:#6b7280; font-size:11pt; margin-bottom:40px;">
    A complete visual reference of every page and feature in the platform.<br>
    Built on CBM methodology · Science-based brand measurement.
  </p>
  <table style="border-collapse:collapse; font-size:10.5pt;">
    <tr>
      <td style="color:#6b7280; padding: 4px 20px 4px 0;">Total Pages</td>
      <td style="color:white; font-weight:bold;">${pages.length}</td>
    </tr>
    <tr>
      <td style="color:#6b7280; padding: 4px 20px 4px 0;">Platform</td>
      <td style="color:white; font-weight:bold;">Next.js 14 · Tailwind CSS · Recharts</td>
    </tr>
    <tr>
      <td style="color:#6b7280; padding: 4px 20px 4px 0;">Methodology</td>
      <td style="color:white; font-weight:bold;">CBM (Category Buyer Memory)</td>
    </tr>
    <tr>
      <td style="color:#6b7280; padding: 4px 20px 4px 0;">Built by</td>
      <td style="color:white; font-weight:bold;">Prima Hanura Akbar</td>
    </tr>
    <tr>
      <td style="color:#6b7280; padding: 4px 20px 4px 0;">Version</td>
      <td style="color:white; font-weight:bold;">0.5 · April 2026</td>
    </tr>
  </table>
  <div class="meta">
    GitHub: https://github.com/matiyashu/Brand-Health-Tracker---Mental-Availability-Physical-Availability
  </div>
</div>

<!-- TOC -->
<div class="toc-page">
  <h2>Table of Contents</h2>
  <ol>
    ${toc}
  </ol>
</div>

<!-- PAGES -->
<div class="content">
  ${sections}
</div>

</body>
</html>`
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('Launching browser...')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  for (const p of PAGES) {
    const url = `${BASE}${p.url}`
    console.log(`📸  Capturing ${p.label} → ${url}`)
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
      await new Promise(r => setTimeout(r, p.wait))
      const outPath = path.join(SHOTS_DIR, `${p.id}.png`)
      await page.screenshot({ path: outPath, fullPage: false })
      console.log(`    ✓ Saved ${p.id}.png`)
    } catch (err) {
      console.warn(`    ✗ Failed: ${err.message}`)
    }
  }

  await browser.close()
  console.log('\nGenerating HTML document...')

  const html = buildHTML(PAGES)
  const outFile = path.join(ROOT, 'Fortuna_Feature_Guide.html')
  fs.writeFileSync(outFile, html, 'utf8')
  console.log(`\n✅  Done → ${outFile}`)
  console.log('   Open in Word (File → Open) then Save As .docx')
  console.log('   Or open directly in your browser to view.')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
