import Link from 'next/link'
import { ArrowRight, BarChart3, Brain, Target, FileText } from 'lucide-react'

const features = [
  { icon: Target, label: 'CEP Builder', desc: '7W framework with live composition & wording validation' },
  { icon: BarChart3, label: 'Brand KPIs', desc: 'MPen · MMS · NS · SoM — DJ-normalized competitive view' },
  { icon: Brain, label: 'Mental Advantage', desc: 'Heatmap of brand × CEP deviations with DEFEND/BUILD actions' },
  { icon: FileText, label: 'Exportable Reports', desc: 'PDF & PPTX exports, raw data, compliance reports' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-neon-green flex items-center justify-center">
            <span className="text-white font-black text-xs">F</span>
          </div>
          <span className="text-gray-900 font-bold text-sm">Fortuna</span>
          <span className="text-gray-300 text-sm">by Prima Hanura Akbar</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
        >
          Open Dashboard
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/5">
          <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-neon-green text-[11px] font-semibold tracking-widest uppercase">
            CBM-Compliant · Science-Based
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight max-w-3xl">
          Brand Health,<br />
          <span className="text-neon-green">Properly Done.</span>
        </h1>

        <p className="mt-6 text-lg text-gray-500 max-w-xl leading-relaxed">
          Fortuna is a CBM-compliant brand health platform built by Prima Hanura Akbar &mdash;
          on Ehrenberg-Bass principles. Mental availability, physical availability, and Double
          Jeopardy normalization, in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-white font-bold hover:bg-neon-green/90 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/mental-advantage"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            View Mental Map
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border-t border-gray-100">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.label} className="bg-white p-6 flex flex-col gap-3">
              <Icon className="w-5 h-5 text-neon-green" />
              <p className="text-gray-900 font-semibold text-sm">{f.label}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-gray-300 text-xs">
          &copy; 2025 Prima Hanura Akbar · Fortuna Brand Health Platform
        </p>
        <p className="text-gray-200 text-xs">CBM · Science-Based Brand Tracking · Better Brand Health</p>
      </div>
    </main>
  )
}
