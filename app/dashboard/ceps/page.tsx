'use client'

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Plus, Sparkles, Globe, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SevenW = 'Why' | 'When' | 'Where' | 'While' | 'With Whom' | 'With What' | 'How Feeling'
type Classification = 'cep' | 'competency' | 'secondary'

const SEVEN_W: { key: SevenW; label: string; hint: string; color: string }[] = [
  { key: 'Why',        label: 'Why',         hint: 'Motivations & reasons to buy',               color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { key: 'When',       label: 'When',        hint: 'Occasions, moments & time contexts',          color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { key: 'Where',      label: 'Where',       hint: 'Channels, locations & touchpoints',           color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { key: 'While',      label: 'While',       hint: 'Activities happening simultaneously',         color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'With Whom',  label: 'With Whom',   hint: 'Social context — who else is present',        color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { key: 'With What',  label: 'With What',   hint: 'Complementary products or services',          color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { key: 'How Feeling',label: 'hoW-Feeling', hint: 'Emotional state during purchase/usage',       color: 'text-teal-600 bg-teal-50 border-teal-200' },
]

const allCeps: { id: number; w: SevenW; desc: string; incidence: number; status: 'valid' | 'error' | 'warning'; classification: Classification }[] = [
  { id: 1,  w: 'Why',         desc: 'Trusted for everyday transactions',       incidence: 72, status: 'valid',   classification: 'cep' },
  { id: 2,  w: 'Why',         desc: 'Reliable for large purchases',            incidence: 48, status: 'valid',   classification: 'cep' },
  { id: 3,  w: 'Why',         desc: 'Most reliable card',                       incidence: 0,  status: 'error',   classification: 'cep' },
  { id: 4,  w: 'When',        desc: 'Emergency cash withdrawal',                incidence: 61, status: 'valid',   classification: 'cep' },
  { id: 5,  w: 'When',        desc: 'Payday spending',                          incidence: 55, status: 'valid',   classification: 'cep' },
  { id: 6,  w: 'Where',       desc: 'Accepted everywhere online',               incidence: 68, status: 'valid',   classification: 'cep' },
  { id: 7,  w: 'Where',       desc: 'Available in my city',                     incidence: 80, status: 'valid',   classification: 'cep' },
  { id: 8,  w: 'While',       desc: 'While travelling abroad',                  incidence: 42, status: 'valid',   classification: 'cep' },
  { id: 9,  w: 'While',       desc: 'While shopping for groceries',             incidence: 59, status: 'valid',   classification: 'cep' },
  { id: 10, w: 'With Whom',   desc: 'With family for shared expenses',          incidence: 44, status: 'valid',   classification: 'cep' },
  { id: 11, w: 'With Whom',   desc: 'With colleagues for work expenses',        incidence: 36, status: 'valid',   classification: 'cep' },
  { id: 12, w: 'With What',   desc: 'Paired with mobile banking app',           incidence: 71, status: 'valid',   classification: 'cep' },
  { id: 13, w: 'With What',   desc: 'Used with e-wallet top-up',                incidence: 63, status: 'valid',   classification: 'cep' },
  { id: 14, w: 'How Feeling', desc: 'Feels secure and protected',               incidence: 66, status: 'valid',   classification: 'cep' },
  { id: 15, w: 'How Feeling', desc: 'Feels rewarding and worth it',             incidence: 49, status: 'warning', classification: 'secondary' },
  { id: 16, w: 'Why',         desc: 'Has low annual fees',                      incidence: 52, status: 'valid',   classification: 'competency' },
]

export default function CepBuilderPage() {
  const [activeW, setActiveW] = useState<SevenW>('Why')
  const [showModal, setShowModal] = useState(false)
  const [newDesc, setNewDesc] = useState('')
  const [newW, setNewW] = useState<SevenW>('Why')
  const [newClass, setNewClass] = useState<Classification>('cep')
  const [newIncidence, setNewIncidence] = useState('')

  const visible = allCeps.filter((c) => c.w === activeW)
  const total = allCeps.length
  const cepCount = allCeps.filter(c => c.classification === 'cep' && c.status !== 'error').length
  const compCount = allCeps.filter(c => c.classification === 'competency').length
  const secCount = allCeps.filter(c => c.classification === 'secondary').length
  const cepPct = Math.round((cepCount / total) * 100)
  const compPct = Math.round((compCount / total) * 100)
  const secPct = Math.round((secCount / total) * 100)
  const compositionOk = cepPct >= 60 && cepPct <= 70 && compPct <= 30 && secPct <= 20

  const wConfig = SEVEN_W.find(w => w.key === activeW)!

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Indonesian Credit Cards</p>
          <h1 className="text-gray-900 text-2xl font-bold">CEP Builder</h1>
          <p className="text-gray-400 text-xs mt-1">7W Framework · Category Entry Points</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neon-green/30 bg-neon-green/5 text-neon-green text-xs font-semibold hover:bg-neon-green/10 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate CEPs
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-xs hover:text-gray-700 transition-colors">
            <Globe className="w-3.5 h-3.5" />
            From URL
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add CEP
          </button>
        </div>
      </div>

      {/* Composition meter */}
      <div className={cn(
        'rounded-xl border p-4',
        compositionOk ? 'bg-neon-green/5 border-neon-green/20' : 'bg-red-50 border-red-200'
      )}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Attribute Composition</p>
          {compositionOk
            ? <span className="flex items-center gap-1 text-neon-green text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> CBM Compliant</span>
            : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> Needs Attention</span>}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="bg-neon-green h-full transition-all" style={{ width: `${cepPct}%` }} />
          <div className="bg-blue-400 h-full transition-all" style={{ width: `${compPct}%` }} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${secPct}%` }} />
        </div>
        <div className="flex flex-wrap gap-4 mt-2 text-[11px]">
          <span><span className="text-neon-green font-bold">{cepPct}%</span> <span className="text-gray-400">CEPs (target 60–70%)</span></span>
          <span><span className="text-blue-500 font-bold">{compPct}%</span> <span className="text-gray-400">Competencies (≤30%)</span></span>
          <span><span className="text-amber-500 font-bold">{secPct}%</span> <span className="text-gray-400">Secondary (≤20%)</span></span>
        </div>
      </div>

      {/* Wording error banner */}
      {allCeps.some(c => c.status === 'error') && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-600 text-xs font-semibold mb-1">Wording Violation — Blocked by CBM Engine</p>
            <p className="text-gray-500 text-xs">
              &ldquo;Most reliable card&rdquo; — superlative wording blocked. Wording rule: use &ldquo;reliable card&rdquo;, not &ldquo;most reliable card&rdquo;.
            </p>
          </div>
        </div>
      )}

      {/* 7W Tabs */}
      <div className="flex flex-wrap gap-1">
        {SEVEN_W.map((w) => {
          const count = allCeps.filter(c => c.w === w.key).length
          const hasError = allCeps.some(c => c.w === w.key && c.status === 'error')
          const isActive = activeW === w.key
          return (
            <button
              key={w.key}
              onClick={() => setActiveW(w.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                isActive
                  ? w.color
                  : 'text-gray-400 bg-white border-gray-200 hover:border-gray-300 hover:text-gray-600'
              )}
            >
              {w.label}
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                isActive ? 'bg-black/10' : 'bg-gray-100 text-gray-500'
              )}>
                {count}
              </span>
              {hasError && <AlertTriangle className="w-3 h-3 text-red-500" />}
            </button>
          )
        })}
      </div>

      {/* Active tab header */}
      <div className={cn('rounded-lg border px-4 py-3 flex items-center gap-3', wConfig.color)}>
        <Info className="w-3.5 h-3.5 shrink-0" />
        <div>
          <span className="font-semibold text-xs">{wConfig.key}</span>
          <span className="text-gray-500 text-xs ml-2">— {wConfig.hint}</span>
        </div>
      </div>

      {/* CEP list for active tab */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-400 text-sm">No CEPs in this dimension yet.</p>
            <p className="text-gray-300 text-xs mt-1">Click &ldquo;Add CEP&rdquo; or use the AI Generator.</p>
          </div>
        )}
        {visible.map((cep) => (
          <div
            key={cep.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors group',
              cep.status === 'error'
                ? 'bg-red-50 border-red-200'
                : cep.status === 'warning'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            )}
          >
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
              cep.classification === 'cep' ? 'text-neon-green bg-neon-green/10' :
              cep.classification === 'competency' ? 'text-blue-600 bg-blue-50' :
              'text-amber-600 bg-amber-50'
            )}>
              {cep.classification}
            </span>

            <span className={cn(
              'flex-1 text-xs',
              cep.status === 'error' ? 'text-red-500 line-through opacity-60' : 'text-gray-700'
            )}>
              {cep.desc}
            </span>

            {cep.incidence > 0 && (
              <span className="text-gray-300 text-[11px] shrink-0">{cep.incidence}% incidence</span>
            )}

            {cep.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-neon-green/60 shrink-0" />}
            {cep.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            {cep.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
          </div>
        ))}

        {/* Add row */}
        <button
          onClick={() => { setNewW(activeW); setShowModal(true) }}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-neon-green/40 hover:text-neon-green transition-colors text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add CEP to {activeW}
        </button>
      </div>

      {/* 7W coverage summary */}
      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-3">7W Coverage Summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SEVEN_W.map((w) => {
            const count = allCeps.filter(c => c.w === w.key).length
            return (
              <button
                key={w.key}
                onClick={() => setActiveW(w.key)}
                className={cn(
                  'rounded-lg border p-3 text-center transition-all',
                  activeW === w.key ? w.color : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <p className={cn('text-lg font-bold', activeW === w.key ? '' : 'text-gray-900')}>{count}</p>
                <p className={cn('text-[10px] font-medium mt-0.5', activeW === w.key ? '' : 'text-gray-400')}>
                  {w.label}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add CEP Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 font-bold text-base">Add New CEP</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-wide block mb-1.5">CEP Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Trusted for everyday transactions"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-neon-green/50 placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-wide block mb-1.5">7W Dimension</label>
                <select
                  value={newW}
                  onChange={(e) => setNewW(e.target.value as SevenW)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-neon-green/50 bg-white"
                >
                  {SEVEN_W.map(w => <option key={w.key} value={w.key}>{w.key} — {w.hint}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-wide block mb-1.5">Classification</label>
                <div className="flex gap-2">
                  {(['cep', 'competency', 'secondary'] as Classification[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewClass(c)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all',
                        newClass === c
                          ? c === 'cep' ? 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                          : c === 'competency' ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-wide block mb-1.5">Incidence % (optional)</label>
                <input
                  type="number"
                  value={newIncidence}
                  onChange={(e) => setNewIncidence(e.target.value)}
                  placeholder="e.g. 62"
                  min={0}
                  max={100}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-neon-green/50 placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowModal(false); setNewDesc(''); setNewIncidence('') }}
                className="flex-1 py-2 rounded-lg bg-neon-green text-white text-xs font-bold hover:bg-neon-green/90 transition-colors"
              >
                Add CEP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
