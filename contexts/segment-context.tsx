'use client'

import { createContext, useContext, useState } from 'react'

export type Segment = 'non-light' | 'heavy' | 'overall'

interface SegmentContextType {
  segment: Segment
  setSegment: (s: Segment) => void
}

const SegmentContext = createContext<SegmentContextType>({
  segment: 'non-light',
  setSegment: () => {},
})

export function SegmentProvider({ children }: { children: React.ReactNode }) {
  const [segment, setSegment] = useState<Segment>('non-light')
  return (
    <SegmentContext.Provider value={{ segment, setSegment }}>
      {children}
    </SegmentContext.Provider>
  )
}

export function useSegment() {
  return useContext(SegmentContext)
}
