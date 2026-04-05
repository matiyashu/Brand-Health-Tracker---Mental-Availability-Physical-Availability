'use client'

import { KpiCard } from '@/components/kpi-card'
import { SegmentToggle } from '@/components/segment-toggle'
import { BrandHealthChart } from '@/components/brand-health-chart'
import { WaveChart } from '@/components/wave-chart'
import { GapDiagnosisCard } from '@/components/gap-diagnosis-card'
import { CbmGuardrailBanner } from '@/components/cbm-guardrail-banner'
import { AlertCircle, RefreshCw, Plus } from 'lucide-react'
import { useState } from 'react'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import { useSegment } from '@/contexts/segment-context'

// ── Segment-aware data ──
const segmentConfig = {
  'non-light': {
    label: 'Non-buyers + Light Buyers',
    primaryKpi: 'Mental Penetration (MPen)',
    secondaryKpi: 'Prompted Awareness',
    strategicGoal: 'Recruitment / Growth',
    kpis: [
      { label: 'Mental Penetration', value: '62', unit: '%', delta: 4, deltaLabel: 'Q3 2024', description: '% non-buyers linking ≥1 CEP to BCA. Primary growth signal.', highlight: true },
      { label: 'Mental Market Share', value: '24', unit: '%', delta: -1, deltaLabel: 'Q3 2024', description: 'Share of all CEP linkages — DJ-normalized.' },
      { label: 'Network Score', value: '4.2', unit: '', delta: 0, deltaLabel: 'Q3 2024', description: 'Avg CEPs linked to BCA among non-buyers with MPen.' },
      { label: 'Prompted Awareness', value: '81', unit: '%', delta: 2, deltaLabel: 'Q3 2024', description: '% non-buyers recognising BCA when shown brand list.' },
    ],
    headline: 'BCA MPen among non-buyers grew +4pp, signalling effective awareness building. However, MMS dipped -1pp — competitors are gaining a proportionally higher share of category links. Mandiri grew +5pp among non-buyers.',
    recommendation: 'Prioritise CEP reinforcement in the Why and When dimensions. Non-buyers need more situational prompts, not attribute claims. Launch Q1 2025 campaign anchored on high-incidence CEPs (Emergency Cash, Trusted Daily).',
    analysis: [
      { label: 'Growth Signal', value: '+4pp MPen', color: 'text-neon-green', note: 'Marketing is successfully building memory structures in non-buyers.' },
      { label: 'Watch Signal', value: '−1pp MMS', color: 'text-red-500', note: 'Competitors gaining share of mental associations among the same non-buyer pool.' },
      { label: 'Awareness Gap', value: '81% → 62%', color: 'text-amber-500', note: 'Awareness is high but only 77% of aware non-buyers link BCA to a CEP — conversion gap in mental availability.' },
    ],
    waveLabel: 'Non-buyers + Light · MPen trend',
    gap: { mms: 24, sms: 21, diagnosis: 'mental' as const },
  },
  'heavy': {
    label: 'Heavy Buyers',
    primaryKpi: 'Share of Mind (SoM)',
    secondaryKpi: 'Network Score (NS)',
    strategicGoal: 'Retention / Maintenance',
    kpis: [
      { label: 'Mental Penetration', value: '94', unit: '%', delta: 1, deltaLabel: 'Q3 2024', description: 'Almost all heavy buyers link BCA to at least one CEP.' , highlight: false },
      { label: 'Share of Mind', value: '34', unit: '%', delta: -1, deltaLabel: 'Q3 2024', description: 'BCA share of CEP links among its own heavy buyers. Primary diagnostic.', highlight: true },
      { label: 'Network Score', value: '6.8', unit: '', delta: 0.3, deltaLabel: 'Q3 2024', description: 'Avg CEPs heavy buyers associate with BCA. Measures brand breadth.' },
      { label: 'Mental Market Share', value: '31', unit: '%', delta: 2, deltaLabel: 'Q3 2024', description: 'Heavy buyer mental footprint vs competitive set.' },
    ],
    headline: 'Heavy buyers show strong NS (6.8 CEPs on average) confirming deep mental representation. But SoM declined -1pp — Mandiri is encroaching on heavy buyer associations. If SoM continues to decline, loyalty risk rises.',
    recommendation: 'Maintain CEP distinctiveness among heavy buyers. Increase frequency of branded communication in high-NS CEPs (Trusted Daily, Mobile Banking, Emergency Cash). Loyalty/reward mechanisms to reinforce switching costs.',
    analysis: [
      { label: 'Retention Strength', value: 'NS 6.8', color: 'text-neon-green', note: 'High network score means BCA is mentally "multi-purpose" — harder to displace.' },
      { label: 'Risk Signal', value: '−1pp SoM', color: 'text-amber-500', note: 'Competitors eroding share of mind among your own heavy buyers. Defend now.' },
      { label: 'Bounded Recall Alert', value: 'Check 12mo→3mo', color: 'text-blue-500', note: 'Ensure heavy buyer classification uses bounded recall to avoid telescoping bias.' },
    ],
    waveLabel: 'Heavy Buyers · SoM & NS trend',
    gap: { mms: 31, sms: 21, diagnosis: 'physical' as const },
  },
  'overall': {
    label: 'Overall (All Category Buyers)',
    primaryKpi: 'Mental Market Share (MMS)',
    secondaryKpi: 'Mental Advantage Analysis',
    strategicGoal: 'Competitive Benchmarking',
    kpis: [
      { label: 'Mental Penetration', value: '71', unit: '%', delta: 3, deltaLabel: 'Q3 2024', description: 'Combined MPen across all buyer segments. DJ-normalized.', highlight: false },
      { label: 'Mental Market Share', value: '27', unit: '%', delta: 1, deltaLabel: 'Q3 2024', description: 'Total CEP linkages ÷ Grand total across all brands. Correlates r=0.83 with SMS.', highlight: true },
      { label: 'Network Score', value: '5.1', unit: '', delta: 0.2, deltaLabel: 'Q3 2024', description: 'Overall avg CEPs per buyer. Expected for BCA\'s penetration level: 4.9.' },
      { label: 'Share of Mind', value: '27', unit: '%', delta: 1, deltaLabel: 'Q3 2024', description: 'Category-wide CEP share among all MPen holders.' },
    ],
    headline: 'Overall MMS of 27% exceeds SMS (21%) by 6pp — a structural physical availability gap. BCA\'s mental footprint is disproportionately large relative to actual purchase conversion. Mandiri is the closest challenger at 28% MMS.',
    recommendation: 'Physical availability investment will yield higher ROI than further brand-building spend. Run outlet audit across agent banking and emerging digital channels. The mental foundation is strong — close the distribution gap.',
    analysis: [
      { label: 'MMS vs SMS Gap', value: '+6pp', color: 'text-red-500', note: 'MMS > SMS = physical availability is the binding constraint. Fix distribution before increasing ad spend.' },
      { label: 'Expected NS', value: '5.1 vs 4.9', color: 'text-neon-green', note: 'BCA outperforms DJ-expected network score by +0.2pp — genuine mental advantage, not just size effect.' },
      { label: 'MMS Correlation', value: 'r=0.83 with SMS', color: 'text-blue-500', note: "MMS is the leading indicator of sales market share — protect it against Mandiri's encroachment." },
    ],
    waveLabel: 'Overall · MMS trend (all buyers)',
    gap: { mms: 27, sms: 21, diagnosis: 'physical' as const },
  },
}

const DATA_FIELDS: DataField[] = [
  { key: 'mpen',    label: 'Mental Penetration (MPen) %', type: 'percent', required: true, hint: 'e.g. 62' },
  { key: 'mms',     label: 'Mental Market Share (MMS) %', type: 'percent', required: true, hint: 'e.g. 24' },
  { key: 'ns',      label: 'Network Score (NS)',           type: 'number',  required: true, hint: 'e.g. 4.2' },
  { key: 'som',     label: 'Share of Mind (SoM) %',       type: 'percent', required: true, hint: 'e.g. 22' },
  { key: 'sms',     label: 'Sales Market Share (SMS) %',  type: 'percent', required: false, hint: 'From verified external source' },
  { key: 'period',  label: 'Wave Period',                  type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'] },
  { key: 'segment', label: 'Segment',                      type: 'select',  required: true, options: ['Non-buyers + Light', 'Heavy Buyers', 'Overall'] },
]

const DATA_REQS: DataRequirement[] = [
  { label: 'CBM survey completed',      desc: 'Full wave with all core blocks', ok: true },
  { label: 'Binary pick-any format',    desc: 'No Likert or rating scales', ok: true },
  { label: 'Alphabetical brand order',  desc: 'Position bias eliminated', ok: true },
  { label: 'Non-buyer quota ≥30%',      desc: 'Sufficient non-buyer sample', ok: true },
  { label: 'SMS verified externally',   desc: 'Nielsen / Euromonitor / internal BI', ok: false },
  { label: 'DJ normalization applied',  desc: 'Expected scores calculated per brand', ok: true },
]

export default function DashboardPage() {
  const { segment } = useSegment()
  const cfg = segmentConfig[segment]
  const [showDataModal, setShowDataModal] = useState(false)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Indonesian Credit Cards · Wave Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">Brand Health Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <SegmentToggle />
          <button
            onClick={() => setShowDataModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neon-green hover:bg-neon-green/5 hover:border-neon-green/30 transition-colors border border-neon-green/20 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />Add Data
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </button>
        </div>
      </div>

      {/* Segment context banner */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${segment === 'non-light' ? 'bg-neon-green' : segment === 'heavy' ? 'bg-amber-400' : 'bg-blue-400'}`} />
        <p className="text-gray-500 text-xs">
          <span className="font-semibold text-gray-700">Segment: {cfg.label}</span>
          <span className="mx-2 text-gray-300">·</span>
          Primary KPI: <span className="font-semibold text-gray-700">{cfg.primaryKpi}</span>
          <span className="mx-2 text-gray-300">·</span>
          Strategic goal: <span className="font-semibold text-gray-700">{cfg.strategicGoal}</span>
        </p>
      </div>

      {/* Key Insight — segment-aware */}
      <div className="rounded-xl bg-neon-green/5 border border-neon-green/20 px-5 py-4">
        <p className="text-[10px] font-bold tracking-widest text-neon-green/70 uppercase mb-1.5">Key Insight · {cfg.label}</p>
        <p className="text-gray-800 text-sm font-medium leading-relaxed">{cfg.headline}</p>
        <p className="text-gray-500 text-xs mt-2">
          <span className="font-semibold text-gray-600">Recommended action:</span> {cfg.recommendation}
        </p>
      </div>

      {/* KPI Cards — segment-aware */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cfg.kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            delta={kpi.delta}
            deltaLabel={kpi.deltaLabel}
            description={kpi.description}
            highlight={kpi.highlight}
          />
        ))}
      </div>

      {/* Segment Analysis Panel */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-700 font-semibold text-sm mb-3">
          Segment Analysis — {cfg.label}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cfg.analysis.map((a) => (
            <div key={a.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{a.label}</p>
                <span className={`text-sm font-bold ${a.color}`}>{a.value}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{a.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-neon-green/20 bg-neon-green/5 p-3">
          <p className="text-[10px] text-neon-green/70 font-bold uppercase tracking-widest mb-1">Data Requirement for This Segment</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
            <span>Primary KPI: <strong className="text-gray-700">{cfg.primaryKpi}</strong></span>
            <span>Secondary KPI: <strong className="text-gray-700">{cfg.secondaryKpi}</strong></span>
            <span>Format: <strong className="text-gray-700">Binary pick-any</strong></span>
            <span>Recruitment: <strong className="text-gray-700">{segment === 'non-light' ? 'Category buyers — non/light only' : segment === 'heavy' ? 'Brand-specific buyers — top CPF tier' : 'Category-wide sample'}</strong></span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-900 font-semibold text-sm">Competitive Radar</p>
              <p className="text-gray-400 text-xs mt-0.5">DJ-normalized · Q4 2024 · {cfg.label}</p>
            </div>
            <span className="text-[10px] text-neon-green bg-neon-green/10 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">DJ On</span>
          </div>
          <BrandHealthChart />
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-900 font-semibold text-sm">Wave Tracker</p>
              <p className="text-gray-400 text-xs mt-0.5">{cfg.waveLabel} · Last 4 waves</p>
            </div>
          </div>
          <WaveChart />
        </div>
      </div>

      {/* Gap Diagnosis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-gray-900 font-semibold text-sm">MMS vs SMS Gap Diagnosis</p>
          <AlertCircle className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-[10px] text-gray-400 ml-1">{cfg.label}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <GapDiagnosisCard brand="BCA" mms={cfg.gap.mms} sms={cfg.gap.sms} diagnosis={cfg.gap.diagnosis} />
          <GapDiagnosisCard brand="Mandiri" mms={28} sms={30} diagnosis="physical" />
          <GapDiagnosisCard brand="BNI" mms={17} sms={17} diagnosis="balanced" />
        </div>
      </div>

      <CbmGuardrailBanner compact className="border-t border-gray-100 pt-4" />

      {/* Data Entry Modal */}
      {showDataModal && (
        <DataEntryModal
          title="Add Wave Data"
          description="Enter KPI values for this wave. Segment is auto-tagged from your selection."
          fields={DATA_FIELDS}
          requirements={DATA_REQS}
          templateName="BCA_Dashboard_WaveData"
          templateHeaders={['Wave Period', 'Segment', 'Brand', 'MPen %', 'MMS %', 'NS', 'SoM %', 'SMS %']}
          onClose={() => setShowDataModal(false)}
        />
      )}
    </div>
  )
}
