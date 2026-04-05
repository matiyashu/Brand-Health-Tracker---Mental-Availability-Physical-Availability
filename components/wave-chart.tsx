'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { wave: "Q1 '24", BCA: 58, Mandiri: 66, BNI: 41, CIMB: 35, Permata: 27 },
  { wave: "Q2 '24", BCA: 60, Mandiri: 68, BNI: 43, CIMB: 36, Permata: 28 },
  { wave: "Q3 '24", BCA: 59, Mandiri: 70, BNI: 44, CIMB: 37, Permata: 28 },
  { wave: "Q4 '24", BCA: 62, Mandiri: 71, BNI: 45, CIMB: 38, Permata: 29 },
]

const brands = [
  { key: 'BCA',     color: '#0FA958' },
  { key: 'Mandiri', color: '#60a5fa' },
  { key: 'BNI',     color: '#f59e0b' },
  { key: 'CIMB',    color: '#a78bfa' },
  { key: 'Permata', color: '#f87171' },
]

export function WaveChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="wave" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} domain={[20, 80]} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {brands.map((b) => (
            <Line key={b.key} type="monotone" dataKey={b.key} stroke={b.color}
              strokeWidth={b.key === 'BCA' ? 2.5 : 1.5}
              dot={{ r: 3, strokeWidth: 0, fill: b.color }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
