import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type DiagnosisType = 'mental' | 'physical' | 'balanced'

interface GapDiagnosisCardProps {
  brand: string; mms: number; sms: number; diagnosis: DiagnosisType
}

const diagnosisConfig = {
  mental:   { label: 'Mental Availability Problem',  color: 'text-red-500',    bg: 'bg-red-50',        border: 'border-red-200',      icon: AlertTriangle,  action: 'Increase CEP reach & network score. Audit creative consistency.' },
  physical: { label: 'Physical Availability Problem', color: 'text-amber-500',  bg: 'bg-amber-50',      border: 'border-amber-200',    icon: Info,           action: 'Expand distribution footprint. Audit presence & prominence.' },
  balanced: { label: 'Balanced Availability',         color: 'text-neon-green', bg: 'bg-neon-green/5',  border: 'border-neon-green/20',icon: CheckCircle2,   action: 'Maintain current trajectory. Monitor for divergence.' },
}

export function GapDiagnosisCard({ brand, mms, sms, diagnosis }: GapDiagnosisCardProps) {
  const cfg = diagnosisConfig[diagnosis]
  const Icon = cfg.icon
  const gap = mms - sms
  return (
    <div className={cn('rounded-xl border p-4 flex flex-col gap-3 bg-white', cfg.bg, cfg.border)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4 shrink-0', cfg.color)} />
        <p className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</p>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div><p className="text-gray-400 uppercase tracking-wide text-[10px]">Brand</p><p className="text-gray-900 font-semibold">{brand}</p></div>
        <div><p className="text-gray-400 uppercase tracking-wide text-[10px]">MMS</p><p className="text-gray-900 font-semibold">{mms}%</p></div>
        <div><p className="text-gray-400 uppercase tracking-wide text-[10px]">SMS</p><p className="text-gray-900 font-semibold">{sms}%</p></div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px]">Gap</p>
          <p className={cn('font-semibold', gap > 0 ? 'text-neon-green' : 'text-red-500')}>{gap > 0 ? '+' : ''}{gap}pp</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">{cfg.action}</p>
    </div>
  )
}
