'use client'

import { useState } from 'react'
import { Plus, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import { useSegment } from '@/contexts/segment-context'
import { SegmentToggle } from '@/components/segment-toggle'

type PhysicalTab = 'overview' | 'presence' | 'portfolio' | 'prominence' | 'gap'

// ── Presence data ──
const presenceData = [
  { channel: 'Bank Branches',         catSalesPct: 42, totalOutlets: 1240,   bcaPresent: true,  bcaCoverage: 100, benchmark: 90 },
  { channel: 'ATM Network',           catSalesPct: 8,  totalOutlets: 3500,   bcaPresent: true,  bcaCoverage: 98,  benchmark: 80 },
  { channel: 'Online Application',    catSalesPct: 20, totalOutlets: 120,    bcaPresent: true,  bcaCoverage: 83,  benchmark: 75 },
  { channel: 'Partner Merchants',     catSalesPct: 22, totalOutlets: 180000, bcaPresent: true,  bcaCoverage: 91,  benchmark: 85 },
  { channel: 'Agent Banking',         catSalesPct: 5,  totalOutlets: 8200,   bcaPresent: false, bcaCoverage: 0,   benchmark: 40 },
  { channel: 'WhatsApp Application',  catSalesPct: 3,  totalOutlets: 45,     bcaPresent: false, bcaCoverage: 0,   benchmark: 30 },
]

const presenceNewOutlets = [
  { channel: 'Online Marketplaces',  emergingOutlets: 38, bcaPresent: 28, pct: 74 },
  { channel: 'BNPL Platforms',       emergingOutlets: 22, bcaPresent: 8,  pct: 36 },
  { channel: 'Super-Apps',           emergingOutlets: 12, bcaPresent: 6,  pct: 50 },
]

// ── Portfolio data ──
const portfolioData = [
  { product: 'BCA Everyday Card',   salesPct: 38, penetrationPct: 45, tier: 'Mass',            variants: 3 },
  { product: 'BCA Platinum',        salesPct: 28, penetrationPct: 22, tier: 'Premium',          variants: 2 },
  { product: 'BCA Gold',            salesPct: 19, penetrationPct: 24, tier: 'Mid',              variants: 2 },
  { product: 'BCA Business Card',   salesPct: 12, penetrationPct: 8,  tier: 'Business',         variants: 4 },
  { product: 'BCA Syariah',         salesPct: 3,  penetrationPct: 1,  tier: 'Mass-Syariah',     variants: 1 },
]

const portfolioGaps = [
  { gap: 'Youth / Student Card',       competitorFilling: 'Mandiri, BNI', opportunity: 'High', priority: 'critical' },
  { gap: 'Ride-hailing co-brand',      competitorFilling: 'CIMB, Permata', opportunity: 'Medium', priority: 'medium' },
  { gap: 'Travel Miles accumulation',  competitorFilling: 'Mandiri, CIMB', opportunity: 'High', priority: 'critical' },
]

// ── Prominence: Distinctive Assets ──
const assetsData = [
  { asset: 'BCA Blue Logo',          famePct: 88, uniquenessPct: 76, status: 'strong',  trend: 'up' },
  { asset: 'Halo BCA Jingle',        famePct: 71, uniquenessPct: 82, status: 'strong',  trend: 'stable' },
  { asset: 'Flazz Card Design',      famePct: 64, uniquenessPct: 59, status: 'medium',  trend: 'up' },
  { asset: 'Blue & White Palette',   famePct: 72, uniquenessPct: 31, status: 'weak',    trend: 'down' },
  { asset: 'BCA Mobile App Icon',    famePct: 58, uniquenessPct: 65, status: 'medium',  trend: 'up' },
  { asset: '"myBCA" Brand Mark',     famePct: 41, uniquenessPct: 71, status: 'emerging',trend: 'up' },
]

const rentedProminence = [
  { channel: 'Supermarket Endcaps', outlets: 84, totalPossible: 92, pct: 91 },
  { channel: 'Search Ads (Google)', outlets: 1,  totalPossible: 1,  pct: 100 },
  { channel: 'Tokopedia Top Slot',  outlets: 1,  totalPossible: 1,  pct: 100 },
  { channel: 'Shopee Top Slot',     outlets: 0,  totalPossible: 1,  pct: 0 },
  { channel: 'OOH Jakarta CBD',     outlets: 28, totalPossible: 44, pct: 64 },
]

// ── Segment-aware gap analysis ──
const gapData = {
  'non-light': { mms: 24, sms: 21, gap: 3,  diagnosis: 'physical', insight: 'BCA is thought of more than bought. Non-buyers think of BCA at buying moments but are converting less — physical availability barrier.', action: 'Expand digital application reach. Reduce friction at agent banking and BNPL channels where BCA has 0% presence.' },
  'heavy':     { mms: 31, sms: 21, gap: 10, diagnosis: 'physical', insight: 'Heavy buyers over-represent BCA mentally. But SMS significantly lags — suggests distribution or switching friction for lighter buyers.', action: 'Focus distribution expansion in under-served channels (Agent Banking, WhatsApp). Prioritise checkout integration.' },
  'overall':   { mms: 27, sms: 21, gap: 6,  diagnosis: 'physical', insight: 'A 6pp positive gap (MMS > SMS) signals systemic physical availability underperformance relative to mental strength.', action: 'Physical availability fix will yield higher ROI than further brand building. Prioritise distribution over advertising.' },
}

const assetColor = { strong: 'text-neon-green', medium: 'text-amber-500', weak: 'text-red-500', emerging: 'text-blue-500' }
const assetBg    = { strong: 'bg-neon-green/10 border-neon-green/20', medium: 'bg-amber-50 border-amber-200', weak: 'bg-red-50 border-red-200', emerging: 'bg-blue-50 border-blue-200' }
const priorityColor = { critical: 'text-red-500 bg-red-50 border-red-200', medium: 'text-amber-500 bg-amber-50 border-amber-200' }

// ── Data entry configs ──
const PRESENCE_FIELDS: DataField[] = [
  { key: 'channel',          label: 'Channel Name',               type: 'text',    required: true,  hint: 'e.g. Supermarkets' },
  { key: 'catSalesPct',      label: '% Category Sales in Channel', type: 'percent', required: true,  unit: '%', validation: 'Must sum to 100% across all channels' },
  { key: 'totalOutlets',     label: 'Total Outlets in Market',    type: 'number',  required: true,  unit: 'count' },
  { key: 'bcaPresent',       label: 'BCA Present',                type: 'select',  required: true,  options: ['Yes', 'No'] },
  { key: 'bcaCoverage',      label: 'BCA % Coverage',             type: 'percent', required: true,  unit: '%', hint: 'BCA outlets ÷ total outlets' },
  { key: 'benchmark',        label: 'Category Benchmark',         type: 'percent', required: false, unit: '%' },
]

const PRESENCE_REQS: DataRequirement[] = [
  { label: 'Channel universe defined', desc: 'All relevant sales channels listed', ok: true },
  { label: 'Outlet count from audit', desc: 'Not estimated — from audit or paid data', ok: false },
  { label: 'Binary presence confirmed', desc: 'Yes/No per channel from sales rep data', ok: true },
  { label: 'Coverage % calculated',    desc: 'BCA outlets ÷ total outlets in channel', ok: true },
  { label: 'Benchmark sourced',        desc: 'Category or top competitor benchmark', ok: false },
]

const PORTFOLIO_FIELDS: DataField[] = [
  { key: 'product',          label: 'Product / SKU Name',         type: 'text',    required: true },
  { key: 'salesPct',         label: '% Contribution to Sales',    type: 'percent', required: true, unit: '%' },
  { key: 'penetrationPct',   label: '% Contribution to Penetration', type: 'percent', required: true, unit: '%' },
  { key: 'tier',             label: 'Price Tier',                 type: 'select',  required: true, options: ['Mass', 'Mid', 'Premium', 'Business', 'Syariah', 'Youth'] },
  { key: 'variants',         label: 'No. of Variants',            type: 'number',  required: false },
]

const PORTFOLIO_REQS: DataRequirement[] = [
  { label: 'SKU-level sales data',  desc: 'Sales contribution per product', ok: true },
  { label: 'Buyer penetration data', desc: 'Buyers per SKU from survey', ok: false },
  { label: 'Price tier mapped',     desc: 'Each product assigned a tier', ok: true },
  { label: 'Competitor portfolio',  desc: 'Competitive SKU set for gap analysis', ok: false },
]

const PROMINENCE_FIELDS: DataField[] = [
  { key: 'asset',            label: 'Distinctive Asset Name',     type: 'text',    required: true },
  { key: 'famePct',          label: 'Fame %',                     type: 'percent', required: true, unit: '%', hint: '% category buyers recognising asset' },
  { key: 'uniquenessPct',    label: 'Uniqueness %',               type: 'percent', required: true, unit: '%', hint: '% linkages solely attributed to BCA' },
  { key: 'status',           label: 'Status',                     type: 'select',  required: true, options: ['strong', 'medium', 'weak', 'emerging'] },
]

const PROMINENCE_REQS: DataRequirement[] = [
  { label: 'Assets tested unprompted', desc: 'Buyers shown assets without brand name', ok: true },
  { label: 'Fame % from survey',      desc: 'Category-wide sample, not just buyers', ok: true },
  { label: 'Uniqueness calculated',   desc: 'Brand-specific linkage ÷ total linkages', ok: false },
  { label: 'Competitor assets tested', desc: 'Same assets tested across all brands', ok: false },
]

const GAP_FIELDS: DataField[] = [
  { key: 'mms',              label: 'Mental Market Share (MMS)', type: 'percent', required: true, unit: '%' },
  { key: 'sms',              label: 'Sales Market Share (SMS)',  type: 'percent', required: true, unit: '%', hint: 'From internal sales data or Nielsen/Euromonitor' },
  { key: 'period',           label: 'Period',                    type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'] },
]

const GAP_REQS: DataRequirement[] = [
  { label: 'MMS from CBM tracker',    desc: 'Calculated from mental availability survey', ok: true },
  { label: 'SMS from verified source', desc: 'Nielsen, GFK, Euromonitor, or internal BI', ok: false },
  { label: 'Same time period',        desc: 'Both MMS and SMS from the same wave period', ok: true },
  { label: 'Consistent brand definition', desc: 'Same brand scope in both metrics', ok: true },
]

export default function PhysicalPage() {
  const [activeTab, setActiveTab] = useState<PhysicalTab>('overview')
  const [openModal, setOpenModal] = useState<string | null>(null)
  const { segment } = useSegment()
  const gap = gapData[segment]

  const tabs: { key: PhysicalTab; label: string }[] = [
    { key: 'overview',   label: 'Overview' },
    { key: 'presence',   label: 'Presence' },
    { key: 'portfolio',  label: 'Portfolio' },
    { key: 'prominence', label: 'Prominence' },
    { key: 'gap',        label: 'Gap Analysis' },
  ]

  const overallCoverage = Math.round(
    presenceData.filter(d => d.bcaPresent).reduce((s, d) => s + d.catSalesPct, 0)
  )

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">BCA · Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">Physical Availability</h1>
          <p className="text-gray-500 text-xs mt-1">Presence · Portfolio · Prominence · Gap Analysis</p>
        </div>
        <SegmentToggle />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
              activeTab === t.key ? 'border-neon-green text-neon-green' : 'border-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Overall Market Coverage', value: `${overallCoverage}%`, sub: 'Weighted by channel sales', color: 'text-neon-green' },
              { label: 'Channels Present', value: `${presenceData.filter(d => d.bcaPresent).length}/${presenceData.length}`, sub: 'Out of universe', color: 'text-gray-900' },
              { label: 'Distinctive Assets', value: `${assetsData.filter(a => a.status === 'strong').length} Strong`, sub: `${assetsData.length} total tested`, color: 'text-neon-green' },
              { label: 'MMS vs SMS Gap', value: `+${gap.gap}pp`, sub: `${gap.diagnosis === 'physical' ? 'Physical availability problem' : 'Balanced'}`, color: 'text-red-500' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">{s.label}</p>
                <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                <p className="text-gray-300 text-[11px] mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Pillar summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: 'Pillar 1: Presence',
                icon: '📍',
                status: 'warning',
                items: [
                  `${presenceData.filter(d => d.bcaPresent).length}/${presenceData.length} channels covered`,
                  `Agent Banking gap — 0% of 8,200 outlets`,
                  'WhatsApp Application not deployed',
                ],
                action: () => setActiveTab('presence'),
              },
              {
                title: 'Pillar 2: Portfolio',
                icon: '📦',
                status: 'warning',
                items: [
                  `${portfolioData.length} SKUs active`,
                  `${portfolioGaps.filter(g => g.priority === 'critical').length} critical gaps identified`,
                  'Youth card not in range — 3 competitors filling',
                ],
                action: () => setActiveTab('portfolio'),
              },
              {
                title: 'Pillar 3: Prominence',
                icon: '🔆',
                status: 'good',
                items: [
                  `${assetsData.filter(a => a.status === 'strong').length} strong assets (BCA Logo, Jingle)`,
                  'Blue & White Palette weak on uniqueness (31%)',
                  'myBCA emerging — invest now',
                ],
                action: () => setActiveTab('prominence'),
              },
            ].map((p) => (
              <button
                key={p.title}
                onClick={p.action}
                className="rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-neon-green/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{p.icon}</span>
                  <p className="text-gray-900 font-semibold text-sm">{p.title}</p>
                  <span className={cn('ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
                    p.status === 'good' ? 'text-neon-green bg-neon-green/10' : 'text-amber-500 bg-amber-50'
                  )}>
                    {p.status === 'good' ? 'Good' : 'Action Needed'}
                  </span>
                </div>
                <ul className="space-y-1">
                  {p.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-500">
                      <span className="text-gray-300 shrink-0">→</span>{item}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Bias warning */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 text-xs font-semibold mb-1">Why Surveys Fail for Physical Availability</p>
              <p className="text-gray-600 text-xs leading-relaxed">
                69% of buyers <strong>cannot accurately name</strong> where a brand is stocked. Brand buyers are <strong>3× more likely</strong> to say a brand &ldquo;stands out on shelf&rdquo; simply because they recognise what they already buy. Physical availability must be measured via <strong>outlet audits</strong> — not consumer surveys.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PRESENCE TAB ── */}
      {activeTab === 'presence' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold text-sm">Channel Coverage Mapping</p>
              <p className="text-gray-400 text-xs mt-0.5">Binary audit-based presence across all category sales outlets</p>
            </div>
            <button
              onClick={() => setOpenModal('presence')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />Add / Update Channel
            </button>
          </div>

          {/* Channel table */}
          <div className="rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">Channel</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Cat. Sales</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Total Outlets</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-center">BCA Present</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">BCA Coverage</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">vs Benchmark</th>
                </tr>
              </thead>
              <tbody>
                {presenceData.map((d) => {
                  const vs = d.bcaCoverage - d.benchmark
                  return (
                    <tr key={d.channel} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-700 font-medium">{d.channel}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{d.catSalesPct}%</td>
                      <td className="px-4 py-3 text-right text-gray-500">{d.totalOutlets.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        {d.bcaPresent
                          ? <CheckCircle2 className="w-4 h-4 text-neon-green mx-auto" />
                          : <span className="text-red-400 font-bold text-sm">✗</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', d.bcaCoverage >= d.benchmark ? 'bg-neon-green' : 'bg-red-400')} style={{ width: `${d.bcaCoverage}%` }} />
                          </div>
                          <span className={cn('font-semibold', d.bcaCoverage >= d.benchmark ? 'text-neon-green' : 'text-red-500')}>{d.bcaCoverage}%</span>
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 text-right font-semibold', vs >= 0 ? 'text-neon-green' : 'text-red-500')}>
                        {vs > 0 ? '+' : ''}{vs}pp
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Overall coverage formula */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Coverage Formulas</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: '% Channel Coverage', formula: 'BCA outlets in channel ÷ Total outlets in channel', value: `${Math.round(presenceData.filter(d => d.bcaPresent).reduce((s, d) => s + d.bcaCoverage, 0) / presenceData.filter(d => d.bcaPresent).length)}% avg` },
                { label: '% Overall Market Coverage', formula: 'BCA weighted coverage across all channels', value: `${overallCoverage}%` },
                { label: '% Presence in New Outlets', formula: 'New outlets with BCA ÷ Emerging outlets (2yr)', value: '54%' },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">{f.label}</p>
                  <p className="text-neon-green font-bold text-sm mb-1">{f.value}</p>
                  <p className="text-xs text-gray-400 font-mono">{f.formula}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New outlets */}
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-700 font-semibold text-sm mb-3">% Presence in Emerging Outlets (last 2 years)</p>
            <div className="space-y-3">
              {presenceNewOutlets.map((d) => (
                <div key={d.channel} className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-44 shrink-0">{d.channel}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', d.pct >= 50 ? 'bg-neon-green' : 'bg-amber-400')} style={{ width: `${d.pct}%` }} />
                  </div>
                  <span className={cn('text-xs font-semibold w-12 text-right', d.pct >= 50 ? 'text-neon-green' : 'text-amber-500')}>{d.bcaPresent}/{d.emergingOutlets}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PORTFOLIO TAB ── */}
      {activeTab === 'portfolio' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold text-sm">Portfolio Analysis</p>
              <p className="text-gray-400 text-xs mt-0.5">SKU contribution to sales & penetration · Gap analysis by price tier</p>
            </div>
            <button
              onClick={() => setOpenModal('portfolio')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />Add SKU
            </button>
          </div>

          {/* SKU table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-gray-700 font-semibold text-sm">SKU Contribution Matrix</p>
              <span className="text-xs text-gray-400">Relative Portfolio Size: <span className="font-semibold text-gray-700">5 SKUs (Mandiri: 8 · BNI: 6)</span></span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">Product</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-center">Tier</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Sales %</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Penetration %</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.map((p) => {
                  const efficiency = (p.penetrationPct / p.salesPct * 100).toFixed(0)
                  return (
                    <tr key={p.product} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-700 font-medium">{p.product}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-semibold">{p.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-neon-green rounded-full" style={{ width: `${p.salesPct}%` }} />
                          </div>
                          <span className="text-gray-700 font-semibold">{p.salesPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${p.penetrationPct}%` }} />
                          </div>
                          <span className="text-gray-700 font-semibold">{p.penetrationPct}%</span>
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 text-right font-semibold text-xs', Number(efficiency) >= 100 ? 'text-neon-green' : Number(efficiency) >= 70 ? 'text-amber-500' : 'text-red-500')}>
                        {efficiency}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Formulas */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Portfolio Formulas</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Relative Portfolio Size', formula: 'SKU count vs competitors, adjusted for market share', value: `5 SKUs (↓3 vs Mandiri)` },
                { label: '% Contribution to Sales', formula: 'SKU sales ÷ Total brand sales', value: 'Top 2: 66% of sales' },
                { label: '% Contribution to Penetration', formula: 'SKU buyers ÷ Total brand penetration', value: 'Top 2: 67% of buyers' },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">{f.label}</p>
                  <p className="text-neon-green font-bold text-sm mb-1">{f.value}</p>
                  <p className="text-xs text-gray-400 font-mono">{f.formula}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio gaps */}
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-700 font-semibold text-sm mb-3">Duplication of Purchase Gap Analysis</p>
            <div className="space-y-3">
              {portfolioGaps.map((g) => (
                <div key={g.gap} className={cn('rounded-lg border p-3 flex items-center gap-3', priorityColor[g.priority as keyof typeof priorityColor])}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{g.gap}</p>
                    <p className="text-xs mt-0.5 opacity-70">Filled by: {g.competitorFilling}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wide">{g.opportunity} opp.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PROMINENCE TAB ── */}
      {activeTab === 'prominence' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold text-sm">Distinctive Asset Audit</p>
              <p className="text-gray-400 text-xs mt-0.5">Fame & Uniqueness · Owned + Rented prominence</p>
            </div>
            <button
              onClick={() => setOpenModal('prominence')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />Add Asset
            </button>
          </div>

          {/* Fame vs Uniqueness matrix */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-gray-700 font-semibold text-sm">Owned Prominence — Fame × Uniqueness Matrix</p>
              <p className="text-gray-400 text-xs mt-0.5">Strong = high Fame + high Uniqueness · Weak = low Uniqueness (shared with competitors)</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-gray-400 font-medium">Asset</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Fame %</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Uniqueness %</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-center">Trend</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {assetsData.map((a) => (
                  <tr key={a.asset} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-700 font-medium">{a.asset}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-neon-green rounded-full" style={{ width: `${a.famePct}%` }} />
                        </div>
                        <span className="text-gray-700 font-semibold w-8">{a.famePct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', a.uniquenessPct >= 60 ? 'bg-violet-400' : a.uniquenessPct >= 40 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${a.uniquenessPct}%` }} />
                        </div>
                        <span className="text-gray-700 font-semibold w-8">{a.uniquenessPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {a.trend === 'up' ? '↑' : a.trend === 'down' ? <span className="text-red-400">↓</span> : '→'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border', assetColor[a.status as keyof typeof assetColor], assetBg[a.status as keyof typeof assetBg])}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formulas */}
          <div className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">Distinctive Asset Formulas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Fame', formula: '% of category buyers who link the asset to BCA without prompting', value: 'BCA Logo: 88%' },
                { label: 'Uniqueness', formula: '% of asset linkages that are solely for BCA (not shared with competitors)', value: 'BCA Logo: 76%' },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">{f.label}</p>
                  <p className="text-neon-green font-bold text-sm mb-1">{f.value}</p>
                  <p className="text-xs text-gray-400">{f.formula}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rented prominence */}
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-700 font-semibold text-sm mb-3">Rented Prominence — Paid Presence</p>
            <div className="space-y-3">
              {rentedProminence.map((r) => (
                <div key={r.channel} className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs w-44 shrink-0">{r.channel}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', r.pct === 100 ? 'bg-neon-green' : r.pct >= 50 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${Math.max(r.pct, 3)}%` }} />
                  </div>
                  <span className={cn('text-xs font-semibold w-16 text-right', r.pct === 100 ? 'text-neon-green' : r.pct >= 50 ? 'text-amber-500' : 'text-red-500')}>
                    {r.outlets}/{r.totalPossible} ({r.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GAP ANALYSIS TAB ── */}
      {activeTab === 'gap' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold text-sm">MMS vs SMS Gap Diagnosis</p>
              <p className="text-gray-400 text-xs mt-0.5">If MMS &gt; SMS → Physical Availability problem. Segment: <span className="font-semibold text-gray-600">{segment === 'non-light' ? 'Non-buyers + Light' : segment === 'heavy' ? 'Heavy Buyers' : 'Overall'}</span></p>
            </div>
            <button
              onClick={() => setOpenModal('gap')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />Update Data
            </button>
          </div>

          {/* Gap score card */}
          <div className={cn('rounded-xl border p-6', gap.gap > 3 ? 'bg-red-50 border-red-200' : gap.gap > 0 ? 'bg-amber-50 border-amber-200' : 'bg-neon-green/5 border-neon-green/20')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">MMS</p>
                <p className="text-4xl font-bold text-neon-green">{gap.mms}%</p>
              </div>
              <div className="flex-1 flex items-center">
                <div className="flex-1 h-0.5 bg-gray-200" />
                <div className={cn('mx-3 text-center', gap.gap > 3 ? 'text-red-500' : 'text-amber-500')}>
                  <p className="text-2xl font-bold">+{gap.gap}pp</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Gap</p>
                </div>
                <div className="flex-1 h-0.5 bg-gray-200" />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-1">SMS</p>
                <p className="text-4xl font-bold text-gray-700">{gap.sms}%</p>
              </div>
            </div>
            <div className={cn('rounded-lg p-3 text-xs', gap.gap > 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
              <p className="font-semibold mb-1">Diagnosis: {gap.gap > 3 ? 'Physical Availability Problem' : 'Slight MMS lead — monitor'}</p>
              <p>{gap.insight}</p>
            </div>
          </div>

          {/* Action */}
          <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-5">
            <p className="text-neon-green text-xs font-bold uppercase tracking-widest mb-2">Recommended Action</p>
            <p className="text-gray-700 text-sm leading-relaxed">{gap.action}</p>
          </div>

          {/* Formula explanation */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-3">
            <p className="text-gray-700 font-semibold text-sm">Formula & Interpretation</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-mono text-gray-600 mb-2">Gap Score = MMS (%) − SMS (%)</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <p><span className="text-red-500 font-bold">Gap &gt; 0 (MMS &gt; SMS):</span> Physical Availability problem — consumers think of you but can&apos;t / don&apos;t buy you.</p>
                <p><span className="text-amber-500 font-bold">Gap = 0:</span> Balanced — mental and physical availability aligned.</p>
                <p><span className="text-blue-500 font-bold">Gap &lt; 0 (SMS &gt; MMS):</span> Loyalty without salience — buyers buy habitually but brand is not top-of-mind for non-buyers.</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">SMS must come from a <strong>verified external source</strong> (Nielsen Retail Measurement, Euromonitor, or internal BI) — not estimated from survey data.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── DATA ENTRY MODALS ── */}
      {openModal === 'presence' && (
        <DataEntryModal
          title="Add / Update Channel Data"
          description="Enter channel presence data from outlet audits or paid data sources."
          fields={PRESENCE_FIELDS}
          requirements={PRESENCE_REQS}
          templateName="BCA_Presence_Template"
          templateHeaders={['Channel', '% Category Sales', 'Total Outlets in Market', 'BCA Present (Yes/No)', 'BCA % Coverage', 'Category Benchmark %']}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'portfolio' && (
        <DataEntryModal
          title="Add / Update SKU Data"
          description="Enter product-level sales and penetration contribution data."
          fields={PORTFOLIO_FIELDS}
          requirements={PORTFOLIO_REQS}
          templateName="BCA_Portfolio_Template"
          templateHeaders={['Product Name', '% Contribution to Sales', '% Contribution to Penetration', 'Price Tier', 'No. of Variants']}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'prominence' && (
        <DataEntryModal
          title="Add / Update Distinctive Asset"
          description="Enter Fame and Uniqueness scores from your brand asset audit."
          fields={PROMINENCE_FIELDS}
          requirements={PROMINENCE_REQS}
          templateName="BCA_Prominence_Template"
          templateHeaders={['Asset Name', 'Fame %', 'Uniqueness %', 'Status']}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'gap' && (
        <DataEntryModal
          title="Update MMS vs SMS Gap Data"
          description="Enter verified MMS (from CBM tracker) and SMS (from external source)."
          fields={GAP_FIELDS}
          requirements={GAP_REQS}
          templateName="BCA_GapAnalysis_Template"
          templateHeaders={['Brand', 'MMS %', 'SMS %', 'Period', 'SMS Source']}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  )
}
