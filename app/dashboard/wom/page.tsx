'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

const womData = [
  { wave: 'Q1 \'24', PWOM: 34, NWOM: 8 },
  { wave: 'Q2 \'24', PWOM: 37, NWOM: 7 },
  { wave: 'Q3 \'24', PWOM: 35, NWOM: 9 },
  { wave: 'Q4 \'24', PWOM: 39, NWOM: 6 },
]

const brandWom = [
  { brand: 'BCA',     pwom: 39, nwom: 6 },
  { brand: 'Mandiri', pwom: 44, nwom: 8 },
  { brand: 'BNI',     pwom: 28, nwom: 11 },
  { brand: 'CIMB',    pwom: 22, nwom: 14 },
  { brand: 'Permata', pwom: 17, nwom: 16 },
]

const WOM_FIELDS: DataField[] = [
  { key: 'brand',  label: 'Brand',       type: 'text',   required: true },
  { key: 'pwom',   label: 'PWOM',        type: 'number', required: true, unit: 'per 100 buyers', hint: 'e.g. 39' },
  { key: 'nwom',   label: 'NWOM',        type: 'number', required: true, unit: 'per 100 buyers', hint: 'e.g. 6' },
  { key: 'period', label: 'Wave Period', type: 'select', required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'] },
]

const WOM_REQS: DataRequirement[] = [
  { label: 'Binary WOM questions used',        desc: 'Recommended / warned against in past month', ok: true },
  { label: 'Category-wide sample',             desc: 'All category buyers, not just brand buyers',  ok: true },
  { label: 'Both given & received measured',   desc: 'WOM Given + WOM Received blocks included',   ok: false },
  { label: 'Competitive set complete',         desc: 'All brands measured on same WOM questions',   ok: true },
]

export default function WomPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">BCA · Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">WOM Tracker</h1>
          <p className="text-gray-500 text-xs mt-1">Positive & Negative WOM per 100 category buyers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
          <Plus className="w-3.5 h-3.5" />Add WOM Data
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'PWOM', value: '39', sub: 'per 100 buyers', color: 'text-neon-green', delta: '+4' },
          { label: 'NWOM', value: '6', sub: 'per 100 buyers', color: 'text-red-500', delta: '-3' },
          { label: 'Net WOM', value: '+33', sub: 'PWOM − NWOM', color: 'text-gray-900', delta: '+7' },
          { label: 'WOM Ratio', value: '6.5x', sub: 'PWOM / NWOM', color: 'text-gray-900', delta: null },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white border border-gray-200 p-4">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-300 text-[11px] mt-1">{s.sub}</p>
            {s.delta && <p className="text-neon-green text-xs font-semibold mt-1">{s.delta} vs Q3</p>}
          </div>
        ))}
      </div>

      {/* Analysis */}
      <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-2">
        <p className="text-gray-700 font-semibold text-sm">WOM Analysis</p>
        <p className="text-gray-600 text-sm leading-relaxed">
          BCA&apos;s PWOM grew +4 to 39 per 100 buyers, while NWOM dropped -3 to 6 — Net WOM now +33, the highest in 4 waves.
          A 6.5× PWOM/NWOM ratio is strong. However, Mandiri leads PWOM at 44, indicating higher organic advocacy.
        </p>
        <div className="rounded-lg bg-neon-green/5 border border-neon-green/20 p-3">
          <p className="text-[10px] text-neon-green/70 font-bold uppercase tracking-widest mb-1">Recommendation</p>
          <p className="text-gray-600 text-xs leading-relaxed">
            Prioritise customer experience improvements that generate spontaneous PWOM — particularly post-application and first-use experiences. Monitor Mandiri&apos;s PWOM advantage.
          </p>
        </div>
      </div>

      {/* BCA trend */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-900 font-semibold text-sm mb-1">BCA WOM Trend</p>
        <p className="text-gray-400 text-xs mb-4">Per 100 category buyers · Non-buyers + light</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={womData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="wave" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="PWOM" fill="#0FA958" radius={[3, 3, 0, 0]} />
            <Bar dataKey="NWOM" fill="#f87171" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Competitive WOM */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900 font-semibold text-sm">Competitive WOM — Q4 2024</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Brand</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">PWOM</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">NWOM</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">Net WOM</th>
            </tr>
          </thead>
          <tbody>
            {brandWom.map((b, i) => (
              <tr key={b.brand} className={`border-b border-gray-50 last:border-0 ${i === 0 ? 'bg-neon-green/5' : ''}`}>
                <td className="px-5 py-3 text-gray-700 font-medium">{b.brand}{i === 0 && <span className="ml-2 text-[10px] text-gray-400">(you)</span>}</td>
                <td className="px-4 py-3 text-right text-neon-green font-semibold">{b.pwom}</td>
                <td className="px-4 py-3 text-right text-red-400 font-semibold">{b.nwom}</td>
                <td className="px-4 py-3 text-right text-gray-600 font-semibold">+{b.pwom - b.nwom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DataEntryModal
          title="Add WOM Data"
          description="Enter PWOM and NWOM scores per brand from the latest survey wave."
          fields={WOM_FIELDS}
          requirements={WOM_REQS}
          templateName="BCA_WOM_Template"
          templateHeaders={['Wave', 'Brand', 'PWOM (per 100)', 'NWOM (per 100)', 'Net WOM']}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
