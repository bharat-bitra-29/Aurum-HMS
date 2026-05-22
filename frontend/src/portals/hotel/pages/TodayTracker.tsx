import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LogIn, LogOut, Home, Calendar } from 'lucide-react'
import { hotelPropertyApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'

interface Booking { id: number; check_in: string; check_out: string; guests: number; total_amount: number; status: string }

function BookingRow({ booking, label }: { booking: Booking; label: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="font-mono text-xs text-gold-500/70">#{String(booking.id).padStart(6, '0')}</div>
        <div>
          <p className="text-sm text-noir-200 font-sans">{label}</p>
          <p className="text-xs text-noir-500 font-sans">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge status={booking.status}>{booking.status}</Badge>
        <p className="text-xs text-noir-500 font-sans mt-1">${booking.total_amount.toFixed(2)}</p>
      </div>
    </div>
  )
}

export default function TodayTracker() {
  const { data, isLoading } = useQuery({
    queryKey: ['today-tracker'],
    queryFn: hotelPropertyApi.getTodayTracker,
    refetchInterval: 60_000,
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  const arrivals   = data?.arrivals   ?? []
  const departures = data?.departures ?? []
  const inHouse    = data?.in_house   ?? []
  const today      = data?.date ?? new Date().toISOString().split('T')[0]

  const panels = [
    { icon: <LogIn  size={18} className="text-emerald-400" />, title: 'Arrivals Today',   count: arrivals.length,   items: arrivals,   color: 'border-emerald-800/30 bg-emerald-950/20' },
    { icon: <LogOut size={18} className="text-amber-400" />,  title: 'Departures Today', count: departures.length, items: departures, color: 'border-amber-800/30 bg-amber-950/20' },
    { icon: <Home   size={18} className="text-blue-400" />,   title: 'Currently In-House', count: inHouse.length,  items: inHouse,    color: 'border-blue-800/30 bg-blue-950/20' },
  ]

  return (
    <div>
      <PageHeader
        title="Today's Tracker"
        subtitle={`Arrivals, departures and in-house guests — ${new Date(today).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      />

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {panels.map(({ icon, title, count, color }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`border rounded-sm p-5 text-center ${color}`}>
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="font-display text-3xl text-gold-300">{count}</p>
            <p className="text-xs text-noir-500 font-sans mt-1">{title}</p>
          </motion.div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {panels.map(({ icon, title, items, color }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
            className={`border rounded-sm overflow-hidden ${color}`}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
              {icon}
              <span className="font-sans text-sm font-medium text-noir-200">{title}</span>
              <span className="ml-auto text-xs font-mono text-noir-600">{items.length}</span>
            </div>
            <div className="px-4 divide-y divide-white/[0.04]">
              {items.length === 0 ? (
                <p className="py-6 text-center text-sm text-noir-600 font-sans italic">None today</p>
              ) : (
                items.map((b: Booking) => (
                  <BookingRow key={b.id} booking={b}
                    label={`${new Date(b.check_in).toLocaleDateString()} → ${new Date(b.check_out).toLocaleDateString()}`}
                  />
                ))
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}