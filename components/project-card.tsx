import Link from 'next/link'
import { BarChart3, Archive, Copy, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Project {
  id: string; name: string; category: string; geography: string
  brands: number; ceps: number; waves: number; lastWave: string
  status: 'active' | 'archived' | 'draft'; isDemo?: boolean; isTemplate?: boolean
  mpen?: number; compliance?: number
}

const statusConfig = {
  active:   { label: 'Active',   color: 'text-neon-green', bg: 'bg-neon-green/10' },
  archived: { label: 'Archived', color: 'text-gray-400',   bg: 'bg-gray-100' },
  draft:    { label: 'Draft',    color: 'text-amber-500',  bg: 'bg-amber-50' },
}

export function ProjectCard({ project }: { project: Project }) {
  const cfg = statusConfig[project.status]
  return (
    <div className="rounded-xl bg-white border border-gray-200 hover:border-neon-green/30 hover:shadow-sm transition-all group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', cfg.color, cfg.bg)}>{cfg.label}</span>
              {project.isDemo && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-violet-500 bg-violet-50 uppercase tracking-wide">Demo</span>}
              {project.isTemplate && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-amber-500 bg-amber-50 uppercase tracking-wide">Template</span>}
            </div>
            <h3 className="text-gray-900 font-semibold text-sm mt-1.5 leading-snug">{project.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{project.category} · {project.geography}</p>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-100 text-gray-300 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span>{project.brands} brands</span>
          <span className="w-px h-3 bg-gray-200" />
          <span>{project.ceps} CEPs</span>
          <span className="w-px h-3 bg-gray-200" />
          <span>{project.waves} waves</span>
        </div>
        {project.mpen !== undefined && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">MPen (latest)</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-green rounded-full" style={{ width: `${project.mpen}%` }} />
                </div>
                <span className="text-neon-green text-xs font-semibold">{project.mpen}%</span>
              </div>
            </div>
            {project.compliance !== undefined && (
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">CBM</p>
                <span className={cn('text-xs font-semibold', project.compliance === 100 ? 'text-neon-green' : 'text-amber-500')}>{project.compliance}%</span>
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-gray-300 mb-4">Last wave: {project.lastWave}</p>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
            <BarChart3 className="w-3.5 h-3.5" />Open Dashboard
          </Link>
          <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors" title="Clone"><Copy className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  )
}
