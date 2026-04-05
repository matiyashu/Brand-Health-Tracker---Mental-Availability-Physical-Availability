import { FileText, Download, FileBarChart, Presentation, Shield, Table2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const reports = [
  {
    type: 'exec',
    icon: FileText,
    title: 'Executive Summary',
    desc: 'One-page CEO headline · Gap diagnosis · Key findings',
    formats: ['PDF'],
    lastGenerated: 'Dec 28, 2024',
    status: 'ready',
  },
  {
    type: 'wave',
    icon: FileBarChart,
    title: 'Wave Tracker Report',
    desc: 'Full KPI movement · Competitive tables · Mental Advantage heatmap · Gap diagnosis',
    formats: ['PDF'],
    lastGenerated: 'Dec 28, 2024',
    status: 'ready',
  },
  {
    type: 'pptx',
    icon: Presentation,
    title: 'Client Presentation Deck',
    desc: '10-15 slide deck · Auto-generated from project data',
    formats: ['PPTX'],
    lastGenerated: 'Dec 27, 2024',
    status: 'ready',
  },
  {
    type: 'compliance',
    icon: Shield,
    title: 'CBM Compliance Report',
    desc: 'Methodology audit · Attribute composition · Survey design · Sampling compliance',
    formats: ['PDF'],
    lastGenerated: 'Dec 26, 2024',
    status: 'ready',
  },
  {
    type: 'raw',
    icon: Table2,
    title: 'Raw Data Export',
    desc: 'Respondents · Linkages · KPIs · Pivot tables',
    formats: ['XLSX', 'CSV'],
    lastGenerated: 'Dec 28, 2024',
    status: 'ready',
  },
]

const iconColor: Record<string, string> = {
  exec: 'text-neon-green',
  wave: 'text-blue-500',
  pptx: 'text-amber-500',
  compliance: 'text-violet-500',
  raw: 'text-pink-500',
}

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Indonesian Credit Cards · Q4 2024</p>
        <h1 className="text-gray-900 text-2xl font-bold">Reports</h1>
        <p className="text-gray-500 text-xs mt-1">Exportable reports · PDF & PPTX · Raw data</p>
      </div>

      {/* Exec summary preview */}
      <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-neon-green text-xs font-bold uppercase tracking-widest">Latest Executive Summary</p>
          <span className="text-gray-400 text-[11px]">Dec 28, 2024</span>
        </div>
        <p className="text-gray-800 font-semibold text-sm leading-relaxed mb-2">
          BCA leads mental availability (MPen 62%) but faces a fragile mental advantage — MMS outpaces
          SMS by 3pp. Mandiri is closing on all four KPIs. Immediate priority: defend CEP ownership
          in <em>Why</em> and <em>When</em> dimensions before Q1 2025 campaign season.
        </p>
        <div className="border-t border-gray-200 pt-3 mt-3 space-y-1.5">
          {[
            'MPen grew +4pp QoQ to 62% — strongest improvement in 3 waves.',
            'MMS vs SMS gap = +3pp (mental availability fragile, conversion at risk).',
            'Mandiri MPen +5pp QoQ — closing gap; defend high-incidence CEPs now.',
          ].map((finding, i) => (
            <div key={i} className="flex gap-2 text-xs text-gray-500">
              <span className="text-neon-green font-bold shrink-0">{i + 1}.</span>
              <span>{finding}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report cards */}
      <div className="space-y-3">
        {reports.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.type} className="rounded-xl bg-white border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gray-300 transition-colors">
              <div className={cn('w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0', iconColor[r.type])}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-gray-900 text-sm font-semibold">{r.title}</p>
                  {r.formats.map((f) => (
                    <span key={f} className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{f}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-xs">{r.desc}</p>
                <p className="text-gray-300 text-[11px] mt-1">Last generated: {r.lastGenerated}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 hover:border-gray-300 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
                  Generate
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
