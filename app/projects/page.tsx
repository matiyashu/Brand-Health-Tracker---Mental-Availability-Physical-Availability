import Link from 'next/link'
import { Plus, Sparkles, Archive, Search } from 'lucide-react'
import { ProjectCard, type Project } from '@/components/project-card'

const projects: Project[] = [
  {
    id: 'idn-cc-2024',
    name: 'Indonesian Credit Cards — 2024 Tracker',
    category: 'Credit Cards',
    geography: 'Indonesia (National)',
    brands: 5,
    ceps: 15,
    waves: 4,
    lastWave: 'Q4 2024',
    status: 'active',
    mpen: 62,
    compliance: 100,
  },
  {
    id: 'idn-coffee-2024',
    name: 'Coffee Shop Category — Jakarta',
    category: 'Coffee Shops',
    geography: 'Jakarta',
    brands: 6,
    ceps: 18,
    waves: 2,
    lastWave: 'Q3 2024',
    status: 'active',
    mpen: 48,
    compliance: 100,
  },
  {
    id: 'idn-insurance-2024',
    name: 'Health Insurance — National Tracker',
    category: 'Health Insurance',
    geography: 'Indonesia (National)',
    brands: 7,
    ceps: 22,
    waves: 3,
    lastWave: 'Q4 2024',
    status: 'active',
    mpen: 54,
    compliance: 100,
  },
  {
    id: 'idn-ridehail-draft',
    name: 'Ride-Hailing Perception Study',
    category: 'Ride-Hailing',
    geography: 'Indonesia (National)',
    brands: 4,
    ceps: 0,
    waves: 0,
    lastWave: '—',
    status: 'draft',
    compliance: 0,
  },
  {
    id: 'demo-cc',
    name: '[Demo] Credit Cards — AI Generated',
    category: 'Credit Cards',
    geography: 'Indonesia (National)',
    brands: 5,
    ceps: 25,
    waves: 1,
    lastWave: 'Q4 2024',
    status: 'active',
    isDemo: true,
    mpen: 55,
    compliance: 100,
  },
  {
    id: 'template-fmcg',
    name: 'FMCG Category Tracker — Starter Template',
    category: 'FMCG',
    geography: 'Indonesia',
    brands: 5,
    ceps: 20,
    waves: 0,
    lastWave: '—',
    status: 'draft',
    isTemplate: true,
    compliance: 87,
  },
  {
    id: 'idn-telecom-archived',
    name: 'Telco Perception Study 2023',
    category: 'Telecommunications',
    geography: 'Indonesia (National)',
    brands: 5,
    ceps: 14,
    waves: 3,
    lastWave: 'Q4 2023',
    status: 'archived',
    mpen: 71,
    compliance: 100,
  },
]

export default function ProjectsPage() {
  const active = projects.filter((p) => p.status === 'active')
  const drafts = projects.filter((p) => p.status === 'draft')
  const archived = projects.filter((p) => p.status === 'archived')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-neon-green flex items-center justify-center">
            <span className="text-white font-black text-xs">F</span>
          </div>
          <span className="text-gray-900 font-bold text-sm">Fortuna</span>
          <span className="text-gray-300 text-sm">by Prima Hanura Akbar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              type="text"
              placeholder="Search projects…"
              className="w-48 bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-neon-green/40"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-gray-900 text-3xl font-bold">Projects</h1>
            <p className="text-gray-400 text-sm mt-1">
              {active.length} active · {drafts.length} draft · {archived.length} archived
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/projects/generate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neon-green/30 bg-neon-green/5 text-neon-green text-xs font-semibold hover:bg-neon-green/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Generate Project
            </Link>
            <Link
              href="/projects/generate"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Link>
          </div>
        </div>

        {/* CBM reminder */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <span className="text-neon-green text-lg mt-0.5">∴</span>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">CBM Mantra</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
              <span>1. Design for the Category</span>
              <span>2. Analyze for the Buyer</span>
              <span>3. Report for the Brand</span>
            </div>
          </div>
        </div>

        {/* Active projects */}
        {active.length > 0 && (
          <section>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
              Active ({active.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <section>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
              Drafts & Templates ({drafts.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Archive className="w-3.5 h-3.5 text-gray-300" />
              <p className="text-gray-300 text-xs uppercase tracking-widest font-semibold">
                Archived ({archived.length})
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {archived.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
