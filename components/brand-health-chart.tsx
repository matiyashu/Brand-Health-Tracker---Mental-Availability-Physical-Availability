'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts'

const data = [
  { metric: 'MPen',     BCA: 62, Mandiri: 71, BNI: 45, CIMB: 38, Permata: 29 },
  { metric: 'MMS',      BCA: 24, Mandiri: 28, BNI: 17, CIMB: 14, Permata: 10 },
  { metric: 'NS',       BCA: 42, Mandiri: 48, BNI: 36, CIMB: 31, Permata: 28 },
  { metric: 'SoM',      BCA: 22, Mandiri: 26, BNI: 15, CIMB: 11, Permata: 8  },
  { metric: 'CEP Reach',BCA: 58, Mandiri: 64, BNI: 42, CIMB: 35, Permata: 26 },
]

const brands = [
  { key: 'BCA',     color: '#0FA958' },
  { key: 'Mandiri', color: '#60a5fa' },
  { key: 'BNI',     color: '#f59e0b' },
  { key: 'CIMB',    color: '#a78bfa' },
  { key: 'Permata', color: '#f87171' },
]

export function BrandHealthChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} />
          {brands.map((b) => (
            <Radar key={b.key} name={b.key} dataKey={b.key}
              stroke={b.color} fill={b.color} fillOpacity={0.08} strokeWidth={2} />
          ))}
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
