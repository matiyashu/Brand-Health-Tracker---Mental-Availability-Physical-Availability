'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { KpiCard } from '@/components/kpi-card'
import { SegmentToggle } from '@/components/segment-toggle'
import { WaveChart } from '@/components/wave-chart'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import { useSegment } from '@/contexts/segment-context'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#0FA958', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171']

// Segment-aware brand data
const brandDataBySegment = {
  'non-light': [
    { name: 'BCA',     mpen: 62, mms: 24, ns: 4.2, som: 22 },
    { name: 'Mandiri', mpen: 71, mms: 28, ns: 4.8, som: 26 },
    { name: 'BNI',     mpen: 45, mms: 17, ns: 3.6, som: 15 },
    { name: 'CIMB',    mpen: 38, mms: 14, ns: 3.1, som: 11 },
    { name: 'Permata', mpen: 29, mms: 10, ns: 2.8, som: 8  },
  ],
  'heavy': [
    { name: 'BCA',     mpen: 94, mms: 31, ns: 6.8, som: 34 },
    { name: 'Mandiri', mpen: 97, mms: 34, ns: 7.2, som: 36 },
    { name: 'BNI',     mpen: 88, mms: 22, ns: 5.4, som: 21 },
    { name: 'CIMB',    mpen: 79, mms: 18, ns: 4.9, som: 15 },
    { name: 'Permata', mpen: 71, mms: 14, ns: 4.1, som: 10 },
  ],
  'overall': [
    { name: 'BCA',     mpen: 71, mms: 27, ns: 5.1, som: 27 },
    { name: 'Mandiri', mpen: 79, mms: 31, ns: 5.8, som: 30 },
    { name: 'BNI',     mpen: 58, mms: 19, ns: 4.3, som: 17 },
    { name: 'CIMB',    mpen: 51, mms: 15, ns: 3.8, som: 12 },
    { name: 'Permata', mpen: 43, mms: 11, ns: 3.2, som: 9  },
  ],
}

const kpisBySegment = {
  'non-light': [
    { label: 'Mental Penetration', value: '62', unit: '%', delta: 4,  deltaLabel: 'Q3 2024', description: '% non-buyers linking ≥1 CEP to BCA.', highlight: true },
    { label: 'Mental Market Share', value: '24', unit: '%', delta: -1, deltaLabel: 'Q3 2024', description: 'Share of all CEP linkages — DJ-normalized.' },
    { label: 'Network Score',       value: '4.2', unit: '', delta: 0,  deltaLabel: 'Q3 2024', description: 'Avg CEPs linked to BCA among non-buyers with MPen.' },
    { label: 'Prompted Awareness',  value: '81', unit: '%', delta: 2,  deltaLabel: 'Q3 2024', description: '% non-buyers recognising BCA when shown brand list.' },
  ],
  'heavy': [
    { label: 'Mental Penetration', value: '94', unit: '%', delta: 1,   deltaLabel: 'Q3 2024', description: 'Almost all heavy buyers link BCA to ≥1 CEP.', highlight: false },
    { label: 'Share of Mind',       value: '34', unit: '%', delta: -1,  deltaLabel: 'Q3 2024', description: 'BCA share of CEP links among heavy buyers.', highlight: true },
    { label: 'Network Score',       value: '6.8', unit: '', delta: 0.3, deltaLabel: 'Q3 2024', description: 'Avg CEPs per heavy buyer. Measures brand breadth.' },
    { label: 'Mental Market Share', value: '31', unit: '%', delta: 2,   deltaLabel: 'Q3 2024', description: 'Heavy buyer competitive footprint.' },
  ],
  'overall': [
    { label: 'Mental Penetration', value: '71', unit: '%', delta: 3,   deltaLabel: 'Q3 2024', description: 'Combined MPen across all segments.', highlight: false },
    { label: 'Mental Market Share', value: '27', unit: '%', delta: 1,   deltaLabel: 'Q3 2024', description: 'Total CEP linkages ÷ Grand total. Correlates r=0.83 with SMS.', highlight: true },
    { label: 'Network Score',       value: '5.1', unit: '', delta: 0.2, deltaLabel: 'Q3 2024', description: 'Overall avg CEPs per buyer. DJ-expected: 4.9.' },
    { label: 'Share of Mind',       value: '27', unit: '%', delta: 1,   deltaLabel: 'Q3 2024', description: 'Category-wide CEP share among MPen holders.' },
  ],
}

const analysisText = {
  'non-light': {
    headline: 'Non-buyer MPen +4pp — strongest improvement in 3 waves. MMS down 1pp signals competitors gaining category associations. Focus: CEP reinforcement in Why & When dimensions.',
    insight: 'Prompted Awareness (81%) is significantly ahead of MPen (62%). The 19pp gap indicates BCA is recognized but not mentally activated at buying moments — a CEP linkage deficit, not an awareness problem.',
  },
  'heavy': {
    headline: 'Heavy buyers show deep mental representation (NS 6.8). SoM declining signals Mandiri encroachment. Immediate priority: defend high-incidence CEPs among heavy buyer pool.',
    insight: 'Heavy buyer SoM at 34% — strong, but down 1pp. Use bounded recall protocol (12mo → 3mo) to ensure accurate classification. High NS means BCA is versatile in heavy buyer minds.',
  },
  'overall': {
    headline: 'Overall MMS 27% exceeds SMS 21% by 6pp — a structural physical availability gap. Mental foundation is strong. Distribution expansion will yield higher ROI than incremental brand spend.',
    insight: 'MMS correlates r=0.83 with SMS. BCA outperforms expected NS by 0.2pp, a genuine mental advantage adjusted for brand size via DJ normalization.',
  },
}

const DATA_FIELDS: DataField[] = [
  { key: 'brand',  label: 'Brand',              type: 'text',    required: true },
  { key: 'mpen',   label: 'MPen %',              type: 'percent', required: true },
  { key: 'mms',    label: 'MMS %',               type: 'percent', required: true },
  { key: 'ns',     label: 'Network Score',       type: 'number',  required: true, hint: 'e.g. 4.2' },
  { key: 'som',    label: 'SoM %',               type: 'percent', required: true },
  { key: 'period', label: 'Wave Period',          type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'] },
  { key: 'segment',label: 'Segment',             type: 'select',  required: true, options: ['Non-buyers + Light', 'Heavy Buyers', 'Overall'] },
]

const DATA_REQS: DataRequirement[] = [
  { label: 'CBM survey completed',     desc: 'Full wave with core blocks', ok: true },
  { label: 'All brands in scope',      desc: 'Complete competitive set measured', ok: true },
  { label: 'Binary pick-any format',   desc: 'No Likert scales', ok: true },
  { label: 'Alphabetical brand order', desc: 'Position bias eliminated', ok: true },
  { label: 'DJ normalization applied', desc: 'Expected scores calculated', ok: false },
]

export default function AnalyticsPage() {
  const { segment } = useSegment()
  const [showModal, setShowModal] = useState(false)

  const brands = brandDataBySegment[segment]
  const kpis = kpisBySegment[segment]
  const analysis = analysisText[segment]
  const segLabel = segment === 'non-light' ? 'Non-buyers + Light' : segment === 'heavy' ? 'Heavy Buyers' : 'Overall'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Indonesian Credit Cards · Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">Brand KPIs</h1>
        </div>
        <div className="flex items-center gap-2">
          <SegmentToggle />
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
            <Plus className="w-3.5 h-3.5" />Add Data
          </button>
        </div>
      </div>

      {/* Segment banner */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${segment === 'non-light' ? 'bg-neon-green' : segment === 'heavy' ? 'bg-amber-400' : 'bg-blue-400'}`} />
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{segLabel}</span>
          <span className="mx-2 text-gray-300">·</span>
          {segment === 'non-light' ? 'Primary KPI: Mental Penetration · Goal: Recruitment/Growth' : segment === 'heavy' ? 'Primary KPI: Share of Mind · Goal: Retention/Maintenance' : 'Primary KPI: Mental Market Share · Goal: Competitive Benchmarking'}
        </p>
      </div>

      {/* KPI Cards */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">BCA — {segLabel}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} unit={kpi.unit} delta={kpi.delta} deltaLabel={kpi.deltaLabel} description={kpi.description} highlight={kpi.highlight} />
          ))}
        </div>
      </div>

      {/* Analysis panel */}
      <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-3">
        <p className="text-gray-700 font-semibold text-sm">Analysis — {segLabel}</p>
        <p className="text-gray-600 text-sm leading-relaxed">{analysis.headline}</p>
        <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3">
          <p className="text-[10px] text-neon-green/70 font-bold uppercase tracking-widest mb-1">Key Insight</p>
          <p className="text-gray-600 text-xs leading-relaxed">{analysis.insight}</p>
        </div>
      </div>

      {/* Competitive MPen bar */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-900 font-semibold text-sm mb-1">Competitive {segment === 'heavy' ? 'SoM' : 'MPen'} — Q4 2024 · {segLabel}</p>
        <p className="text-gray-400 text-xs mb-4">{segment === 'heavy' ? 'Share of Mind (%)' : 'Mental Penetration (%)'} · {segLabel}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={brands} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}%`, segment === 'heavy' ? 'SoM' : 'MPen']} />
            <Bar dataKey={segment === 'heavy' ? 'som' : 'mpen'} radius={[4, 4, 0, 0]}>
              {brands.map((_, i) => <Cell key={i} fill={COLORS[i]} fillOpacity={i === 0 ? 1 : 0.55} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Wave tracker */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-900 font-semibold text-sm mb-1">Wave Tracker — {segLabel}</p>
        <p className="text-gray-400 text-xs mb-4">{segment === 'heavy' ? 'SoM (%) · Last 4 waves' : 'MPen (%) · Last 4 waves'}</p>
        <WaveChart />
      </div>

      {/* Full scorecard */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900 font-semibold text-sm">Full KPI Scorecard — Q4 2024 · {segLabel}</p>
          <p className="text-gray-400 text-xs mt-0.5">DJ-normalized</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Brand</th>
              <th className="px-4 py-3 text-gray-400 font-medium text-right">MPen %</th>
              <th className="px-4 py-3 text-gray-400 font-medium text-right">MMS %</th>
              <th className="px-4 py-3 text-gray-400 font-medium text-right">NS</th>
              <th className="px-4 py-3 text-gray-400 font-medium text-right">SoM %</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={b.name} className={`border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-neon-green/5' : ''}`}>
                <td className="px-5 py-3 font-semibold" style={{ color: COLORS[i] }}>{b.name}{i === 0 && <span className="ml-2 text-[10px] text-gray-400">(you)</span>}</td>
                <td className="px-4 py-3 text-right text-gray-600">{b.mpen}%</td>
                <td className="px-4 py-3 text-right text-gray-600">{b.mms}%</td>
                <td className="px-4 py-3 text-right text-gray-600">{b.ns}</td>
                <td className="px-4 py-3 text-right text-gray-600">{b.som}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DataEntryModal
          title="Add Brand KPI Data"
          description="Enter CBM survey KPI results per brand and wave. Use DJ-normalized values."
          fields={DATA_FIELDS}
          requirements={DATA_REQS}
          templateName="BCA_BrandKPI_Template"
          templateHeaders={['Wave', 'Segment', 'Brand', 'MPen %', 'MMS %', 'NS', 'SoM %']}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
