'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'

const BRANDS = ['BCA', 'Mandiri', 'BNI', 'CIMB', 'Permata']

const CEPS = [
  'Trusted daily use', 'Emergency cash', 'Travel reward', 'Online shopping',
  'Contactless pay', 'Family expenses', 'Business spend', 'Cashback',
  'Premium status', 'Easy approval',
]

const deviations: Record<string, number[]> = {
  BCA:     [ 8,  5, -2,  6,  9, 4, -1,  3,  7,  2],
  Mandiri: [ 6,  3,  7,  4,  2, 8,  6,  1,  3, -2],
  BNI:     [-3,  1, -4,  2, -2, 3,  4, -3, -5,  6],
  CIMB:    [-4, -3,  8, -1, -3,-2,  1,  5, -2, -4],
  Permata: [-6, -5, -6, -4, -7,-6, -4, -2,  1,  4],
}

function cellConfig(dev: number) {
  if (dev >= 5) return { label: 'DEFEND', bg: 'bg-neon-green/10', text: 'text-neon-green', border: 'border-neon-green/25' }
  if (dev <= -5) return { label: 'BUILD', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200' }
  return { label: 'MAINTAIN', bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' }
}

const MA_FIELDS: DataField[] = [
  { key: 'brand',    label: 'Brand',            type: 'text',    required: true },
  { key: 'cep',      label: 'CEP',              type: 'text',    required: true },
  { key: 'actual',   label: 'Actual Score %',   type: 'percent', required: true },
  { key: 'expected', label: 'Expected Score %', type: 'percent', required: true, hint: '(Row total × Col total) ÷ Grand total' },
]

const MA_REQS: DataRequirement[] = [
  { label: 'Binary linkage matrix complete', desc: 'All brand × CEP cells populated', ok: true },
  { label: 'Expected scores calculated',     desc: 'DJ formula applied per cell',     ok: false },
  { label: 'Same sample base as MPen',       desc: 'Consistent respondent pool',      ok: true },
  { label: 'All competitors included',       desc: 'Full competitive set in matrix',  ok: true },
]

export default function MentalAdvantagePage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Mental Advantage · Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">Mental Map</h1>
          <p className="text-gray-500 text-xs mt-1">Deviation from Double Jeopardy expected score (pp). Actual − Expected.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
            <Plus className="w-3.5 h-3.5" />Add Data
          </button>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-neon-green/20" /><span className="text-gray-400">≥+5pp DEFEND</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gray-100" /><span className="text-gray-400">MAINTAIN</span></span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-100" /><span className="text-gray-400">≤−5pp BUILD</span></span>
          </div>
        </div>
      </div>

      {/* Formula explanation */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-500">
        <span className="font-semibold text-gray-700 mr-2">DJ Formula:</span>
        Expected Score = (Row Total × Column Total) ÷ Grand Total
        <span className="mx-3 text-gray-300">|</span>
        Deviation &gt; +5pp → <span className="text-neon-green font-semibold">DEFEND</span>
        <span className="mx-2 text-gray-300">|</span>
        Deviation &lt; −5pp → <span className="text-red-500 font-semibold">BUILD</span>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-400 font-medium w-40">CEP</th>
              {BRANDS.map((b) => (
                <th key={b} className="px-3 py-3 text-gray-600 font-semibold text-center">{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CEPS.map((cep, ci) => (
              <tr key={cep} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-2.5 text-gray-500 font-medium whitespace-nowrap">{cep}</td>
                {BRANDS.map((brand) => {
                  const dev = deviations[brand][ci]
                  const cfg = cellConfig(dev)
                  return (
                    <td key={brand} className="px-2 py-2 text-center">
                      <div
                        className={cn('inline-flex flex-col items-center justify-center rounded-lg border px-3 py-2 w-20 cursor-pointer hover:brightness-95 transition-all', cfg.bg, cfg.border)}
                        title={`${brand} × ${cep}: ${dev > 0 ? '+' : ''}${dev}pp`}
                      >
                        <span className={cn('font-bold text-sm', cfg.text)}>{dev > 0 ? '+' : ''}{dev}</span>
                        <span className={cn('text-[9px] font-semibold tracking-widest uppercase mt-0.5', cfg.text, 'opacity-70')}>{cfg.label}</span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategic summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { brand: 'BCA',     defend: 4, build: 1, maintain: 5, color: 'text-neon-green', analysis: 'Strong on Trusted daily use (+8pp) and Contactless pay (+9pp). Build in Travel reward (−2pp).' },
          { brand: 'Mandiri', defend: 3, build: 1, maintain: 6, color: 'text-blue-500',   analysis: 'Leads on Family expenses (+8pp). Weakness in Easy approval (−2pp) — opportunity for BCA.' },
          { brand: 'BNI',     defend: 1, build: 3, maintain: 6, color: 'text-amber-500',  analysis: 'Only defending Easy approval (+6pp). Significant deficits in Premium status (−5pp).' },
        ].map((b) => (
          <div key={b.brand} className="rounded-xl bg-white border border-gray-200 p-4">
            <p className={cn('font-bold text-sm mb-2', b.color)}>{b.brand}</p>
            <div className="space-y-2 mb-3">
              {[
                { label: 'DEFEND', count: b.defend, color: 'bg-neon-green' },
                { label: 'MAINTAIN', count: b.maintain, color: 'bg-gray-200' },
                { label: 'BUILD', count: b.build, color: 'bg-red-400' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide w-16">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                    <div className={cn('h-1.5 rounded-full', s.color)} style={{ width: `${(s.count / 10) * 100}%` }} />
                  </div>
                  <span className="text-gray-500 text-xs w-4 text-right">{s.count}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{b.analysis}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <DataEntryModal
          title="Add Mental Advantage Data"
          description="Enter actual and expected linkage scores per brand × CEP cell."
          fields={MA_FIELDS}
          requirements={MA_REQS}
          templateName="BCA_MentalAdvantage_Template"
          templateHeaders={['Brand', 'CEP', 'Actual Score %', 'Expected Score %', 'Deviation (pp)']}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
