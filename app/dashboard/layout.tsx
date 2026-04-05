import { Sidebar } from '@/components/sidebar'
import { SegmentProvider } from '@/contexts/segment-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SegmentProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </SegmentProvider>
  )
}
