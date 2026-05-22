import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building, BedDouble, BookOpen, TrendingUp, LogOut,
  ChevronRight, Menu, Calendar, CalendarOff, Image,
  Tag, MessageSquare, Clock
} from 'lucide-react'

const navGroups = [
  {
    label: 'Property',
    items: [
      { to: '/hotel/registration', icon: Building,     label: 'My Hotel' },
      { to: '/hotel/rooms',        icon: BedDouble,    label: 'Rooms' },
      { to: '/hotel/photos',       icon: Image,        label: 'Photos' },
    ],
  },
  {
    label: 'Pricing',
    items: [
      { to: '/hotel/pricing',      icon: Tag,          label: 'Dynamic Pricing' },
      { to: '/hotel/blackouts',    icon: CalendarOff,  label: 'Blackout Dates' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/hotel/bookings',     icon: BookOpen,     label: 'Bookings' },
      { to: '/hotel/calendar',     icon: Calendar,     label: 'Calendar' },
      { to: '/hotel/today',        icon: Clock,        label: 'Today' },
      { to: '/hotel/messaging',    icon: MessageSquare, label: 'Messaging' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/hotel/revenue',      icon: TrendingUp,   label: 'Revenue' },
    ],
  },
]

interface Props {
  collapsed: boolean
  onCollapse: () => void
  fullName?: string
  onLogout: () => void
}

export default function HotelSidebar({ collapsed, onCollapse, fullName, onLogout }: Props) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex-shrink-0 bg-obsidian-950 dark:bg-obsidian-950 light:bg-white border-r border-white/[0.06] dark:border-white/[0.06] light:border-gold-200 flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] dark:border-white/[0.06] light:border-gold-200">
        <div className="w-8 h-8 flex-shrink-0 rounded-sm bg-gold-600/15 dark:bg-gold-600/15 light:bg-gold-100 border border-gold-500/20 dark:border-gold-500/20 light:border-gold-400 flex items-center justify-center">
          <span className="text-gold-400 dark:text-gold-400 light:text-gold-600 font-display text-base">A</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="font-display text-gold-300 dark:text-gold-300 light:text-gold-600 text-lg tracking-widest italic whitespace-nowrap">
              Aurum
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/[0.04] dark:border-white/[0.04] light:border-gold-200">
          <p className="text-[9px] uppercase tracking-[0.15em] text-noir-600 dark:text-noir-600 light:text-noir-700 font-sans">Hotel Manager</p>
          {fullName && <p className="text-xs text-noir-300 dark:text-noir-300 light:text-noir-700 font-sans mt-0.5 truncate">{fullName}</p>}
        </div>
      )}

      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] uppercase tracking-[0.15em] text-noir-700 dark:text-noir-700 light:text-noir-600 font-sans px-3 pt-3 pb-1">
                {group.label}
              </p>
            )}
            {group.items.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-sans transition-all duration-200 relative
                ${isActive ? 'bg-gold-600/10 dark:bg-gold-600/10 light:bg-gold-100/50 text-gold-300 dark:text-gold-300 light:text-gold-700 border border-gold-600/15 dark:border-gold-600/15 light:border-gold-400' : 'text-noir-500 dark:text-noir-500 light:text-noir-600 hover:text-noir-200 dark:hover:text-noir-200 light:hover:text-noir-700 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] light:hover:bg-gold-50 border border-transparent'}
              `}>
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold-400 dark:bg-gold-400 light:bg-gold-600 rounded-r" />}
                    <Icon size={15} className="flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="whitespace-nowrap tracking-wide">{label}</motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-white/[0.06] dark:border-white/[0.06] light:border-gold-200 flex flex-col gap-1">
        <button onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-noir-500 dark:text-noir-500 light:text-noir-600 hover:text-red-400 dark:hover:text-red-400 light:hover:text-red-600 hover:bg-red-950/20 dark:hover:bg-red-950/20 light:hover:bg-red-100 transition-all font-sans border border-transparent">
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button onClick={onCollapse}
          className="flex items-center justify-center py-2 text-noir-600 dark:text-noir-600 light:text-noir-700 hover:text-noir-300 dark:hover:text-noir-300 light:hover:text-noir-500 transition-colors">
          {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
        </button>
      </div>
    </motion.aside>
  )
}
