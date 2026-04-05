'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Globe, Building2, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Mode = 'a' | 'b'
type Step = 'input' | 'generating' | 'review'

const generatedCeps = [
  { id: 1, w: 'Why', desc: 'Trusted for everyday transactions', score3c: 92, accepted: true },
  { id: 2, w: 'Why', desc: 'Reliable when I need emergency cash', score3c: 88, accepted: true },
  { id: 3, w: 'When', desc: 'When shopping online', score3c: 85, accepted: true },
  { id: 4, w: 'When', desc: 'On payday for big purchases', score3c: 79, accepted: null },
  { id: 5, w: 'Where', desc: 'Accepted everywhere I shop', score3c: 91, accepted: true },
  { id: 6, w: 'Where', desc: 'Available at all ATMs nationwide', score3c: 76, accepted: null },
  { id: 7, w: 'While', desc: 'While travelling internationally', score3c: 83, accepted: true },
  { id: 8, w: 'While', desc: 'While dining out with family', score3c: 71, accepted: null },
  { id: 9, w: 'With Whom', desc: 'With family for shared household spending', score3c: 68, accepted: null },
  { id: 10, w: 'With What', desc: 'Paired with my mobile banking app', score3c: 87, accepted: true },
]

const wColors: Record<string, string> = {
  'Why': 'text-violet-600 bg-violet-50',
  'When': 'text-blue-600 bg-blue-50',
  'Where': 'text-sky-600 bg-sky-50',
  'While': 'text-amber-600 bg-amber-50',
  'With Whom': 'text-pink-600 bg-pink-50',
  'With What': 'text-orange-600 bg-orange-50',
  'How Feeling': 'text-teal-600 bg-teal-50',
}

export default function GenerateProjectPage() {
  const [mode, setMode] = useState<Mode>('a')
  const [step, setStep] = useState<Step>('input')
  const [cepStates, setCepStates] = useState<Record<number, boolean | null>>(
    Object.fromEntries(generatedCeps.map((c) => [c.id, c.accepted]))
  )

  const accepted = Object.values(cepStates).filter(Boolean).length
  const cepPct = Math.round((accepted / generatedCeps.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-8 py-4 flex items-center gap-4">
        <Link href="/projects" className="text-gray-300 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-green" />
          <span className="text-gray-900 font-semibold text-sm">AI Project Generator</span>
        </div>
        <span className="text-gray-300 text-xs ml-auto">Powered by Claude Sonnet 4</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        {/* Mode selector */}
        {step === 'input' && (
          <>
            <div>
              <h1 className="text-gray-900 text-2xl font-bold mb-1">Generate a Project</h1>
              <p className="text-gray-400 text-sm">
                Claude will create a full CBM project — 25 CEPs, brands, and 200 synthetic respondents.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('a')}
                className={cn(
                  'rounded-xl border p-5 text-left transition-all',
                  mode === 'a'
                    ? 'border-neon-green/30 bg-neon-green/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <Building2 className={cn('w-5 h-5 mb-3', mode === 'a' ? 'text-neon-green' : 'text-gray-300')} />
                <p className={cn('font-semibold text-sm mb-1', mode === 'a' ? 'text-gray-900' : 'text-gray-500')}>
                  Mode A — Business Info
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Enter business name, category, and geography. Claude generates CEPs from scratch.
                </p>
              </button>
              <button
                onClick={() => setMode('b')}
                className={cn(
                  'rounded-xl border p-5 text-left transition-all',
                  mode === 'b'
                    ? 'border-neon-green/30 bg-neon-green/5'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <Globe className={cn('w-5 h-5 mb-3', mode === 'b' ? 'text-neon-green' : 'text-gray-300')} />
                <p className={cn('font-semibold text-sm mb-1', mode === 'b' ? 'text-gray-900' : 'text-gray-500')}>
                  Mode B — Website Scraping
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Paste a business URL. We scrape homepage + about + products, then Claude maps CEPs.
                </p>
              </button>
            </div>

            {/* Form */}
            {mode === 'a' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bank Central Asia"
                      defaultValue="Bank Central Asia"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-neon-green/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Credit Cards"
                      defaultValue="Credit Cards"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-neon-green/40"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">Geography</label>
                    <input
                      type="text"
                      placeholder="e.g. Indonesia (National)"
                      defaultValue="Indonesia (National)"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-300 focus:outline-none focus:border-neon-green/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">No. of Competitor Brands</label>
                    <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:border-neon-green/40">
                      <option value="5">5 brands</option>
                      <option value="6">6 brands</option>
                      <option value="8">8 brands</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">Competitive Context (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any known brand positions, recent campaigns, or market context…"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:border-neon-green/40 resize-none"
                  />
                </div>
              </div>
            )}

            {mode === 'b' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-gray-400 uppercase tracking-wide block mb-1.5">Business URL</label>
                  <input
                    type="url"
                    placeholder="https://www.bca.co.id"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:border-neon-green/40"
                  />
                  <p className="text-gray-300 text-xs mt-1.5">
                    We will scrape homepage, /about, and /products pages using Cheerio + Playwright.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Scraper will extract</p>
                  {['Brand positioning & stated benefits', 'Target use situations', 'Tone and messaging angles', 'Product/service categories'].map((i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-neon-green shrink-0" />
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What gets generated */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">What Claude will generate</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
                {[
                  '25 CEPs mapped to 7W framework',
                  '5-8 brands (alphabetized + size-tagged)',
                  '200 synthetic respondents',
                  'Double Jeopardy-compliant linkages',
                  'Buyer segments: 60% non / 25% light / 15% heavy',
                  'Realistic reaction times (IAT)',
                  'PWOM/NWOM ratios',
                  'Goldilocks timeframe auto-selected',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-neon-green mt-0.5">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('generating')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-white font-bold hover:bg-neon-green/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Generate Project with AI
            </button>
          </>
        )}

        {/* Generating state */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-neon-green/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-neon-green" />
              </div>
              <Loader2 className="absolute inset-0 w-16 h-16 text-neon-green animate-spin" />
            </div>
            <div className="text-center space-y-1.5">
              <p className="text-gray-900 font-semibold">Claude is generating your project…</p>
              <p className="text-gray-400 text-sm">Mapping CEPs to 7W · Building brand list · Generating respondents</p>
            </div>
            <div className="w-64 space-y-2">
              {[
                { label: 'Category definition', done: true },
                { label: 'CEP mapping (7W framework)', done: true },
                { label: 'Brand list + size tagging', done: true },
                { label: 'Synthetic respondents (200)', done: false },
                { label: 'Linkage matrix (DJ-compliant)', done: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  {s.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shrink-0" />
                    : <Loader2 className="w-3.5 h-3.5 text-gray-300 animate-spin shrink-0" />}
                  <span className={s.done ? 'text-gray-600' : 'text-gray-300'}>{s.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('review')}
              className="text-xs text-neon-green underline underline-offset-4"
            >
              Skip to review (demo)
            </button>
          </div>
        )}

        {/* Review CEPs */}
        {step === 'review' && (
          <>
            <div>
              <h2 className="text-gray-900 text-xl font-bold mb-1">Review Generated CEPs</h2>
              <p className="text-gray-400 text-sm">
                Accept, edit, or reject each CEP. Accepted CEPs will be saved to your project.
              </p>
            </div>

            {/* Composition meter */}
            <div className={cn(
              'rounded-xl border p-4',
              cepPct >= 60 && cepPct <= 70 ? 'border-neon-green/20 bg-neon-green/5' : 'border-amber-300 bg-amber-50'
            )}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">CEP Acceptance</p>
                <span className={cn('text-xs font-bold', cepPct >= 60 ? 'text-neon-green' : 'text-amber-500')}>
                  {accepted} / {generatedCeps.length} accepted ({cepPct}%)
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-neon-green rounded-full transition-all" style={{ width: `${cepPct}%` }} />
              </div>
              <p className="text-gray-300 text-[11px] mt-1.5">Target: accept 60-70% for CBM compliance</p>
            </div>

            {/* CEP list */}
            <div className="space-y-2">
              {generatedCeps.map((cep) => {
                const state = cepStates[cep.id]
                return (
                  <div
                    key={cep.id}
                    className={cn(
                      'rounded-lg border px-4 py-3 flex items-center gap-3 transition-all',
                      state === true ? 'border-neon-green/20 bg-neon-green/5' :
                      state === false ? 'border-red-200 bg-red-50 opacity-50' :
                      'border-gray-200 bg-white'
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0', wColors[cep.w] ?? 'text-gray-400 bg-gray-100')}>
                      {cep.w}
                    </span>
                    <span className="flex-1 text-xs text-gray-700">{cep.desc}</span>
                    <span className="text-gray-300 text-[11px] shrink-0">3C: {cep.score3c}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setCepStates((s) => ({ ...s, [cep.id]: true }))}
                        className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors',
                          state === true ? 'bg-neon-green text-white' : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/10'
                        )}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setCepStates((s) => ({ ...s, [cep.id]: false }))}
                        className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors',
                          state === false ? 'bg-red-100 text-red-500' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        )}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <Link
                href="/projects"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-white font-bold hover:bg-neon-green/90 transition-colors"
              >
                Save Project ({accepted} CEPs accepted)
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
