import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  delta?: number
  deltaLabel?: string
  description: string
  highlight?: boolean
}

export function KpiCard({ label, value, unit, delta, deltaLabel, description, highlight }: KpiCardProps) {
  const positive = delta !== undefined && delta > 0
  const negative = delta !== undefined && delta < 0

  return (
    <div className={cn('rounded-xl border p-5 flex flex-col gap-3 bg-white',
      highlight ? 'border-neon-green/30 bg-neon-green/5' : 'border-gray-200'
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{label}</p>
        {delta !== undefined && (
          <span className={cn('flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
            positive ? 'text-neon-green bg-neon-green/10' :
            negative ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-100'
          )}>
            {positive && <TrendingUp className="w-3 h-3" />}
            {negative && <TrendingDown className="w-3 h-3" />}
            {!positive && !negative && <Minus className="w-3 h-3" />}
            {delta > 0 ? '+' : ''}{delta}pp
          </span>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className={cn('text-4xl font-bold', highlight ? 'text-neon-green' : 'text-gray-900')}>{value}</span>
        {unit && <span className="text-gray-400 text-sm mb-1">{unit}</span>}
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      {deltaLabel && <p className="text-[10px] text-gray-300 uppercase tracking-wide">vs {deltaLabel}</p>}
    </div>
  )
}
