import { ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const GUARDRAILS = [
  'No Likert or rating scales',
  'No modified attribute wording (most / best / more)',
  'Brands always ordered alphabetically',
  'CBM formulas are frozen and cannot be modified',
  'Surveys require compliance check before launch',
  'Non-buyers + light buyers are the primary analysis segment',
]

export function CbmGuardrailBanner({ compact, className }: { compact?: boolean; className?: string }) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-[11px] text-gray-400', className)}>
        <ShieldCheck className="w-3.5 h-3.5 text-neon-green shrink-0" />
        <span>CBM Engine active — methodology compliance enforced</span>
      </div>
    )
  }
  return (
    <div className={cn('rounded-xl border border-neon-green/20 bg-neon-green/5 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-neon-green shrink-0" />
        <p className="text-neon-green text-xs font-bold uppercase tracking-widest">CBM Anti-Hallucination Guardrails</p>
        <span className="ml-auto text-[10px] text-neon-green/60 font-semibold uppercase tracking-wide">Always On</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {GUARDRAILS.map((g) => (
          <div key={g} className="flex items-start gap-2 text-xs text-gray-500">
            <X className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />{g}
          </div>
        ))}
      </div>
    </div>
  )
}
