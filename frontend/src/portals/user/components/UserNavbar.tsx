import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, User, LogOut, Map, Star, Users } from 'lucide-react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { useState } from 'react'

const navItems = [
  { to: '/app/search',        icon: Search,   label: 'Explore' },
  { to: '/app/map',           icon: Map,      label: 'Map' },
  { to: '/app/bookings',      icon: BookOpen, label: 'Bookings' },
  { to: '/app/group-booking', icon: Users,    label: 'Groups' },
  { to: '/app/loyalty',       icon: Star,     label: 'Rewards' },
  { to: '/app/profile',       icon: User,     label: 'Profile' },
]

export default function UserNavbar() {
  const { logout, fullName } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-noir-950/90 dark:bg-noir-950/90 light:bg-white/90 backdrop-blur-md border-b border-white/[0.06] dark:border-white/[0.06] light:border-gold-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/app/search" className="flex items-center gap-2">
            <span className="font-display text-2xl text-gold-300 dark:text-gold-300 light:text-gold-600 italic tracking-widest">Aurum</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `
                flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-sans transition-all
                ${isActive
                  ? 'text-gold-300 dark:text-gold-300 light:text-gold-700 bg-gold-600/10 dark:bg-gold-600/10 light:bg-gold-100/50 border border-gold-600/15 dark:border-gold-600/15 light:border-gold-400'
                  : 'text-noir-400 dark:text-noir-400 light:text-noir-600 hover:text-noir-200 dark:hover:text-noir-200 light:hover:text-noir-700 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] light:hover:bg-gold-50 border border-transparent'}
              `}>
                <Icon size={13} />{label}
              </NavLink>
            ))}

            {/* User / logout */}
            <div className="ml-3 pl-3 border-l border-white/10 dark:border-white/10 light:border-gold-200 flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-gold-600/15 dark:bg-gold-600/15 light:bg-gold-100 border border-gold-600/20 dark:border-gold-600/20 light:border-gold-400 flex items-center justify-center">
                  <span className="text-gold-400 dark:text-gold-400 light:text-gold-600 font-display text-xs">{fullName?.[0]?.toUpperCase() ?? '?'}</span>
                </div>
                <span className="text-xs text-noir-500 dark:text-noir-500 light:text-noir-700 font-sans max-w-[120px] truncate">{fullName}</span>
              </div>
              <button onClick={logout} title="Sign out"
                className="p-2 text-noir-600 dark:text-noir-600 light:text-noir-700 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 transition-colors rounded-sm hover:bg-red-950/20 dark:hover:bg-red-950/20 light:hover:bg-red-100">
                <LogOut size={14} />
              </button>
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button className="md:hidden text-noir-400 dark:text-noir-400 light:text-noir-600 hover:text-gold-400 dark:hover:text-gold-400 light:hover:text-gold-600 p-2 transition-colors"
            onClick={() => setMobileOpen(o => !o)}>
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1" />
            <div className="w-5 h-0.5 bg-current" />
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/8 dark:border-white/8 light:border-gold-200 bg-noir-950/95 dark:bg-noir-950/95 light:bg-white overflow-hidden">
              <nav className="px-4 py-3 flex flex-col gap-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm font-sans transition-all
                      ${isActive ? 'text-gold-300 dark:text-gold-300 light:text-gold-700 bg-gold-600/10 dark:bg-gold-600/10 light:bg-gold-100/50' : 'text-noir-400 dark:text-noir-400 light:text-noir-600 hover:text-noir-200 dark:hover:text-noir-200 light:hover:text-noir-700'}
                    `}>
                    <Icon size={14} />{label}
                  </NavLink>
                ))}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <ThemeToggle />
                </div>
                <button onClick={logout}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 dark:text-red-400 light:text-red-600 font-sans mt-1">
                  <LogOut size={14} /> Sign out
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-px bg-gradient-to-r from-transparent via-gold-600/15 dark:via-gold-600/15 light:via-gold-600/30 to-transparent" />
    </>
  )
}