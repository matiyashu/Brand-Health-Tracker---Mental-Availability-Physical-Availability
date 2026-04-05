'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, ClipboardList, BarChart3, Brain,
  ShoppingBag, Megaphone, MessageSquare, FileText, Settings,
  ChevronDown, FolderOpen, Sparkles, HelpCircle, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const projects = [
  { id: 'idn-cc-2024',  name: 'Indonesian Credit Cards', dot: 'bg-neon-green' },
  { id: 'idn-coffee',   name: 'Coffee Shops — Jakarta',  dot: 'bg-blue-400' },
  { id: 'demo-cc',      name: '[Demo] Credit Cards',      dot: 'bg-violet-400' },
]

const nav = [
  { label: 'Overview', items: [
    { href: '/dashboard',                    icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'Research', items: [
    { href: '/dashboard/ceps',               icon: Target,          label: 'CEP Builder' },
    { href: '/dashboard/surveys',            icon: ClipboardList,   label: 'Surveys' },
  ]},
  { label: 'Analytics', items: [
    { href: '/dashboard/analytics',          icon: BarChart3,       label: 'Brand KPIs' },
    { href: '/dashboard/mental-advantage',   icon: Brain,           label: 'Mental Advantage' },
    { href: '/dashboard/physical',           icon: ShoppingBag,     label: 'Physical Availability' },
    { href: '/dashboard/reach',              icon: Megaphone,       label: 'Marketing Reach' },
    { href: '/dashboard/wom',                icon: MessageSquare,   label: 'WOM Tracker' },
    { href: '/dashboard/forecast',           icon: TrendingUp,      label: 'Forecast' },
  ]},
  { label: 'Outputs', items: [
    { href: '/dashboard/reports',            icon: FileText,        label: 'Reports' },
  ]},
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(projects[0])

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-200 shrink-0',
      collapsed ? 'w-14' : 'w-56'
    )}>
      {/* Wordmark */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-gray-100">
        <Link href="/projects" className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-neon-green shrink-0">
            <span className="text-white font-black text-[10px]">F</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-gray-900 font-bold text-xs leading-none">Fortuna</p>
              <p className="text-gray-400 text-[9px] leading-none mt-0.5">by Prima Hanura Akbar</p>
            </div>
          )}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
          <ChevronDown className={cn('w-3 h-3 transition-transform', collapsed ? '-rotate-90' : 'rotate-90')} />
        </button>
      </div>

      {/* Project switcher */}
      {!collapsed && (
        <div className="px-2 pt-2 pb-1 border-b border-gray-100">
          <button
            onClick={() => setProjectOpen(!projectOpen)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left group"
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', activeProject.dot)} />
            <span className="text-gray-600 text-[11px] truncate flex-1 group-hover:text-gray-900">{activeProject.name}</span>
            <ChevronDown className={cn('w-3 h-3 text-gray-300 shrink-0 transition-transform', projectOpen && 'rotate-180')} />
          </button>
          {projectOpen && (
            <div className="mt-1 space-y-0.5 pb-1">
              {projects.map((p) => (
                <button key={p.id} onClick={() => { setActiveProject(p); setProjectOpen(false) }}
                  className={cn('w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[11px] transition-colors',
                    activeProject.id === p.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', p.dot)} />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <Link href="/projects" onClick={() => setProjectOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                  <FolderOpen className="w-3 h-3" />All projects
                </Link>
                <Link href="/projects/generate" onClick={() => setProjectOpen(false)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] text-neon-green hover:bg-neon-green/5 transition-colors">
                  <Sparkles className="w-3 h-3" />AI Generate Project
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="px-2 py-2 border-b border-gray-100">
          <Link href="/projects" className="flex items-center justify-center w-full p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors" title="All Projects">
            <FolderOpen className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4 px-2">
        {nav.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link href={item.href}
                      className={cn('flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors',
                        active ? 'bg-neon-green/10 text-neon-green' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      )}
                      title={collapsed ? item.label : undefined}>
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* CBM status */}
      {!collapsed && (
        <div className="px-3 py-2 mx-2 mb-2 rounded-lg bg-neon-green/5 border border-neon-green/20">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">CBM Engine</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[10px] text-gray-500">Compliance active</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-gray-100 pt-2 space-y-0.5">
        <Link href="/dashboard/help"
          className={cn('flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors',
            pathname === '/dashboard/help' ? 'bg-neon-green/10 text-neon-green' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          )} title={collapsed ? 'Help' : undefined}>
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Help</span>}
        </Link>
        <Link href="/dashboard/settings"
          className={cn('flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors',
            pathname === '/dashboard/settings' ? 'bg-neon-green/10 text-neon-green' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          )} title={collapsed ? 'Settings' : undefined}>
          <Settings className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
