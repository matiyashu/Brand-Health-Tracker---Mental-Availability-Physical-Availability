'use client'

import { cn } from '@/lib/utils'
import { useSegment, type Segment } from '@/contexts/segment-context'

const segments: { value: Segment; label: string }[] = [
  { value: 'non-light', label: 'Non-buyers + Light' },
  { value: 'heavy',     label: 'Heavy Buyers' },
  { value: 'overall',   label: 'Overall' },
]

export function SegmentToggle() {
  const { segment, setSegment } = useSegment()
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {segments.map((s) => (
        <button key={s.value} onClick={() => setSegment(s.value)}
          className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            segment === s.value ? 'bg-neon-green text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
          )}>
          {s.label}
          {s.value === 'non-light' && <span className="ml-1 text-[9px] opacity-60 uppercase tracking-wide">default</span>}
        </button>
      ))}
    </div>
  )
}
