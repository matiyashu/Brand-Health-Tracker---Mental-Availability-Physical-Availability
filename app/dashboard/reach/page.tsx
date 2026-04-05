'use client'

import { useState } from 'react'
import { Upload, Plus } from 'lucide-react'
import { DataEntryModal, type DataField, type DataRequirement } from '@/components/data-entry-modal'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const reachData = [
  { wave: 'Q1 \'24', noticed: 41, branded: 34 },
  { wave: 'Q2 \'24', noticed: 44, branded: 36 },
  { wave: 'Q3 \'24', noticed: 43, branded: 37 },
  { wave: 'Q4 \'24', noticed: 47, branded: 40 },
]

const creatives = [
  { name: 'BCA TV Spot — Nov 2024', noticed: 52, branded: 44, score: 'strong' },
  { name: 'BCA Digital Banner — Oct 2024', noticed: 38, branded: 29, score: 'medium' },
  { name: 'BCA OOH Jakarta — Q4 2024', noticed: 61, branded: 33, score: 'weak' },
]

const scoreColor = { strong: 'text-neon-green', medium: 'text-amber-500', weak: 'text-red-500' }

const REACH_FIELDS: DataField[] = [
  { key: 'creative', label: 'Creative Name',      type: 'text',    required: true },
  { key: 'noticed',  label: 'Noticed %',           type: 'percent', required: true, hint: '% category buyers who saw ad' },
  { key: 'branded',  label: 'Correctly Branded %', type: 'percent', required: true, hint: 'Unprompted brand recall' },
  { key: 'period',   label: 'Wave Period',          type: 'select',  required: true, options: ['Q1 2025', 'Q4 2024', 'Q3 2024'] },
]
const REACH_REQS: DataRequirement[] = [
  { label: 'De-branded creative used',   desc: 'Brand name removed from stimulus', ok: true },
  { label: 'Category buyer sample',      desc: 'All category buyers, not just brand buyers', ok: true },
  { label: 'Unprompted recall measured', desc: 'Open-text brand recall after exposure', ok: true },
  { label: 'Branding ratio calculated',  desc: 'Branded % ÷ Noticed %', ok: false },
]

export default function ReachPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">BCA · Q4 2024</p>
          <h1 className="text-gray-900 text-2xl font-bold">Marketing Reach</h1>
          <p className="text-gray-500 text-xs mt-1">Effective reach · Correct branding attribution</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/20 text-neon-green text-xs font-semibold hover:bg-neon-green/5 transition-colors">
            <Plus className="w-3.5 h-3.5" />Add Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 hover:border-gray-300 transition-colors">
            <Upload className="w-3.5 h-3.5" />Upload Creative
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Effective Reach', value: '47%', delta: '+4pp', desc: '% noticed ad' },
          { label: 'Correct Branding', value: '40%', delta: '+3pp', desc: 'Unprompted recall' },
          { label: 'Branding Ratio', value: '85%', delta: null, desc: 'Branded / Noticed' },
          { label: 'Creatives Tested', value: '3', delta: null, desc: 'This wave' },
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

      {/* Trend chart */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-900 font-semibold text-sm mb-1">Reach Trend</p>
        <p className="text-gray-400 text-xs mb-4">% of category buyers · Last 4 waves</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={reachData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="wave" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 80]} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="noticed" name="Noticed" fill="#e5e7eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="branded" name="Correctly Branded" fill="#0FA958" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Creative table */}
      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-gray-900 font-semibold text-sm">Creative Performance</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Creative</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">Noticed %</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">Branded %</th>
              <th className="px-4 py-3 text-right text-gray-400 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {creatives.map((c) => (
              <tr key={c.name} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-gray-600">{c.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">{c.noticed}%</td>
                <td className="px-4 py-3 text-right text-gray-600">{c.branded}%</td>
                <td className={`px-4 py-3 text-right font-semibold capitalize ${scoreColor[c.score as keyof typeof scoreColor]}`}>{c.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DataEntryModal
          title="Add Effective Reach Data"
          description="Enter noticed % and correctly branded % per creative from de-branded exposure tests."
          fields={REACH_FIELDS}
          requirements={REACH_REQS}
          templateName="BCA_Reach_Template"
          templateHeaders={['Wave', 'Creative Name', 'Noticed %', 'Correctly Branded %', 'Branding Ratio %']}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
