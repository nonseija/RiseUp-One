'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import Sidebar from './sidebar'
import Topbar from './topbar'

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isLoading, user } = useUser()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#29d9d5]">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-white"
        />
      </div>
    )
  }

  if (!user) {
    router.replace('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#e8fffe]">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <Topbar onMenuToggle={() => setIsMobileOpen((v) => !v)} />
      {/* Main content — offset by sidebar width on desktop */}
      <main className="pt-16 lg:pl-60">
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </div>
  )
}
