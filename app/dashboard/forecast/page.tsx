'use client'

import { useState } from 'react'
import { Plus, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line, ReferenceLine, Legend, BarChart, Bar,
} from 'recharts'

// ─── DJ Forecast data ───────────────────────────────────────────────────────
const djBrands = [
  { brand: 'BCA',     pen: 62, freq: 5.1, size: 10 },
  { brand: 'Mandiri', pen: 71, freq: 5.8, size: 10 },
  { brand: 'BNI',     pen: 44, freq: 4.3, size: 8  },
  { brand: 'CIMB',    pen: 31, freq: 3.8, size: 7  },
  { brand: 'Permata', pen: 22, freq: 3.2, size: 6  },
]
// DJ curve: freq = a + b * ln(pen) — fitted
const djCurve = Array.from({ length: 60 }, (_, i) => {
  const pen = 20 + i
  return { pen, freq: +(1.2 + 1.18 * Math.log(pen)).toFixed(2) }
})

// ─── MMS → Sales data ────────────────────────────────────────────────────────
const mmsSalesHistory = [
  { wave: "Q1 '23", mms: 19, sms: 18 },
  { wave: "Q2 '23", mms: 21, sms: 19 },
  { wave: "Q3 '23", mms: 22, sms: 20 },
  { wave: "Q4 '23", mms: 20, sms: 19 },
  { wave: "Q1 '24", mms: 23, sms: 21 },
  { wave: "Q2 '24", mms: 24, sms: 21 },
  { wave: "Q3 '24", mms: 24, sms: 21 },
  { wave: "Q4 '24", mms: 27, sms: 21, projected: true },
  { wave: "Q1 '25", mms: 29, sms: null, projected: true },
  { wave: "Q2 '25", mms: 31, sms: null, projected: true },
]

// ─── Growth potential data ────────────────────────────────────────────────────
const growthSegments = [
  { segment: 'Current buyers', mpen: 94, size: 38, color: '#0FA958' },
  { segment: 'Light buyers',   mpen: 71, size: 24, color: '#6ee7b7' },
  { segment: 'Non-buyers',     mpen: 41, size: 38, color: '#e5e7eb' },
]
const growthWaterfall = [
  { label: 'Current MPen (all)',   value: 62, type: 'base' },
  { label: 'Close light buyer gap', value: 9,  type: 'gain' },
  { label: 'Win non-buyer half',    value: 15, type: 'gain' },
  { label: 'Target MPen',           value: 86, type: 'target' },
]

// ─── CEP Expected Scores ──────────────────────────────────────────────────────
const BRANDS = ['BCA', 'Mandiri', 'BNI', 'CIMB']
const CEPS = [
  'Trusted daily use', 'Emergency cash', 'Travel reward',
  'Online shopping', 'Contactless pay', 'Family expenses',
]
const actual: Record<string, number[]> = {
  BCA:     [70, 65, 40, 68, 72, 58],
  Mandiri: [68, 60, 55, 62, 60, 74],
  BNI:     [50, 54, 38, 55, 48, 58],
  CIMB:    [38, 42, 62, 45, 40, 35],
}
// Expected = (row total × col total) / grand total
function computeExpected() {
  const grandTotal = BRANDS.reduce((g, b) => g + actual[b].reduce((s, v) => s + v, 0), 0)
  const colTotals = CEPS.map((_, ci) => BRANDS.reduce((s, b) => s + actual[b][ci], 0))
  const result: Record<string, { act: number; exp: number; dev: number }[]> = {}
  BRANDS.forEach((b) => {
    const rowTotal = actual[b].reduce((s, v) => s + v, 0)
    result[b] = actual[b].map((act, ci) => {
      const exp = (rowTotal * colTotals[ci]) / grandTotal
      return { act, exp: +exp.toFixed(1), dev: +(act - exp).toFixed(1) }
    })
  })
  return result
}
const expected = computeExpected()

// ─── Fields & Reqs ────────────────────────────────────────────────────────────
const DJ_FIELDS: DataField[] = [
  { key: 'brand',       label: 'Brand',             type: 'text',    required: true },
  { key: 'penetration', label: 'Penetration %',      type: 'percent', required: true, hint: 'Category buyers who bought in period' },
  { key: 'frequency',   label: 'Purchase Frequency', type: 'number',  required: true, unit: 'times/yr', hint: 'Average among buyers' },
  { key: 'period',      label: 'Wave Period',         type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024'] },
]
const DJ_REQS: DataRequirement[] = [
  { label: 'Penetration from category buyer base', desc: 'Not from brand buyer base', ok: true },
  { label: 'Frequency measured as purchase count',  desc: 'Not spend-based frequency',   ok: true },
  { label: 'All competitors in same base',          desc: 'Consistent respondent pool',  ok: true },
  { label: 'DJ curve fitted to category data',      desc: 'Not assumed from prior waves', ok: false },
]
const MMS_FIELDS: DataField[] = [
  { key: 'wave',  label: 'Wave Period', type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024'] },
  { key: 'mms',   label: 'MMS %',      type: 'percent', required: true, hint: 'Mental Market Share (% first-choice mentions)' },
  { key: 'sms',   label: 'SMS %',      type: 'percent', required: false, hint: 'Sales Market Share (optional if available)' },
]
const MMS_REQS: DataRequirement[] = [
  { label: 'MMS measured as first-choice mention',  desc: 'Spontaneous top-of-mind — not prompted', ok: true },
  { label: 'SMS from same time period',             desc: 'Matched quarter or period',              ok: true },
  { label: 'r correlation updated each wave',       desc: 'Recalculate when ≥4 data points exist',  ok: false },
  { label: 'Same buyer base for MMS calculation',   desc: 'Non-buyers + light + heavy (overall)',   ok: true },
]

const TABS = [
  { id: 'dj',     label: 'DJ Forecast' },
  { id: 'cep',    label: 'CEP Expected Scores' },
  { id: 'mms',    label: 'MMS → Sales' },
  { id: 'ai',     label: 'AI Predictions' },
  { id: 'growth', label: 'Growth Potential' },
]

function devColor(dev: number) {
  if (dev >= 5) return 'text-neon-green'
  if (dev <= -5) return 'text-red-500'
  return 'text-gray-500'
}
export default function ForecastPage() {
  const [tab, setTab] = useState<string>('dj')
  const [showModal, setShowModal] = useState<string | null>(null)
  const [djTarget, setDjTarget] = useState(70)
  const [spendMultiplier, setSpendMultiplier] = useState(1.0)

  // DJ scenario
  const djTargetFreq = +(1.2 + 1.18 * Math.log(djTarget)).toFixed(2)
  const djCurrentFreq = djBrands.find((b) => b.brand === 'BCA')!.freq
  const djFreqGain = +(djTargetFreq - djCurrentFreq).toFixed(2)

  // AI prediction
  const aiMpenBase = 62
  const aiMpenProjected = +(aiMpenBase * (0.85 + 0.15 * spendMultiplier)).toFixed(1)
  const aiMMSProjected = +(24 * (0.9 + 0.1 * spendMultiplier)).toFixed(1)

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">BCA · Forecast Engine</p>
          <h1 className="text-gray-900 text-2xl font-bold">Forecast & Projection</h1>
          <p className="text-gray-500 text-xs mt-1">DJ Law · CEP Expected Scores · MMS→Sales · AI Simulation · Growth Potential</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: DJ Forecast ──────────────────────────────────────────────── */}
      {tab === 'dj' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold text-sm">Double Jeopardy Law Forecast</p>
              <p className="text-gray-400 text-xs mt-0.5">Brands with lower penetration suffer double — lower reach AND lower frequency</p>
            </div>
            <button onClick={() => setShowModal('dj')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
              <Plus className="w-3.5 h-3.5" />Add Data
            </button>
          </div>

          {/* Formula */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 mr-2">DJ Formula:</span>
            Frequency = a + b × ln(Penetration) — brands predictably cluster along this curve regardless of strategy
            <span className="mx-3 text-gray-300">|</span>
            Outliers above curve = <span className="text-neon-green font-semibold">structural advantage</span>
            <span className="mx-2 text-gray-300">|</span>
            Below curve = <span className="text-red-500 font-semibold">loyalty problem</span>
          </div>

          {/* Scatter chart */}
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-900 font-semibold text-sm mb-1">Penetration vs Frequency — Category Brands</p>
            <p className="text-gray-400 text-xs mb-4">All credit card brands · Q4 2024 · Green line = DJ expected curve</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="pen" name="Penetration %" type="number" domain={[15, 85]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Penetration %', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#9ca3af' }} />
                <YAxis dataKey="freq" name="Frequency" type="number" domain={[2.5, 7]} tick={{ fill: '#9ca3af', fontSize: 11 }} label={{ value: 'Freq/yr', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]?.payload
                  if (!d?.brand) return null
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-2 text-xs shadow-sm">
                      <p className="font-semibold text-gray-900">{d.brand}</p>
                      <p className="text-gray-500">Pen: {d.pen}% · Freq: {d.freq}×</p>
                    </div>
                  )
                }} />
                {/* DJ curve as line */}
                <Scatter name="DJ Curve" data={djCurve} fill="#0FA958" opacity={0.3} line={{ stroke: '#0FA958', strokeWidth: 1.5 }} shape={() => null as unknown as React.ReactElement} />
                {/* Brand dots */}
                <Scatter name="Brands" data={djBrands} fill="#1f2937" shape={(props: { cx?: number; cy?: number; payload?: { brand: string } }) => {
                  const { cx = 0, cy = 0, payload } = props
                  const isBCA = payload?.brand === 'BCA'
                  return (
                    <g>
                      <circle cx={cx} cy={cy} r={isBCA ? 8 : 5} fill={isBCA ? '#0FA958' : '#6b7280'} opacity={0.9} />
                      <text x={cx + 10} y={cy + 4} fontSize={10} fill={isBCA ? '#0FA958' : '#6b7280'} fontWeight={isBCA ? 'bold' : 'normal'}>{payload?.brand}</text>
                    </g>
                  )
                }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario builder */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <p className="text-gray-900 font-semibold text-sm">Scenario Builder</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1.5 block">If BCA grows penetration to <span className="font-bold text-gray-900">{djTarget}%</span></label>
                <input type="range" min={62} max={85} value={djTarget} onChange={(e) => setDjTarget(Number(e.target.value))}
                  className="w-full accent-neon-green" />
                <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                  <span>Current (62%)</span><span>Category leader (85%)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Current Pen',   value: '62%',             color: 'text-gray-500' },
                { label: 'Target Pen',    value: `${djTarget}%`,    color: 'text-gray-900' },
                { label: 'Expected Freq', value: `${djTargetFreq}×`, color: 'text-neon-green' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3">
              <p className="text-[10px] text-neon-green/70 font-bold uppercase tracking-widest mb-1">DJ Prediction</p>
              <p className="text-gray-600 text-xs leading-relaxed">
                If BCA grows penetration to <strong>{djTarget}%</strong>, the DJ law predicts frequency will rise to <strong>{djTargetFreq}×/yr</strong> — a gain of <strong>+{djFreqGain}×</strong> without any loyalty-specific investment. Growing the buyer base naturally lifts frequency via the Double Jeopardy effect.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: CEP Expected Scores ─────────────────────────────────────── */}
      {tab === 'cep' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold text-sm">CEP Attribute Expected Scores</p>
              <p className="text-gray-400 text-xs mt-0.5">DJ-normalised linkage — Actual vs Expected deviation reveals true CEP strength</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-neon-green/20" /><span className="text-gray-400">≥+5pp Advantage</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-100" /><span className="text-gray-400">Neutral</span></span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-100" /><span className="text-gray-400">≤−5pp Gap</span></span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 mr-2">Expected Score Formula:</span>
            E(brand, CEP) = (Row Total × Column Total) ÷ Grand Total
            <span className="mx-3 text-gray-300">|</span>
            Deviation = Actual − Expected
            <span className="mx-3 text-gray-300">|</span>
            Controls for brand size so small brands aren&apos;t penalised
          </div>

          <div className="rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium w-36">CEP</th>
                  {BRANDS.map((b) => (
                    <th key={b} colSpan={3} className="px-3 py-3 text-center text-gray-600 font-semibold border-l border-gray-100">{b}</th>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-2 text-gray-300 font-normal text-[10px]"></th>
                  {BRANDS.map((b) => (
                    ['Act', 'Exp', 'Dev'].map((h) => (
                      <th key={`${b}-${h}`} className={cn('px-2 py-2 text-[10px] text-gray-400 font-medium text-center', h === 'Act' && 'border-l border-gray-100')}>{h}</th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {CEPS.map((cep, ci) => (
                  <tr key={cep} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2.5 text-gray-500 font-medium text-[11px] whitespace-nowrap">{cep}</td>
                    {BRANDS.map((b) => {
                      const { act, exp, dev } = expected[b][ci]
                      return (
                        <>
                          <td key={`${b}-act`} className="px-2 py-2 text-center text-gray-600 border-l border-gray-100">{act}</td>
                          <td key={`${b}-exp`} className="px-2 py-2 text-center text-gray-400">{exp}</td>
                          <td key={`${b}-dev`} className={cn('px-2 py-2 text-center font-semibold rounded-sm', devColor(dev))}>
                            {dev > 0 ? '+' : ''}{dev}
                          </td>
                        </>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BRANDS.map((b) => {
              const devs = expected[b].map((x) => x.dev)
              const defend = devs.filter((d) => d >= 5).length
              const build = devs.filter((d) => d <= -5).length
              return (
                <div key={b} className="rounded-xl bg-white border border-gray-200 p-4">
                  <p className="text-gray-900 font-bold text-sm mb-2">{b}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neon-green font-semibold">Advantage ≥+5pp</span>
                      <span className="text-neon-green font-bold">{defend}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-red-500 font-semibold">Gap ≤−5pp</span>
                      <span className="text-red-500 font-bold">{build}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Neutral</span>
                      <span className="text-gray-500">{devs.length - defend - build}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Tab 3: MMS → Sales ──────────────────────────────────────────────── */}
      {tab === 'mms' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 font-semibold text-sm">MMS → Sales Forecast</p>
              <p className="text-gray-400 text-xs mt-0.5">Mental Market Share is a leading indicator of Sales Market Share (r = 0.83, 1–2 quarter lag)</p>
            </div>
            <button onClick={() => setShowModal('mms')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
              <Plus className="w-3.5 h-3.5" />Add Data
            </button>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 mr-2">Correlation:</span>
            r = 0.83 between MMS and SMS (1–2 quarter lag)
            <span className="mx-3 text-gray-300">|</span>
            MMS gap &gt; SMS gap = <span className="text-neon-green font-semibold">mental problem</span>
            <span className="mx-2 text-gray-300">|</span>
            MMS &gt; SMS = <span className="text-amber-500 font-semibold">physical availability problem</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-semibold text-gray-700">Diagnosis: MMS 27% &gt; SMS 21% → physical gap</span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Current MMS', value: '27%', delta: '+3pp', desc: 'Q4 2024' },
              { label: 'Current SMS', value: '21%', delta: '±0pp', desc: 'Q4 2024' },
              { label: 'MMS–SMS Gap', value: '+6pp', delta: null, desc: 'Physical availability gap' },
              { label: 'Projected SMS', value: '~27%', delta: null, desc: 'If physical gap closes (Q2 \'25)' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">{s.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                  {s.delta && <p className="text-neon-green text-xs font-semibold mb-0.5">{s.delta}</p>}
                </div>
                <p className="text-gray-300 text-[11px] mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-900 font-semibold text-sm mb-1">MMS vs SMS — Historical + Projection</p>
            <p className="text-gray-400 text-xs mb-4">Dashed = projected · MMS leads SMS by ~1–2 quarters</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mmsSalesHistory} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="wave" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[14, 36]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x="Q4 '24" stroke="#e5e7eb" strokeDasharray="4 4" label={{ value: 'Projection →', position: 'insideTopRight', fontSize: 10, fill: '#9ca3af' }} />
                <Line type="monotone" dataKey="mms" name="MMS %" stroke="#0FA958" strokeWidth={2} dot={{ r: 3, fill: '#0FA958' }} connectNulls />
                <Line type="monotone" dataKey="sms" name="SMS %" stroke="#6b7280" strokeWidth={2} dot={{ r: 3, fill: '#6b7280' }} strokeDasharray="4 4" connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-2">
            <p className="text-gray-700 font-semibold text-sm">Forecast Interpretation</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              BCA&apos;s MMS (27%) exceeds SMS (21%) by +6pp — a clear Physical Availability gap. Mental demand exists but isn&apos;t being converted at point of purchase. With the r=0.83 correlation, closing distribution gaps in agent banking and WhatsApp channels should yield <strong>+4–6pp SMS growth within 2 quarters</strong>.
            </p>
            <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3">
              <p className="text-[10px] text-neon-green/70 font-bold uppercase tracking-widest mb-1">Projection</p>
              <p className="text-gray-600 text-xs leading-relaxed">
                If physical distribution improvements are deployed in Q1 2025, MMS momentum (29%→31% projected) should translate to SMS ~27–29% by Q2 2025 — aligning with the MMS lead indicator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 4: AI Predictions ──────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-5">
          <div>
            <p className="text-gray-900 font-semibold text-sm">AI-Powered Forecast Simulation</p>
            <p className="text-gray-400 text-xs mt-0.5">Simulate media investment impact · Identify category twin benchmarks · Track trend alerts</p>
          </div>

          {/* Media spend simulator */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-gray-900 font-semibold text-sm">Media Spend Simulator</p>
              <span className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-[10px] font-bold rounded-full uppercase tracking-wide">AI</span>
            </div>
            <p className="text-gray-400 text-xs">Adjust relative media investment to project mental availability impact</p>

            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">
                Investment multiplier: <span className="font-bold text-gray-900">{spendMultiplier.toFixed(1)}×</span> current
              </label>
              <input type="range" min={0.5} max={3.0} step={0.1} value={spendMultiplier}
                onChange={(e) => setSpendMultiplier(Number(e.target.value))}
                className="w-full accent-neon-green" />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>0.5× (Cut 50%)</span><span>1.0× (Current)</span><span>3.0× (Triple)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Current MPen',   value: `${aiMpenBase}%`,        color: 'text-gray-500' },
                { label: 'Projected MPen', value: `${aiMpenProjected}%`,   color: 'text-neon-green' },
                { label: 'Projected MMS',  value: `${aiMMSProjected}%`,    color: 'text-neon-green' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                AI simulation uses a simplified log-linear response model calibrated on category averages. Connect actual media spend data via Settings → Integrations for market-mix-modelling-grade accuracy.
              </p>
            </div>
          </div>

          {/* Category twins */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-gray-900 font-semibold text-sm">Category Twin Benchmarks</p>
              <span className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-[10px] font-bold rounded-full uppercase tracking-wide">AI</span>
            </div>
            <p className="text-gray-400 text-xs">Brands in analogous categories that match BCA&apos;s current CBM profile — learn from their growth trajectories</p>
            <div className="space-y-3">
              {[
                { twin: 'CommBank (AU)', category: 'Retail Banking · Australia', mpen: 64, mms: 28, outcome: 'Grew pen +9pp in 3 years via digital CEP focus', match: 94 },
                { twin: 'HDFC Bank (IN)', category: 'Retail Banking · India', mpen: 61, mms: 25, outcome: 'Closed MMS→SMS gap by launching 3 new channels', match: 89 },
                { twin: 'DBS Bank (SG)', category: 'Retail Banking · Singapore', mpen: 67, mms: 29, outcome: 'Dominant in Contactless pay CEP — now #1 in category', match: 82 },
              ].map((t) => (
                <div key={t.twin} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-gray-900 font-semibold text-xs">{t.twin}</p>
                      <span className="text-[10px] text-gray-400">{t.category}</span>
                    </div>
                    <p className="text-gray-500 text-[11px] leading-relaxed">{t.outcome}</p>
                    <div className="flex items-center gap-4 mt-1.5">
                      <span className="text-[10px] text-gray-400">MPen {t.mpen}%</span>
                      <span className="text-[10px] text-gray-400">MMS {t.mms}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-neon-green font-bold text-sm">{t.match}%</p>
                    <p className="text-gray-400 text-[10px]">match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend alerts */}
          <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-900 font-semibold text-sm">Trend Alerts</p>
              <span className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-[10px] font-bold rounded-full uppercase tracking-wide">AI</span>
            </div>
            {[
              { severity: 'high', title: 'Mandiri PWOM accelerating', detail: 'PWOM +8 over 2 waves — if sustained, will close MPen gap to BCA within 3 quarters at current trajectory', color: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-600' },
              { severity: 'med', title: 'Contactless pay CEP under-penetrated', detail: 'BCA holds +9pp deviation in Contactless pay but only 83% online channel coverage — distribution ceiling may limit CEP conversion', color: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-600' },
              { severity: 'low', title: 'DJ curve gap widening vs Mandiri', detail: 'Mandiri frequency rising faster than pen growth predicts — possible loyalty programme effect worth monitoring', color: 'border-gray-200 bg-gray-50', badge: 'bg-gray-100 text-gray-500' },
            ].map((a) => (
              <div key={a.title} className={cn('flex items-start gap-3 p-3 rounded-lg border', a.color)}>
                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 mt-0.5', a.badge)}>{a.severity}</span>
                <div>
                  <p className="text-gray-800 font-semibold text-xs">{a.title}</p>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 5: Growth Potential ────────────────────────────────────────── */}
      {tab === 'growth' && (
        <div className="space-y-5">
          <div>
            <p className="text-gray-900 font-semibold text-sm">Growth Potential via Non-buyer MPen</p>
            <p className="text-gray-400 text-xs mt-0.5">Where mental availability is already strong but buyers haven&apos;t converted — highest-ROI recruitment targets</p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 mr-2">Growth Principle:</span>
            Brands grow by increasing penetration (new buyers) not loyalty — target non-buyers and light buyers who already have mental availability
            <span className="mx-3 text-gray-300">|</span>
            Priority = high MPen + non-buyer = easiest growth
          </div>

          {/* MPen by segment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {growthSegments.map((s) => (
              <div key={s.segment} className="rounded-xl bg-white border border-gray-200 p-5">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">{s.segment}</p>
                <p className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.mpen}%</p>
                <p className="text-gray-400 text-xs">Mental Penetration</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 rounded-full" style={{ width: `${s.mpen}%`, backgroundColor: s.color }} />
                </div>
                <p className="text-gray-300 text-[10px] mt-1">{s.size}% of category</p>
              </div>
            ))}
          </div>

          {/* Growth waterfall */}
          <div className="rounded-xl bg-white border border-gray-200 p-5">
            <p className="text-gray-900 font-semibold text-sm mb-1">Growth Waterfall — MPen Opportunity</p>
            <p className="text-gray-400 text-xs mb-4">Sequential gain if BCA converts segments with existing mental availability</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={growthWaterfall} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#0FA958"
                  shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { type: string } }) => {
                    const { x = 0, y = 0, width = 0, height = 0, payload } = props
                    const color = payload?.type === 'gain' ? '#6ee7b7' : payload?.type === 'target' ? '#0FA958' : '#e5e7eb'
                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-gray-200" />Base</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-green-200" />Gain</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-neon-green" />Target</span>
            </div>
          </div>

          {/* Decision framework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-3">
              <p className="text-neon-green font-bold text-sm">Recruitment Priority</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Non-buyers with MPen 41% — 38% of category. They already mentally consider BCA but haven&apos;t converted. Physical availability gaps (agent banking, WhatsApp) are the primary barrier. Close distribution first.
              </p>
              <div className="space-y-2">
                {[
                  { action: 'Launch agent banking in underserved areas', impact: 'High' },
                  { action: 'WhatsApp onboarding funnel', impact: 'High' },
                  { action: 'Reinforce Contactless pay CEP in media', impact: 'Med' },
                ].map((a) => (
                  <div key={a.action} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{a.action}</span>
                    <span className={cn('font-semibold', a.impact === 'High' ? 'text-neon-green' : 'text-amber-500')}>{a.impact}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-3">
              <p className="text-blue-500 font-bold text-sm">Network Size Growth</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Light buyers at MPen 71% — 24% of category. Moderate mental presence. Growing frequency here is second priority. DJ law predicts frequency gains will follow once penetration reaches 70%+.
              </p>
              <div className="space-y-2">
                {[
                  { action: 'Travel reward CEP — close -2pp gap', impact: 'Med' },
                  { action: 'Family expenses CEP reinforcement', impact: 'Med' },
                  { action: 'Cashback CEP messaging refresh', impact: 'Low' },
                ].map((a) => (
                  <div key={a.action} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{a.action}</span>
                    <span className={cn('font-semibold', a.impact === 'Med' ? 'text-amber-500' : 'text-gray-400')}>{a.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal === 'dj' && (
        <DataEntryModal
          title="Add DJ Forecast Data"
          description="Enter penetration % and purchase frequency per brand to update the Double Jeopardy curve."
          fields={DJ_FIELDS}
          requirements={DJ_REQS}
          templateName="BCA_DJ_Forecast_Template"
          templateHeaders={['Wave', 'Brand', 'Penetration %', 'Frequency (times/yr)']}
          onClose={() => setShowModal(null)}
        />
      )}
      {showModal === 'mms' && (
        <DataEntryModal
          title="Add MMS / SMS Data"
          description="Enter Mental Market Share and Sales Market Share per wave to update the correlation model."
          fields={MMS_FIELDS}
          requirements={MMS_REQS}
          templateName="BCA_MMS_SMS_Template"
          templateHeaders={['Wave', 'MMS %', 'SMS %']}
          onClose={() => setShowModal(null)}
        />
      )}
    </div>
  )
}
