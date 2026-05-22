import { useState, ReactNode } from 'react'
import HotelSidebar from './components/HotelSidebar'
import { useAuth } from '../../shared/hooks/useAuth'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

export default function HotelLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, fullName } = useAuth()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-noir-950 flex">
      <HotelSidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(c => !c)}
        fullName={fullName ?? undefined}
        onLogout={logout}
      />

      <main className="flex-1 min-h-screen overflow-auto">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-noir-950/80 backdrop-blur-md border-b border-gold-200 dark:border-white/[0.05] px-8 py-4 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-gold-600/10 to-transparent" />
            <p className="text-[10px] uppercase tracking-[0.15em] text-noir-700 dark:text-noir-600 font-sans">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <ThemeToggle />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
