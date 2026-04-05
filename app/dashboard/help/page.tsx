'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import {
  ChevronDown, BookOpen, FlaskConical, BarChart2, HelpCircle,
  Sparkles, LayoutDashboard, Brain, ShoppingBag, Megaphone,
  MessageSquare, TrendingUp, Target, ClipboardList, FileText,
  BarChart3, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Nav structure ─────────────────────────────────────────────────────────────
type Section =
  | 'intro'
  | 'dashboard' | 'analytics' | 'mental' | 'physical' | 'reach' | 'wom'
  | 'forecast' | 'ceps' | 'surveys' | 'reports'
  | 'basics' | 'methodology' | 'kpi' | 'faq'

const sections: { key: Section; label: string; icon: ElementType; color: string; group: string }[] = [
  { key: 'intro',      label: 'Introduction',           icon: Sparkles,       color: 'text-neon-green',  group: 'Getting Started' },
  { key: 'dashboard',  label: 'Dashboard Overview',     icon: LayoutDashboard,color: 'text-blue-500',    group: 'Page Manual' },
  { key: 'analytics',  label: 'Brand KPIs',             icon: BarChart3,      color: 'text-violet-500',  group: 'Page Manual' },
  { key: 'mental',     label: 'Mental Advantage',       icon: Brain,          color: 'text-blue-500',    group: 'Page Manual' },
  { key: 'physical',   label: 'Physical Availability',  icon: ShoppingBag,    color: 'text-amber-500',   group: 'Page Manual' },
  { key: 'reach',      label: 'Marketing Reach',        icon: Megaphone,      color: 'text-pink-500',    group: 'Page Manual' },
  { key: 'wom',        label: 'WOM Tracker',            icon: MessageSquare,  color: 'text-teal-500',    group: 'Page Manual' },
  { key: 'forecast',   label: 'Forecast',               icon: TrendingUp,     color: 'text-neon-green',  group: 'Page Manual' },
  { key: 'ceps',       label: 'CEP Builder',            icon: Target,         color: 'text-orange-500',  group: 'Page Manual' },
  { key: 'surveys',    label: 'Surveys',                icon: ClipboardList,  color: 'text-indigo-500',  group: 'Page Manual' },
  { key: 'reports',    label: 'Reports',                icon: FileText,       color: 'text-gray-500',    group: 'Page Manual' },
  { key: 'basics',     label: 'Brand Tracking Basics',  icon: BookOpen,       color: 'text-blue-500',    group: 'Reference' },
  { key: 'methodology',label: 'Methodology Guide',      icon: FlaskConical,   color: 'text-violet-500',  group: 'Reference' },
  { key: 'kpi',        label: 'KPI Reference',          icon: BarChart2,      color: 'text-neon-green',  group: 'Reference' },
  { key: 'faq',        label: 'FAQ',                    icon: HelpCircle,     color: 'text-pink-500',    group: 'Reference' },
]

const KPI_REFERENCE = [
  { kpi: 'Mental Penetration (MPen)', formula: 'Buyers linking ≥1 CEP to brand ÷ Total sample', range: '0–100%', target: '>50% is strong for a market leader', desc: 'The most important single metric. Measures how many category buyers mentally connect your brand to at least one buying situation.' },
  { kpi: 'Mental Market Share (MMS)', formula: 'Brand CEP links ÷ Total CEP links (all brands)', range: '0–100%', target: 'Should be close to Sales Market Share', desc: 'Your brand\'s share of all mental associations in the competitive set. DJ-normalized to control for brand size.' },
  { kpi: 'Network Score (NS)', formula: 'Total brand CEP links ÷ Buyers with MPen', range: '1.0–CEP count', target: '>4.0 is healthy breadth', desc: 'Average CEPs a buyer with Mental Penetration associates with your brand. Measures depth of mental representation.' },
  { kpi: 'Share of Mind (SoM)', formula: 'Brand CEP links ÷ Total links among MPen base', range: '0–100%', target: 'Benchmark against MMS', desc: 'Among buyers who already have some mental connection with your brand, how strong is that connection relative to competitors.' },
  { kpi: 'MMS vs SMS Gap', formula: 'MMS − SMS (Sales Market Share)', range: 'Any pp value', target: 'Gap < ±3pp is healthy', desc: 'Positive gap (MMS > SMS) = physical availability problem. Negative gap (SMS > MMS) = buyers without mental links.' },
  { kpi: 'PWOM / NWOM', formula: 'Recommend or warn in past month per 100 buyers', range: '0–100', target: 'PWOM/NWOM ratio >4× is strong', desc: 'Word of Mouth — positive and negative — measured per 100 category buyers. Net WOM = PWOM − NWOM.' },
  { kpi: 'Effective Reach', formula: '% of category buyers who noticed the ad', range: '0–100%', target: '>40% is strong for a TV campaign', desc: 'Measured via de-branded exposure test. % of the category buyer sample who saw and remembered the creative.' },
  { kpi: 'Correct Branding %', formula: 'Buyers who unprompted recalled the brand after exposure', range: '0–100%', target: 'Branding Ratio (branded/noticed) >70% is strong', desc: 'Of those who noticed the ad, how many correctly attributed it to your brand. Low score = "vampire creativity."' },
]

const FAQ = [
  { q: 'Why can\'t I use Likert scales?', a: 'CBM requires binary pick-any format for all attribute questions. Likert scales introduce acquiescence bias and inflate scores for all brands equally, making competitive comparison unreliable. Binary forces genuine top-of-mind associations.' },
  { q: 'What is Double Jeopardy normalization?', a: 'Smaller brands naturally score lower on all metrics because fewer people buy them — not because their branding is weaker. DJ normalization calculates an expected score based on penetration, then shows deviation from expected. This enables fair comparison across brands of different sizes.' },
  { q: 'Why must brands be ordered alphabetically?', a: 'Position bias means brands listed first get higher selection rates. CBM enforces strict alphabetical ordering to eliminate this bias so all linkage scores are comparable across waves.' },
  { q: 'What are non-buyers and why are they primary?', a: 'Non-buyers and light buyers are the growth pool. Heavy buyers already choose your brand — they need retention, not conversion. Mental availability strategy targets the larger group of people who buy the category but haven\'t chosen you, or haven\'t recently.' },
  { q: 'How often should I run a wave?', a: 'Quarterly waves are standard for most FMCG and financial services categories. Categories with rapid competitive movement may benefit from bi-monthly tracking. Minimum annual is required to compute any trend.' },
  { q: 'What sample size do I need?', a: 'Minimum n=500 category buyers per wave for stable estimates. For subgroup analysis (by city or age), target n=100+ per subgroup. Non-buyer quota: at least 30% of total sample.' },
  { q: 'What is MMS and how does it differ from awareness?', a: 'Mental Market Share (MMS) measures the proportion of all category buying occasions your brand "wins" mentally, across the whole competitive set. Awareness is binary (have you heard of X?). MMS is contextual — it asks which brand comes to mind in specific buying situations.' },
  { q: 'How do I know if my MMS–SMS gap is a mental or physical problem?', a: 'If MMS > SMS: you have a physical availability problem — buyers think of you but can\'t find or buy you. Close distribution gaps. If SMS > MMS: you have a mental availability problem — sales are driven by habit but mental links are weak and vulnerable. Build CEP coverage.' },
  { q: 'What is a good Branding Ratio for reach?', a: 'Branding Ratio = Correctly Branded % ÷ Noticed %. A ratio above 70% means most people who saw the ad knew it was yours. Below 50% means your creative is noticed but not attributed — review brand prominence in the execution.' },
  { q: 'What does PWOM/NWOM ratio mean?', a: 'A 6:1 PWOM:NWOM ratio means for every 1 person warning others against your brand, 6 are recommending it. Ratios above 4× are considered strong. Track the ratio trend more than absolute values.' },
]

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('rounded-xl border transition-all', open ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-white')}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
        <span className="text-sm text-gray-700 font-medium">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-gray-300 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

function ManualCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <p className="text-gray-900 font-semibold text-sm border-b border-gray-100 pb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-5 h-5 rounded-full bg-neon-green/10 text-neon-green text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
      <p className="text-xs text-gray-500 leading-relaxed">{children}</p>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-neon-green font-bold text-xs shrink-0 mt-px">→</span>
      <p className="text-xs text-gray-500 leading-relaxed">{children}</p>
    </div>
  )
}

function Callout({ label, children, color = 'green' }: { label: string; children: React.ReactNode; color?: 'green' | 'amber' | 'red' | 'blue' }) {
  const styles = {
    green: 'bg-neon-green/5 border-neon-green/20 text-neon-green/70',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    red:   'bg-red-50 border-red-200 text-red-500',
    blue:  'bg-blue-50 border-blue-200 text-blue-500',
  }
  return (
    <div className={cn('rounded-lg border p-3', styles[color].split(' ').slice(0, 2).join(' '))}>
      <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', styles[color].split(' ')[2])}>{label}</p>
      <p className="text-gray-600 text-xs leading-relaxed">{children}</p>
    </div>
  )
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<Section>('intro')
  const current = sections.find((s) => s.key === activeSection)!
  const groups = ['Getting Started', 'Page Manual', 'Reference']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Fortuna</p>
        <h1 className="text-gray-900 text-2xl font-bold">Help & Documentation</h1>
        <p className="text-gray-400 text-xs mt-1">Product manual · CBM methodology guide · KPI reference · FAQ</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-60 shrink-0 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <p className="px-3 mb-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">{group}</p>
              <div className="space-y-0.5">
                {sections.filter((s) => s.group === group).map((s) => {
                  const Icon = s.icon
                  return (
                    <button key={s.key} onClick={() => setActiveSection(s.key)}
                      className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
                        activeSection === s.key ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      )}>
                      <Icon className={cn('w-3.5 h-3.5 shrink-0', activeSection === s.key ? s.color : 'text-gray-300')} />
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 min-w-0">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <current.icon className={cn('w-5 h-5', current.color)} />
            <h2 className="text-gray-900 text-lg font-bold">{current.label}</h2>
          </div>

          {/* ══ INTRO ══════════════════════════════════════════════════════════ */}
          {activeSection === 'intro' && (
            <div className="space-y-5">
              <div className="rounded-xl bg-gradient-to-br from-neon-green/5 to-white border border-neon-green/20 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-neon-green flex items-center justify-center">
                    <span className="text-white font-black text-xs">F</span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-base">Fortuna Brand Health Platform</p>
                    <p className="text-gray-400 text-[11px]">by Prima Hanura Akbar · CBM-compliant · Built on Ehrenberg-Bass principles</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Fortuna is a brand health tracking platform designed specifically for Category Buyer Memory (CBM) methodology. It helps brand strategists and insights teams measure, track, and act on mental availability data — the degree to which consumers think of your brand in buying situations.
                </p>
              </div>

              <ManualCard title="Who is Fortuna for?">
                <Bullet><strong>Brand Managers</strong> — Track mental penetration, MMS, and competitive position wave over wave.</Bullet>
                <Bullet><strong>Insights / Research Teams</strong> — Design CBM-compliant surveys, upload fieldwork data, and generate analysis-ready outputs.</Bullet>
                <Bullet><strong>Media Planners</strong> — Measure effective reach and correct branding attribution for each campaign creative.</Bullet>
                <Bullet><strong>Strategy Consultants</strong> — Use forecasting tools and Mental Advantage maps to build brand growth recommendations.</Bullet>
              </ManualCard>

              <ManualCard title="Core Principles — The CBM Mantra">
                <div className="space-y-3">
                  {[
                    { n: '1', label: 'Design for the Category', text: 'Category Entry Points (CEPs) describe the category\'s buying occasions — not brand-specific moments. Every brand is benchmarked against the same CEP set.' },
                    { n: '2', label: 'Analyse for the Buyer', text: 'Non-buyers and light buyers are the primary analysis segment. They are the growth pool — heavy buyers already prefer your brand and provide limited upside.' },
                    { n: '3', label: 'Report for the Brand', text: 'All scores are DJ-normalized (Double Jeopardy) so a small brand can be fairly compared to a large one. Deviation from expected is what matters, not absolute scores.' },
                  ].map((p) => (
                    <div key={p.n} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-neon-green text-white text-[10px] font-black flex items-center justify-center shrink-0">{p.n}</span>
                      <div>
                        <p className="text-gray-900 font-semibold text-xs mb-0.5">{p.label}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{p.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ManualCard>

              <ManualCard title="Platform Structure at a Glance">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { group: 'Research',  icon: Target,         items: ['CEP Builder — design your attribute list', 'Surveys — build and manage fieldwork waves'] },
                    { group: 'Analytics', icon: BarChart3,      items: ['Brand KPIs — competitive dashboard', 'Mental Advantage — CEP deviation map', 'Physical Availability — distribution audit', 'Marketing Reach — creative effectiveness', 'WOM Tracker — word-of-mouth scores', 'Forecast — projections and simulations'] },
                    { group: 'Outputs',   icon: FileText,       items: ['Reports — PDF, PPTX, CSV exports'] },
                    { group: 'Settings',  icon: HelpCircle,     items: ['Theme, integrations, data connections'] },
                  ].map((g) => {
                    const Icon = g.icon
                    return (
                      <div key={g.group} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-gray-700 font-semibold text-xs">{g.group}</p>
                        </div>
                        <ul className="space-y-1">
                          {g.items.map((item) => <li key={item} className="text-gray-400 text-[11px] pl-2">· {item}</li>)}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </ManualCard>

              <ManualCard title="Recommended First-Time Workflow">
                <Step n={1}>Go to <strong>CEP Builder</strong> — review or build the Category Entry Points for your category using the 7W framework. Ensure composition is 60–70% CEPs.</Step>
                <Step n={2}>Go to <strong>Surveys</strong> — drag mandatory core blocks onto the canvas and add your CEP attribute block. Download the template and send to your fieldwork partner.</Step>
                <Step n={3}>When fieldwork returns, upload the data in Surveys → Upload Results. The platform will parse scores and populate all dashboards.</Step>
                <Step n={4}>Review <strong>Dashboard</strong> on the Non-buyers + Light segment first — this is your primary growth audience.</Step>
                <Step n={5}>Check <strong>Mental Advantage</strong> for DEFEND / BUILD cells — these drive your creative and comms brief.</Step>
                <Step n={6}>Review the <strong>MMS vs SMS gap</strong> in Dashboard and Physical Availability — determines whether your next priority is mental or physical.</Step>
                <Step n={7}>Use <strong>Forecast → Growth Potential</strong> to quantify the MPen upside among non-buyers and brief media investment accordingly.</Step>
              </ManualCard>
            </div>
          )}

          {/* ══ DASHBOARD ══════════════════════════════════════════════════════ */}
          {activeSection === 'dashboard' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                The Dashboard is your command centre — a CEO-ready summary of brand health for the current wave, with segment-aware analysis and a gap diagnosis.
              </p>
              <ManualCard title="Segment Toggle">
                <p className="text-xs text-gray-500 leading-relaxed mb-2">Located in the top-right of most dashboards. Controls which buyer group all metrics and charts reflect.</p>
                <div className="space-y-2">
                  {[
                    { seg: 'Non-buyers + Light (Default)', desc: 'The growth pool. Non-buyers and infrequent buyers. Primary segment for mental availability strategy — this is who you need to recruit.' },
                    { seg: 'Heavy Buyers', desc: 'Frequent purchasers. Use this segment to assess retention risk. Heavy buyer MPen is usually high — watch for SoM drops or NS decline as early warning signs.' },
                    { seg: 'Overall', desc: 'Full sample. Best for MMS calculation and competitive benchmarking — total category picture.' },
                  ].map((s) => (
                    <div key={s.seg} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-gray-800 font-semibold text-xs mb-0.5">{s.seg}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="KPI Cards — How to Read">
                <Bullet><strong>Mental Penetration (MPen)</strong> — % of category buyers who link your brand to at least one CEP. The single most important metric. Up is growth; down is an early warning before sales slip.</Bullet>
                <Bullet><strong>Mental Market Share (MMS)</strong> — Your share of all category CEP links. Should track close to Sales Market Share. A persistent MMS &gt; SMS gap means physical distribution is underperforming.</Bullet>
                <Bullet><strong>Network Score (NS)</strong> — Average number of CEPs per MPen buyer. Below 4.0 signals narrow mental representation — your brand only &quot;wins&quot; in a few situations.</Bullet>
                <Bullet><strong>Share of Mind (SoM)</strong> or <strong>SoM / Prompted Awareness</strong> — Segment-specific. In heavy buyer view, SoM drop is a key retention warning.</Bullet>
              </ManualCard>
              <ManualCard title="Segment Banner">
                <p className="text-xs text-gray-500 leading-relaxed">The green stripe below the header shows the active segment, its primary KPI, and the strategic goal. This anchors every metric on the page to the right frame of reference:</p>
                <Bullet>Non-buyers + Light → primary KPI is <strong>MPen</strong> → strategic goal is <strong>Recruitment</strong></Bullet>
                <Bullet>Heavy Buyers → primary KPI is <strong>SoM</strong> → strategic goal is <strong>Retention</strong></Bullet>
                <Bullet>Overall → primary KPI is <strong>MMS</strong> → strategic goal is <strong>Competitive benchmarking</strong></Bullet>
              </ManualCard>
              <ManualCard title="Key Insight Panel">
                <p className="text-xs text-gray-500 leading-relaxed">The analysis card below the KPIs dynamically changes per segment. It includes:</p>
                <Bullet><strong>Headline</strong> — a CEO-ready one-sentence summary of the current wave.</Bullet>
                <Bullet><strong>Segment Analysis</strong> — 3 metric bars showing the priority KPI with context (wave-on-wave change, benchmark comparison).</Bullet>
                <Bullet><strong>Recommendation</strong> — an actionable next step anchored in CBM principles.</Bullet>
              </ManualCard>
              <ManualCard title="MMS vs SMS Gap Diagnosis">
                <Bullet><strong>MMS &gt; SMS (green label &quot;Mental Strength&quot;)</strong> — Your brand is thought of more than it is bought. Physical availability is the bottleneck. Action: expand distribution.</Bullet>
                <Bullet><strong>MMS &lt; SMS (red label &quot;Physical Strength&quot;)</strong> — Your brand is bought more than it is thought of. Loyal buyers but fragile mental links. Action: reinforce CEP coverage in media.</Bullet>
                <Bullet>Use the <strong>Physical Availability</strong> page (Presence tab) to diagnose which channels are creating the gap.</Bullet>
              </ManualCard>
              <Callout label="How to add data">Select &quot;Add Data&quot; in the top-right of any dashboard section. You can enter data manually by wave or upload a pre-formatted Excel file. Download the CSV template from the modal to get the correct column format.</Callout>
            </div>
          )}

          {/* ══ ANALYTICS ══════════════════════════════════════════════════════ */}
          {activeSection === 'analytics' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">Brand KPIs provides the competitive view — all brands in the category benchmarked side-by-side with DJ-normalized scores.</p>
              <ManualCard title="Competitive Bar Chart">
                <Bullet>The primary chart shows all brands ranked by the active segment&apos;s focal metric (MPen for non-light, SoM for heavy, MMS for overall).</Bullet>
                <Bullet>BCA is highlighted in <span className="text-neon-green font-semibold">green</span>. All other brands are shown in gray for clear focal brand contrast.</Bullet>
                <Bullet>Scores are DJ-normalized — use the deviation from DJ expected (shown in the table below the chart) to assess whether BCA&apos;s position is above or below what its size predicts.</Bullet>
              </ManualCard>
              <ManualCard title="Interpreting Competitive Position">
                <div className="space-y-2">
                  {[
                    { scenario: 'BCA ranks #1 and is above DJ expected', interpretation: 'Structural mental advantage. Defend the leading CEPs and reinforce media consistency.', color: 'text-neon-green' },
                    { scenario: 'BCA ranks #1 but at DJ expected', interpretation: 'Position reflects brand size only — no mental advantage. Targeted CEP investment needed.', color: 'text-amber-500' },
                    { scenario: 'BCA ranks #2+ but above DJ expected', interpretation: 'Punching above weight. Good trajectory — close the gap to #1 by growing penetration.', color: 'text-blue-500' },
                    { scenario: 'BCA is below DJ expected', interpretation: 'Underperforming relative to size. Review CEP coverage and creative effectiveness.', color: 'text-red-500' },
                  ].map((s) => (
                    <div key={s.scenario} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className={cn('font-semibold text-xs mb-0.5', s.color)}>{s.scenario}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{s.interpretation}</p>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="Segment Analysis Panel">
                <Bullet>Each segment has a unique insight paragraph and headline KPI. Switch segments to see how the competitive story changes — the ranking order often shifts between non-light and heavy buyer views.</Bullet>
                <Bullet>The data requirements checklist at the bottom of the panel flags whether the current wave data meets CBM standards. Amber items should be resolved before reporting.</Bullet>
              </ManualCard>
            </div>
          )}

          {/* ══ MENTAL ADVANTAGE ═══════════════════════════════════════════════ */}
          {activeSection === 'mental' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                The Mental Advantage page shows a brand × CEP heatmap. Each cell shows how much a brand over- or under-performs its expected score on a specific Category Entry Point — revealing true mental advantages and gaps.
              </p>
              <ManualCard title="Reading the Heatmap">
                <div className="space-y-2">
                  {[
                    { label: 'DEFEND (green, ≥+5pp)', desc: 'Brand scores at least 5 percentage points above the DJ expected score. This CEP is a mental asset. Feature it consistently in media and protect it from competitive erosion.' },
                    { label: 'MAINTAIN (gray, −4pp to +4pp)', desc: 'Brand is at the expected level for its size. Hold the line. No urgent action required, but monitor for downward drift.' },
                    { label: 'BUILD (red, ≤−5pp)', desc: 'Brand scores at least 5pp below expected. This CEP is a mental gap. It\'s a buying situation where the brand is absent in buyers\' minds. Prioritise in next campaign brief.' },
                  ].map((c) => (
                    <div key={c.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-gray-800 font-semibold text-xs mb-0.5">{c.label}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="The DJ Expected Score Formula">
                <p className="text-xs text-gray-500 leading-relaxed mb-2">Every cell has an expected score calculated by:</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono text-gray-700 mb-2">
                  Expected = (Row Total × Column Total) ÷ Grand Total
                </div>
                <Bullet><strong>Row Total</strong> = sum of all CEP links for that brand across all attributes.</Bullet>
                <Bullet><strong>Column Total</strong> = sum of all brand links for that CEP.</Bullet>
                <Bullet><strong>Grand Total</strong> = all brand × CEP links in the matrix.</Bullet>
                <Bullet>This removes size bias — a large brand like Mandiri naturally gets more links overall, so its expected scores are higher. Deviation shows true strength, not just frequency.</Bullet>
              </ManualCard>
              <ManualCard title="Strategic Summary Cards">
                <Bullet>Below the heatmap, each brand gets a summary card showing its count of DEFEND / MAINTAIN / BUILD cells and a one-line strategic read.</Bullet>
                <Bullet>For BCA, prioritise protecting DEFEND cells in your creative brief and attacking BUILD cells in your next campaign.</Bullet>
                <Bullet>For competitors, BUILD cells in their profile are potential conquest opportunities for BCA.</Bullet>
              </ManualCard>
              <Callout label="How to add data">Click &quot;Add Data&quot; and enter the actual % and expected % per brand × CEP cell. The platform calculates deviation automatically. Use the CSV template for bulk upload of the full matrix.</Callout>
            </div>
          )}

          {/* ══ PHYSICAL AVAILABILITY ══════════════════════════════════════════ */}
          {activeSection === 'physical' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                Physical Availability measures whether buyers can actually buy your brand when the category impulse strikes. It has three measurement pillars and a gap analysis tab.
              </p>
              <ManualCard title="Tab 1 — Overview">
                <Bullet>Shows 4 KPI cards: Channel Coverage %, Active Channels, Strong Distinctive Assets, and MMS–SMS gap pp.</Bullet>
                <Bullet>Three pillar summary cards (Presence, Portfolio, Prominence) give a quick status per pillar.</Bullet>
                <Bullet>The <strong>Buyer Bias Warning</strong> (if present) flags that the data is sourced from a buyer sample — may not reflect non-buyer accessibility.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 2 — Presence (Channel Coverage)">
                <Bullet><strong>Channel Coverage Table</strong> — Each row is a distribution channel (bank branches, ATMs, online, partner merchants, agent banking, WhatsApp). Columns show BCA coverage %, category norm %, and gap.</Bullet>
                <Bullet>Channels with coverage significantly below category norm are the physical availability bottleneck driving the MMS &gt; SMS gap.</Bullet>
                <Bullet><strong>Emerging Outlets</strong> — Channels not yet measured (e.g. embedded finance, super-apps). Monitor for category entry. First-mover advantage in a new channel can establish a CEP ownership.</Bullet>
                <Callout label="Interpretation" color="blue">Agent banking and WhatsApp at 0% coverage in the example data represent the largest gap. These are growing access channels in the Indonesian market. Closing these gaps is a high-priority physical availability action.</Callout>
              </ManualCard>
              <ManualCard title="Tab 3 — Portfolio (SKU Contribution)">
                <Bullet><strong>SKU Contribution Matrix</strong> — Each card product is measured by sales %, penetration %, and efficiency ratio (pen ÷ sales). High efficiency = broad reach per sales unit = good for penetration growth.</Bullet>
                <Bullet><strong>Duplication of Purchase</strong> — Gaps in the expected duplication pattern (buyers of SKU A should also buy SKU B at a predictable rate) indicate portfolio holes. These gaps identify product categories where BCA is absent but buyers need coverage.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 4 — Prominence (Distinctive Assets)">
                <Bullet>Plots brand assets on a <strong>Fame × Uniqueness</strong> matrix. Assets should aim for high fame (widely known) and high uniqueness (not confused with competitors).</Bullet>
                <Bullet><strong>High Fame + High Uniqueness</strong> → Protect these. They are BCA&apos;s strongest distinctive assets — they generate correct branding attribution.</Bullet>
                <Bullet><strong>Low Fame</strong> → Invest in exposure. These assets aren&apos;t reaching enough of the category.</Bullet>
                <Bullet><strong>Low Uniqueness</strong> → Risk of confusion. These assets may be triggering competitors when buyers see BCA communications.</Bullet>
                <Bullet><strong>Rented Prominence</strong> — Channels or events where BCA appears but doesn&apos;t own the context (e.g. sponsorship). High reach but low ownership — monitor that competitor can&apos;t easily displace.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 5 — Gap Analysis (MMS vs SMS Diagnosis)">
                <Bullet>This tab changes its content based on the segment toggle — each segment has a different physical availability diagnosis.</Bullet>
                <Bullet><strong>Non-buyers + Light</strong>: MMS–SMS gap signals mental problem — focus on CEP coverage.</Bullet>
                <Bullet><strong>Heavy Buyers</strong>: MMS–SMS gap signals physical problem — these buyers have mental availability but physical gaps prevent conversion.</Bullet>
                <Bullet><strong>Overall</strong>: Summary gap; use to prioritise mental vs physical investment mix.</Bullet>
              </ManualCard>
            </div>
          )}

          {/* ══ REACH ══════════════════════════════════════════════════════════ */}
          {activeSection === 'reach' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                Marketing Reach measures whether your advertising actually reached category buyers and — critically — whether they knew it was your brand. Both metrics must be tracked, not just one.
              </p>
              <ManualCard title="Key Metrics Explained">
                <Bullet><strong>Effective Reach (Noticed %)</strong> — % of category buyers who saw and noticed the ad. Measured via a de-branded stimulus (brand name removed). Category buyers, not just brand buyers, are the base.</Bullet>
                <Bullet><strong>Correct Branding % (Branded %)</strong> — Of those who noticed, the % who could spontaneously identify the brand after exposure. This is the gold standard — prompted brand recall is not used.</Bullet>
                <Bullet><strong>Branding Ratio</strong> — Branded % ÷ Noticed %. The higher this ratio, the better your creative is at driving brand attribution. Below 60% is a &quot;vampire creative&quot; warning — the ad is noticed but not linked to BCA.</Bullet>
              </ManualCard>
              <ManualCard title="Why De-branded Stimuli?">
                <p className="text-xs text-gray-500 leading-relaxed">Testing with the full branded creative inflates branding scores because respondents can simply read the logo. CBM methodology requires the brand name/logo to be removed so that only the distinctive assets (colour, characters, music, tagline) drive attribution. This reveals true memorability and brand-building effectiveness.</p>
              </ManualCard>
              <ManualCard title="Interpreting Creative Performance Scores">
                <div className="space-y-2">
                  {[
                    { score: 'Strong', criteria: 'Both noticed AND correctly branded above category norms', action: 'Scale — increase media investment. This creative is an asset.', color: 'text-neon-green' },
                    { score: 'Medium', criteria: 'Noticed well but branding attribution is moderate', action: 'Improve — strengthen distinctive asset prominence in the creative. Consider brand-forcing elements.', color: 'text-amber-500' },
                    { score: 'Weak', criteria: 'Low branded % despite potential reach', action: 'Retire or rework — the creative may be building the category rather than BCA. Review Correct Branding specifically.', color: 'text-red-500' },
                  ].map((s) => (
                    <div key={s.score} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <p className={cn('font-bold text-xs mb-0.5', s.color)}>{s.score}</p>
                      <p className="text-gray-600 text-xs mb-1">{s.criteria}</p>
                      <p className="text-gray-400 text-[11px] italic">{s.action}</p>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="Reach Trend Chart">
                <Bullet>Gray bars = Noticed %. Green bars = Correctly Branded %. The gap between them is attribution loss — buyers noticed something but didn&apos;t know it was BCA.</Bullet>
                <Bullet>A rising Noticed % with a flat Branded % signals worsening creative effectiveness — the media investment is reaching people but not building the brand.</Bullet>
              </ManualCard>
              <Callout label="How to add data">Click &quot;Add Data&quot; and enter Noticed % and Branded % per creative per wave. Use &quot;Upload Creative&quot; for the raw video/image file to store alongside scores. Download the CSV template for bulk upload.</Callout>
            </div>
          )}

          {/* ══ WOM ════════════════════════════════════════════════════════════ */}
          {activeSection === 'wom' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                The WOM Tracker measures Positive (PWOM) and Negative Word of Mouth per 100 category buyers — one of the strongest leading indicators of organic brand growth.
              </p>
              <ManualCard title="PWOM and NWOM Explained">
                <Bullet><strong>PWOM</strong> — In the past month, how many buyers out of 100 recommended your brand to someone? Binary question only (yes/no — not NPS scale).</Bullet>
                <Bullet><strong>NWOM</strong> — In the past month, how many buyers out of 100 warned someone against your brand? Binary question only.</Bullet>
                <Bullet><strong>Net WOM</strong> — PWOM − NWOM. The net advocacy balance. Positive values are healthy; negative values signal that NWOM is eroding brand reputation faster than PWOM builds it.</Bullet>
                <Bullet><strong>WOM Ratio</strong> — PWOM ÷ NWOM. A 6.5× ratio means for every 1 negative mention, there are 6.5 positive ones. Ratios above 4× are considered strong in most categories.</Bullet>
              </ManualCard>
              <ManualCard title="Why Binary (Not NPS)?">
                <p className="text-xs text-gray-500 leading-relaxed">NPS uses an 11-point intent scale which is subject to cultural bias and doesn&apos;t measure actual behaviour. CBM WOM uses a binary &quot;did you / didn&apos;t you&quot; format for actual past-month advocacy and warning behaviour. This captures real WOM events, not hypothetical intentions.</p>
              </ManualCard>
              <ManualCard title="Interpreting the Competitive Table">
                <Bullet>If BCA&apos;s Net WOM is highest in the competitive set, you have an organic advocacy advantage — invest in CX programmes that perpetuate it.</Bullet>
                <Bullet>If a competitor&apos;s PWOM is significantly higher, investigate their experience triggers (promotions, product quality, service events) that generate advocacy.</Bullet>
                <Bullet>High NWOM in any brand is an early warning of a service or product issue — monitor news and social alongside survey NWOM.</Bullet>
              </ManualCard>
              <ManualCard title="WOM Trend Chart">
                <Bullet>Green bars = PWOM. Red bars = NWOM. Watch for the gap between them — this is Net WOM visualised.</Bullet>
                <Bullet>A narrowing gap (PWOM falling, NWOM rising) is the highest-priority CX alert in the platform.</Bullet>
              </ManualCard>
              <Callout label="How to add data">Click &quot;Add WOM Data&quot; and enter PWOM and NWOM per brand per wave. Ensure data requirement &quot;Both given and received measured&quot; is satisfied — WOM received (heard about the brand) should also be captured for full picture.</Callout>
            </div>
          )}

          {/* ══ FORECAST ═══════════════════════════════════════════════════════ */}
          {activeSection === 'forecast' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                The Forecast page provides five forward-looking tools — from mechanistic laws to AI simulations. Use them to build growth projections and investment decisions backed by CBM data.
              </p>
              <ManualCard title="Tab 1 — DJ Forecast (Double Jeopardy Law)">
                <Bullet>The scatter chart plots all brands by penetration (x) vs purchase frequency (y). The green curve is the DJ expected line — brands cluster along it regardless of category or strategy.</Bullet>
                <Bullet><strong>Above the DJ curve</strong> = structural loyalty advantage (unusual; often indicates brand-specific product superiority).</Bullet>
                <Bullet><strong>Below the DJ curve</strong> = loyalty problem (buyers leave faster than expected for the brand&apos;s size).</Bullet>
                <Bullet>The <strong>Scenario Builder</strong> slider lets you set a target penetration. The platform predicts what frequency will be if the DJ law holds — useful for setting realistic growth targets.</Bullet>
                <Callout label="Key insight" color="blue">Growing penetration automatically increases frequency — not because buyers become more loyal, but because the brand reaches more buying occasions. This is the DJ mechanism.</Callout>
              </ManualCard>
              <ManualCard title="Tab 2 — CEP Expected Scores">
                <Bullet>A per-brand × per-CEP table showing Actual linkage %, Expected % (DJ formula), and Deviation (pp).</Bullet>
                <Bullet>This is the same underlying data as Mental Advantage Map but displayed numerically for precise analysis and export.</Bullet>
                <Bullet>Summary cards per brand show the count of advantage / gap / neutral CEPs — useful for slide decks and client reporting.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 3 — MMS → Sales Forecast">
                <Bullet>The dual-line chart shows MMS and SMS (Sales Market Share) history. MMS is the leading indicator — it predicts SMS movement 1–2 quarters ahead (r = 0.83).</Bullet>
                <Bullet>Dashed lines show the projected path. The projection assumes the current MMS trend continues and the physical availability gap narrows with distribution investment.</Bullet>
                <Bullet>Interpret: <strong>MMS 27% vs SMS 21%</strong> = 6pp gap. Physical availability problem. If distribution improves, SMS should converge to ~27% within 2 quarters.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 4 — AI Predictions">
                <Bullet><strong>Media Spend Simulator</strong> — Drag the investment multiplier to see projected MPen and MMS changes. Based on a log-linear response model calibrated on category averages. Connect actual media spend data in Settings for higher precision.</Bullet>
                <Bullet><strong>Category Twins</strong> — AI-matched brands from analogous categories (same MPen range, same MMS–SMS relationship) that have navigated a similar inflection point. Learn from their growth trajectories.</Bullet>
                <Bullet><strong>Trend Alerts</strong> — AI-generated flags based on wave-over-wave movement patterns. High severity = action required this quarter. Low severity = monitor.</Bullet>
              </ManualCard>
              <ManualCard title="Tab 5 — Growth Potential">
                <Bullet>The segment MPen cards show mental penetration separately for current buyers, light buyers, and non-buyers — revealing who already knows BCA but hasn&apos;t converted.</Bullet>
                <Bullet>The <strong>Growth Waterfall</strong> models the total MPen gain achievable by converting different segments — quantifying the maximum upside and sequencing the growth moves.</Bullet>
                <Bullet><strong>Recruitment Priority</strong> (non-buyers with existing MPen) is typically the highest-ROI growth action. <strong>Network Size</strong> (light buyer frequency increase) is secondary.</Bullet>
              </ManualCard>
            </div>
          )}

          {/* ══ CEP BUILDER ════════════════════════════════════════════════════ */}
          {activeSection === 'ceps' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">The CEP Builder is where you design the attribute list for your brand tracking survey. Every attribute must be CBM-compliant before a wave can be launched.</p>
              <ManualCard title="What is a CEP?">
                <p className="text-xs text-gray-500 leading-relaxed">A Category Entry Point (CEP) is a situational trigger that activates category buying — a moment, need, or context in which a person enters the category. CEPs belong to the category, not to any brand. Example: &quot;When I need to pay contactlessly&quot; is a CEP for credit cards. &quot;When I want BCA&apos;s rewards&quot; is NOT a CEP — it&apos;s brand-specific.</p>
              </ManualCard>
              <ManualCard title="The 7W Framework">
                <p className="text-xs text-gray-500 leading-relaxed mb-2">CEPs are derived by exploring buying occasions through seven lenses:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { w: 'Who', e: 'Who is the buyer? (self, family, business)' },
                    { w: 'What', e: 'What is the purchase occasion?' },
                    { w: 'When', e: 'When does the need arise?' },
                    { w: 'Where', e: 'Where does purchase happen?' },
                    { w: 'Why', e: 'What triggers the need?' },
                    { w: 'With What', e: 'What device, channel, or tool is used?' },
                    { w: 'With Whom', e: 'Who else is involved in the purchase?' },
                  ].map((w) => (
                    <div key={w.w} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <p className="text-neon-green font-bold text-xs">{w.w}</p>
                      <p className="text-gray-500 text-[11px]">{w.e}</p>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="Composition Meter">
                <Bullet>The circular meter shows the current split of your attribute list: CEPs / Baseline Competencies / Secondary Attributes.</Bullet>
                <Bullet>Target: <strong>60–70% CEPs</strong>. ≤30% baseline competencies (functional attributes like &quot;reliable&quot;, &quot;easy to use&quot;). ≤20% secondary/equity attributes.</Bullet>
                <Bullet>The CBM Engine flags violations with a red border and an explanation. Resolve all violations before launching the survey.</Bullet>
              </ManualCard>
              <ManualCard title="CBM Violation Types">
                <Bullet><strong>Modified wording</strong> — &quot;most trusted&quot;, &quot;best cashback&quot;, &quot;more rewards&quot; — superlatives bias toward market leaders. Rephrase to plain-form: &quot;trusted&quot;, &quot;offers cashback&quot;, &quot;has rewards programmes&quot;.</Bullet>
                <Bullet><strong>Brand-specific CEP</strong> — CEP only applies to one brand (e.g. &quot;uses BCA&apos;s tap-to-pay&quot;). Remove or generalize.</Bullet>
                <Bullet><strong>Duplicate CEP</strong> — Two attributes describe the same occasion. Merge or differentiate.</Bullet>
              </ManualCard>
            </div>
          )}

          {/* ══ SURVEYS ════════════════════════════════════════════════════════ */}
          {activeSection === 'surveys' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">The Surveys module lets you design, manage, and process brand health waves. It includes a block-based survey builder, a 17-block library, and a results upload pipeline.</p>
              <ManualCard title="Survey Canvas — How to Use">
                <Step n={1}>Browse the <strong>Block Library</strong> on the left. Blocks are categorized: Core (mandatory), Standard (recommended), and Optional.</Step>
                <Step n={2}>Drag blocks onto the <strong>Survey Canvas</strong> in the correct order. Core blocks (teal border) cannot be removed — they ensure CBM compliance.</Step>
                <Step n={3}>The <strong>CEP Attribute Block</strong> auto-populates from your CEP Builder list. Complete your CEP Builder before designing the survey.</Step>
                <Step n={4}>Review the CBM compliance panel on the right. Resolve any red flags before exporting.</Step>
                <Step n={5}>Use <strong>Export Survey</strong> to download the questionnaire in Word/PDF for your fieldwork partner.</Step>
              </ManualCard>
              <ManualCard title="Core Blocks (Mandatory)">
                <Bullet><strong>Category Screener</strong> — Filters for category buyers within the lookback window (e.g. &quot;bought any credit card in past 12 months&quot;).</Bullet>
                <Bullet><strong>Brand Awareness</strong> — Spontaneous (open-ended) followed by prompted (brand list). Alphabetical order enforced automatically.</Bullet>
                <Bullet><strong>Category Entry Point Linkage</strong> — Binary pick-any matrix: for each CEP, which brands come to mind? One question per CEP.</Bullet>
                <Bullet><strong>Purchase Behaviour</strong> — Which brand used most recently, and frequency in lookback period.</Bullet>
              </ManualCard>
              <ManualCard title="Uploading Results">
                <Step n={1}>Go to the <strong>Upload Results</strong> tab in the Surveys page.</Step>
                <Step n={2}>Download the data template from the modal to ensure column headers match the expected format.</Step>
                <Step n={3}>Drag and drop or browse for the completed Excel file. The platform previews the first 5 rows for validation.</Step>
                <Step n={4}>Click <strong>Process Wave</strong> to import. The AI Analysis panel will auto-generate a summary of key changes from the previous wave.</Step>
              </ManualCard>
              <ManualCard title="WhatsApp Distribution">
                <Bullet>The platform supports direct WhatsApp survey distribution via the Settings → Integrations panel. A unique survey link is sent via WhatsApp Business API to the respondent sample list.</Bullet>
                <Bullet>Responses stream in real-time to the Upload Results dashboard. Fieldwork progress is tracked by completion rate and quota fulfilment.</Bullet>
              </ManualCard>
            </div>
          )}

          {/* ══ REPORTS ════════════════════════════════════════════════════════ */}
          {activeSection === 'reports' && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">The Reports page packages all dashboard data into client-ready outputs. Four output types are available — each with a different audience and purpose.</p>
              <ManualCard title="Output Types">
                <div className="space-y-3">
                  {[
                    { type: 'Executive Summary PDF', icon: '📄', desc: 'One-page CEO-ready summary. Auto-populated from the latest wave. Includes the key insight headline, top 3 KPI movements, and a single recommendation. Best for senior stakeholder briefings.' },
                    { type: 'Full Report PPTX', icon: '📊', desc: 'Multi-slide deck covering all analytics pages. Includes competitive charts, Mental Advantage map, Physical Availability audit, and Forecast. Best for agency/client working sessions.' },
                    { type: 'CBM Compliance Report', icon: '✅', desc: 'Audits the current wave\'s methodology against CBM rules: survey design, sample composition, attribute composition, and data quality flags. Best for methodology sign-off and internal QA.' },
                    { type: 'Raw Data Export (XLSX)', icon: '📋', desc: 'Full respondent-level or aggregate data in Excel pivot-ready format. Includes wave-on-wave comparison columns. Best for advanced custom analysis.' },
                  ].map((r) => (
                    <div key={r.type} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <span className="text-2xl shrink-0">{r.icon}</span>
                      <div>
                        <p className="text-gray-800 font-semibold text-xs mb-0.5">{r.type}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ManualCard>
              <ManualCard title="How to Generate a Report">
                <Step n={1}>Select the wave period from the dropdown (defaults to most recent).</Step>
                <Step n={2}>Choose the output type. For PDF and PPTX, optionally select which sections to include.</Step>
                <Step n={3}>Click <strong>Generate</strong>. Processing takes 10–30 seconds depending on data volume.</Step>
                <Step n={4}>Download appears automatically. Reports are also saved to your Reports history for re-download.</Step>
              </ManualCard>
              <Callout label="Note" color="amber">Reports are generated from the most recent uploaded wave data. Ensure all data entry is complete and CBM Compliance Report flags are resolved before generating client-facing outputs.</Callout>
            </div>
          )}

          {/* ══ BASICS ═════════════════════════════════════════════════════════ */}
          {activeSection === 'basics' && (
            <div className="space-y-4">
              {[
                { title: 'What is Brand Tracking?', body: 'Brand tracking is continuous measurement of how consumers perceive your brand over time. Unlike one-off studies, tracking programmes run at regular intervals (waves) so you can detect changes in mental availability, attitudes, and market share.' },
                { title: 'What is CBM (Category Buyer Memory)?', body: 'CBM is a methodology built on Ehrenberg-Bass research. It focuses on measuring a brand\'s presence in buyers\' minds at category buying moments — Category Entry Points (CEPs). Unlike traditional attribute tracking, CBM measures who thinks of your brand in a buying context, not how much they like it.' },
                { title: 'Why Focus on Non-Buyers?', body: 'Heavy buyers already prefer your brand — they require retention programmes. Non-buyers and light buyers represent potential new revenue. Mental availability strategy is about building associations in this group so they choose your brand the next time they enter the category. This is where market share growth comes from.' },
                { title: 'What Makes a Good CEP?', body: 'A good CEP is a real buying occasion with enough category incidence (ideally >40%) to be meaningfully measurable. It should be worded without superlatives or brand-specific language. Good: "When paying for online shopping." Bad: "When I want the most trusted card."' },
                { title: 'What is Mental Availability?', body: 'Mental availability is the probability that a buyer thinks of your brand when entering the category. A brand with high mental availability comes to mind across many buying occasions for many buyers. It is distinct from brand awareness — awareness is passive; mental availability is active at the purchase moment.' },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-gray-900 font-semibold text-sm mb-2">{card.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* ══ METHODOLOGY ════════════════════════════════════════════════════ */}
          {activeSection === 'methodology' && (
            <div className="space-y-4">
              {[
                { title: 'Survey Design Rules', items: ['Only binary pick-any format — no Likert, no numeric scales', 'Brands always ordered alphabetically to eliminate position bias', 'No modified attribute wording: avoid "most", "best", "more"', 'Bounded recall: 12-month screener → 3-month target category purchase', 'Non-buyer quota: minimum 30% of sample must be non/light buyers'] },
                { title: 'Attribute Composition Targets', items: ['60–70% of attributes must be Category Entry Points (CEPs)', '≤30% can be baseline competencies (functional attributes)', '≤20% can be secondary or equity attributes', 'CBM Engine flags compositions outside these bands before survey launch'] },
                { title: 'Double Jeopardy Normalization', items: ['All brand scores are compared against an expected score derived from each brand\'s penetration level', 'Smaller brands naturally score lower — DJ removes this size effect', 'Deviation from expected = the true mental advantage or disadvantage', 'DEFEND: ≥+5pp above expected. BUILD: ≤−5pp below expected. MAINTAIN: within ±4pp'] },
                { title: 'Analysis Defaults', items: ['Default analysis segment: non-buyers + light buyers', 'Wave-on-wave comparison uses matched sample quotas', 'All competitive charts show DJ-normalized scores unless explicitly stated', 'MMS vs SMS gap is automatically flagged on every dashboard load'] },
                { title: 'WOM Measurement Rules', items: ['Binary questions only: "Did you recommend in past month?" (yes/no)', 'Both PWOM and NWOM required — measuring only PWOM misses the advocacy balance', 'Measured on category buyer base, not brand buyer base', 'WOM Given AND WOM Received should both be captured per wave'] },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-gray-900 font-semibold text-sm mb-3">{card.title}</p>
                  <ul className="space-y-2">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-gray-500">
                        <span className="text-neon-green font-bold shrink-0 mt-px">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* ══ KPI REFERENCE ══════════════════════════════════════════════════ */}
          {activeSection === 'kpi' && (
            <div className="space-y-3">
              {KPI_REFERENCE.map((kpi) => (
                <div key={kpi.kpi} className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-gray-900 font-semibold text-sm mb-2">{kpi.kpi}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{kpi.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Formula</p>
                      <p className="text-xs text-gray-600 font-mono">{kpi.formula}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Range</p>
                      <p className="text-xs text-gray-600">{kpi.range}</p>
                    </div>
                    <div className="bg-neon-green/5 rounded-lg p-3 border border-neon-green/10">
                      <p className="text-[10px] text-neon-green uppercase tracking-widest font-semibold mb-1">Target / Benchmark</p>
                      <p className="text-xs text-gray-600">{kpi.target}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ FAQ ════════════════════════════════════════════════════════════ */}
          {activeSection === 'faq' && (
            <div className="space-y-2">
              {FAQ.map((item) => (
                <Accordion key={item.q} q={item.q} a={item.a} />
              ))}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 flex gap-3 items-start">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700 font-semibold text-xs mb-1">Still have questions?</p>
                  <p className="text-gray-500 text-xs leading-relaxed">Reach out to Prima Hanura Akbar for methodology guidance. For platform bugs or feature requests, file an issue at the project repository.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
