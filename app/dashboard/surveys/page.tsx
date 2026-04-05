'use client'

import { useState } from 'react'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Plus, ExternalLink, Lock, GripVertical, ChevronDown, Upload, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'waves' | 'library' | 'builder' | 'upload'

const QUESTION_BLOCKS = [
  { id: 1,  name: 'Category Screening (Bounded Recall)', purpose: '12mo reference → 3mo target', auto: true,  core: true,  wording: 'In the last 12 months, have you bought any [CATEGORY]? → And in the last 3 months?' },
  { id: 2,  name: 'Category Purchase Frequency',         purpose: 'Times bought in last 3mo',    auto: true,  core: false, wording: 'How many times did you buy [CATEGORY] in the last 3 months?' },
  { id: 3,  name: 'Shopping Channels',                   purpose: 'Multi-select outlets',         auto: false, core: false, wording: 'Where do you usually buy [CATEGORY]? (Select all that apply)' },
  { id: 4,  name: 'Unprompted Awareness + TOM',          purpose: 'Open text, first = TOM',       auto: true,  core: true,  wording: 'When you think of [CATEGORY], which brands come to mind?' },
  { id: 5,  name: 'Prompted Awareness',                  purpose: 'Alphabetical brand list',      auto: true,  core: false, wording: 'Which of these [CATEGORY] brands have you heard of?' },
  { id: 6,  name: 'Brand Penetration',                   purpose: 'Bought in last 3mo',           auto: true,  core: false, wording: 'Which of these brands have you bought in the last 3 months?' },
  { id: 7,  name: 'Brand Buying Weight',                 purpose: 'Times bought per brand',       auto: true,  core: false, wording: 'How many times did you buy [BRAND] in the last 3 months?' },
  { id: 8,  name: 'Brand Acquisition Recency',           purpose: 'Time buckets per brand',       auto: true,  core: false, wording: 'When did you last buy [BRAND]? (Time bucket options)' },
  { id: 9,  name: 'Mental Availability (Brand × CEP)',   purpose: 'Binary pick-any matrix',       auto: true,  core: true,  wording: 'Which of these brands, if any, do you associate with [CEP]? (Binary pick-any, alphabetical)' },
  { id: 10, name: 'IAT (Implicit Association Test)',     purpose: 'Yes/No with reaction time',    auto: false, core: false, wording: 'Optional — captures reaction_time_ms for each brand-attribute pairing.' },
  { id: 11, name: 'Brand Attitude',                      purpose: '6-option scale w/ no opinion', auto: true,  core: false, wording: "Which best describes how you feel about [BRAND]? (Favorite / Prefer / Acceptable / No opinion / Wouldn't buy / Refuse)" },
  { id: 12, name: 'Brand Rejection Follow-up',           purpose: 'Conditional open-text',        auto: true,  core: false, wording: 'You said you would refuse [BRAND]. Can you tell us why?' },
  { id: 13, name: 'Effective Reach',                     purpose: 'De-branded creative + Y/N',    auto: false, core: false, wording: 'Have you seen this advertisement recently? (De-branded creative upload)' },
  { id: 14, name: 'Correct Branding',                    purpose: 'Unprompted brand recall',      auto: true,  core: false, wording: 'Which brand do you think made that advertisement?' },
  { id: 15, name: 'WOM Given (PWOM/NWOM)',               purpose: 'Binary past-month',            auto: true,  core: false, wording: 'In the past month, have you recommended [BRAND]? / Warned others against [BRAND]?' },
  { id: 16, name: 'WOM Received (PWOM/NWOM)',            purpose: 'Binary past-month',            auto: true,  core: false, wording: 'In the past month, has anyone recommended [BRAND] to you? / Warned you against [BRAND]?' },
  { id: 17, name: 'Juster Scale (Purchase Probability)', purpose: '0-10 purchase chance',         auto: false, core: false, wording: 'What is the chance you will buy [BRAND] in the next [TIMEFRAME]? (0 No chance → 10 Certain)' },
]

const BUILDER_BLOCKS = [1, 2, 4, 5, 6, 9, 11, 15]

const surveys = [
  { id: 1, name: 'Credit Card CBM — Q4 2024', status: 'live',     responses: 412, target: 500, created: 'Nov 12, 2024', closes: 'Dec 31, 2024', compliance: 100 },
  { id: 2, name: 'Credit Card CBM — Q3 2024', status: 'complete', responses: 502, target: 500, created: 'Aug 10, 2024', closes: 'Sep 30, 2024', compliance: 100 },
  { id: 3, name: 'Credit Card CBM — Q2 2024', status: 'complete', responses: 497, target: 500, created: 'May 8, 2024',  closes: 'Jun 30, 2024', compliance: 100 },
  { id: 4, name: 'Credit Card CBM — Q1 2025 (Draft)', status: 'draft', responses: 0, target: 500, created: 'Dec 20, 2024', closes: '—', compliance: 87 },
]

const statusConfig = {
  live:     { label: 'Live',     color: 'text-neon-green', bg: 'bg-neon-green/10', icon: CheckCircle2 },
  complete: { label: 'Complete', color: 'text-gray-400',   bg: 'bg-gray-100',       icon: CheckCircle2 },
  draft:    { label: 'Draft',    color: 'text-amber-500',  bg: 'bg-amber-50',       icon: Clock },
}

const mockUploadResults = [
  { question: 'Mental Availability — BCA × Trusted daily', value: 72, wave: 'Q4 2024', type: 'mpen' },
  { question: 'Mental Availability — BCA × Emergency cash', value: 61, wave: 'Q4 2024', type: 'mpen' },
  { question: 'Brand Penetration — BCA', value: 38, wave: 'Q4 2024', type: 'penetration' },
  { question: 'PWOM — BCA', value: 39, wave: 'Q4 2024', type: 'wom' },
  { question: 'NWOM — BCA', value: 6, wave: 'Q4 2024', type: 'wom' },
]

export default function SurveysPage() {
  const [tab, setTab] = useState<Tab>('waves')
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null)
  const [uploadState, setUploadState] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [uploadStep, setUploadStep] = useState(0)

  const steps = ['Parsing file structure…', 'Validating CBM compliance…', 'Computing KPIs…', 'Analysis complete']

  function handleUpload() {
    setUploadState('analyzing')
    setUploadStep(0)
    const interval = setInterval(() => {
      setUploadStep((s) => {
        if (s >= steps.length - 2) {
          clearInterval(interval)
          setUploadState('done')
          return steps.length - 1
        }
        return s + 1
      })
    }, 900)
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Indonesian Credit Cards</p>
          <h1 className="text-gray-900 text-2xl font-bold">Surveys</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Survey Wave
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {([
          { key: 'waves',   label: 'Survey Waves' },
          { key: 'library', label: '17-Block Library' },
          { key: 'builder', label: 'Survey Builder' },
          { key: 'upload',  label: 'Upload Results' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-1.5 rounded-md text-xs font-semibold transition-all',
              tab === t.key ? 'bg-neon-green text-white' : 'text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── WAVES TAB ── */}
      {tab === 'waves' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-900 font-semibold text-sm">CBM Compliance — Q4 2024 Wave</p>
              <span className="text-neon-green text-xs font-bold">87% compliant</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Binary pick-any format only', ok: true },
                { label: 'Alphabetical brand ordering', ok: true },
                { label: 'No Likert / numeric scales', ok: true },
                { label: 'Category buyer screener present', ok: true },
                { label: 'Bounded recall sequence (12mo → target)', ok: true },
                { label: 'Attribute composition 60-70% CEPs', ok: true },
                { label: 'Wording linter passed', ok: false },
                { label: 'Non-buyer sample ≥30%', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-neon-green shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                  <span className={item.ok ? 'text-gray-500' : 'text-red-500'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {surveys.map((s) => {
            const cfg = statusConfig[s.status as keyof typeof statusConfig]
            const Icon = cfg.icon
            const pct = Math.round((s.responses / s.target) * 100)
            return (
              <div key={s.id} className="rounded-xl bg-white border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-gray-900 text-sm font-semibold">{s.name}</span>
                    <span className={cn('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', cfg.color, cfg.bg)}>
                      <Icon className="w-2.5 h-2.5" />{cfg.label}
                    </span>
                  </div>
                  {s.status === 'live' && (
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />View Live
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-6 text-xs text-gray-400 mb-3">
                  <span>Created {s.created}</span>
                  <span>Closes {s.closes}</span>
                  <span>Compliance: <span className={s.compliance === 100 ? 'text-neon-green' : 'text-amber-500'}>{s.compliance}%</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', s.status === 'complete' ? 'bg-gray-300' : 'bg-neon-green')}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{s.responses.toLocaleString()} / {s.target}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── LIBRARY TAB ── */}
      {tab === 'library' && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 mb-2">
            <span className="text-neon-green mt-0.5 shrink-0"><Lock className="w-4 h-4" /></span>
            <p className="text-xs text-gray-500 leading-relaxed">
              These 17 question blocks are <span className="text-gray-700 font-semibold">locked to CBM methodology</span>. Wording and format cannot be changed in ways that break compliance. Core blocks (highlighted) are required for every CBM survey.
            </p>
          </div>

          {QUESTION_BLOCKS.map((block) => {
            const isExpanded = expandedBlock === block.id
            return (
              <div
                key={block.id}
                className={cn(
                  'rounded-xl border transition-all',
                  block.core ? 'border-neon-green/20 bg-neon-green/[0.02]' : 'border-gray-200 bg-white'
                )}
              >
                <button
                  onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                >
                  <span className="text-gray-300 text-xs font-mono w-5 shrink-0">{String(block.id).padStart(2, '0')}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-900 text-sm font-semibold">{block.name}</span>
                      {block.core && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-neon-green bg-neon-green/10 uppercase tracking-wide">Core</span>
                      )}
                      {block.auto && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-400 bg-gray-100 uppercase tracking-wide">Auto-generate</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{block.purpose}</p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-gray-300 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-100 pt-4 ml-8">
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Sample Wording</p>
                    <p className="text-gray-500 text-xs leading-relaxed italic">&ldquo;{block.wording}&rdquo;</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">Binary pick-any format</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-400">Alphabetical order</span>
                      {block.core && <span className="text-[10px] px-2 py-0.5 rounded-full border border-neon-green/20 text-neon-green/70">Required</span>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── BUILDER TAB ── */}
      {tab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Question Library</p>
            <div className="space-y-1.5">
              {QUESTION_BLOCKS.map((block) => (
                <div
                  key={block.id}
                  draggable
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 bg-white hover:border-neon-green/30 hover:bg-neon-green/[0.02] transition-all cursor-grab active:cursor-grabbing group"
                >
                  <GripVertical className="w-3 h-3 text-gray-200 group-hover:text-neon-green/40 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-gray-600 text-xs font-medium truncate group-hover:text-gray-900">
                      <span className="text-gray-300 mr-1.5 font-mono">{String(block.id).padStart(2, '0')}</span>
                      {block.name}
                    </p>
                  </div>
                  {block.core && <span className="text-[9px] text-neon-green font-bold ml-auto shrink-0">CORE</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Survey Canvas — Q1 2025</p>
              <span className="text-neon-green text-xs font-semibold">{BUILDER_BLOCKS.length} blocks</span>
            </div>
            <div className="space-y-2">
              {BUILDER_BLOCKS.map((id, idx) => {
                const block = QUESTION_BLOCKS.find(b => b.id === id)!
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border',
                      block.core ? 'border-neon-green/20 bg-neon-green/[0.02]' : 'border-gray-200 bg-white'
                    )}
                  >
                    <span className="text-gray-300 text-xs font-mono shrink-0">{idx + 1}</span>
                    <GripVertical className="w-3.5 h-3.5 text-gray-200 cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs font-semibold">{block.name}</p>
                      <p className="text-gray-400 text-[11px]">{block.purpose}</p>
                    </div>
                    {block.core
                      ? <span title="Core block — required"><Lock className="w-3 h-3 text-neon-green/40 shrink-0" /></span>
                      : <button className="text-gray-300 hover:text-red-400 transition-colors text-xs shrink-0">✕</button>
                    }
                  </div>
                )
              })}

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 text-gray-400 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Drag a block here to add it
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button className="flex-1 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
                Save & Launch Survey
              </button>
              <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 transition-colors">
                Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPLOAD RESULTS TAB ── */}
      {tab === 'upload' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-gray-900 font-semibold text-sm mb-1">Upload Survey Result</p>
            <p className="text-gray-400 text-xs mb-4">Upload your raw survey data (.xlsx, .csv). The AI will validate CBM compliance and compute KPIs automatically.</p>

            {uploadState === 'idle' && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-neon-green/30 transition-colors">
                <Upload className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-1">Drop your file here or click to browse</p>
                <p className="text-gray-300 text-xs mb-4">Supports .xlsx, .csv · Max 50MB</p>
                <button
                  onClick={handleUpload}
                  className="px-5 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
                >
                  Upload & Analyze
                </button>
              </div>
            )}

            {uploadState === 'analyzing' && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-4 h-4 text-neon-green animate-pulse" />
                  <p className="text-gray-700 text-sm font-semibold">AI Analysis in Progress</p>
                </div>
                <div className="space-y-2">
                  {steps.slice(0, -1).map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      {i < uploadStep
                        ? <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
                        : i === uploadStep
                        ? <div className="w-4 h-4 rounded-full border-2 border-neon-green border-t-transparent animate-spin shrink-0" />
                        : <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                      <span className={cn('text-xs', i <= uploadStep ? 'text-gray-700' : 'text-gray-300')}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadState === 'done' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  <p className="text-sm text-gray-700 font-semibold">Analysis complete — 500 responses · CBM compliant · Q4 2024</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Extracted KPIs</p>
                  <div className="space-y-2">
                    {mockUploadResults.map((r, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
                        <div>
                          <p className="text-xs text-gray-700 font-medium">{r.question}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{r.wave} · {r.type}</p>
                        </div>
                        <span className="text-neon-green font-bold text-sm">{r.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-4">
                  <p className="text-xs text-neon-green font-bold uppercase tracking-widest mb-2">AI Insights</p>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    <li className="flex gap-2"><span className="text-neon-green font-bold shrink-0">1.</span>BCA mental availability strong at 72% for &ldquo;Trusted daily use&rdquo; — above category average.</li>
                    <li className="flex gap-2"><span className="text-neon-green font-bold shrink-0">2.</span>PWOM 39 vs NWOM 6 — healthy ratio. Maintain social proof strategy.</li>
                    <li className="flex gap-2"><span className="text-neon-green font-bold shrink-0">3.</span>Emergency cash CEP at 61% — opportunity to push in &ldquo;When&rdquo; dimension.</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors">
                    Import to Dashboard
                  </button>
                  <button
                    onClick={() => setUploadState('idle')}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-gray-700 transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
