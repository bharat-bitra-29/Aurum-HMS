import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { hotelPropertyApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Spinner from '../../../shared/components/Spinner'

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-amber-500/70',
  confirmed: 'bg-emerald-500/70',
  cancelled: 'bg-red-500/40',
}
const BLACKOUT_COLOR = 'bg-noir-700/60'

function addDays(date: Date, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toISO(d: Date) { return d.toISOString().split('T')[0] }

export default function GanttCalendar() {
  const today = new Date()
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return d
  })

  const DAYS = 14  // show 2 weeks at a time

  const days = Array.from({ length: DAYS }, (_, i) => addDays(weekStart, i))

  const { data, isLoading } = useQuery({
    queryKey: ['hotel-calendar'],
    queryFn: hotelPropertyApi.getCalendar,
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  const rooms     = data?.rooms     ?? []
  const bookings  = data?.bookings  ?? []
  const blackouts = data?.blackouts ?? []

  const getEventsForCell = (roomId: number, iso: string) => {
    const bks = bookings.filter((b: any) => b.room_id === roomId && b.check_in <= iso && b.check_out > iso)
    const bds = blackouts.filter((bd: any) => bd.room_id === roomId && bd.start_date <= iso && bd.end_date > iso)
    return { bks, bds }
  }

  return (
    <div>
      <PageHeader title="Booking Calendar" subtitle="Gantt view — all rooms and reservations" />

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setWeekStart(d => addDays(d, -DAYS))}
          className="p-1.5 text-noir-500 hover:text-gold-400 transition-colors border border-white/8 rounded-sm">
          <ChevronLeft size={15} />
        </button>
        <span className="font-sans text-sm text-noir-300">
          {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
          {days[DAYS-1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={() => setWeekStart(d => addDays(d, DAYS))}
          className="p-1.5 text-noir-500 hover:text-gold-400 transition-colors border border-white/8 rounded-sm">
          <ChevronRight size={15} />
        </button>
        <button onClick={() => {
          const d = new Date(today); d.setDate(d.getDate() - d.getDay()); setWeekStart(d)
        }} className="text-xs text-gold-400/70 hover:text-gold-400 font-sans transition-colors ml-2">
          Today
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {[
          { cls: 'bg-amber-500/70',   label: 'Pending' },
          { cls: 'bg-emerald-500/70', label: 'Confirmed' },
          { cls: 'bg-noir-700/60',    label: 'Blackout' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${cls}`} />
            <span className="text-[10px] text-noir-500 font-sans">{label}</span>
          </div>
        ))}
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl text-noir-500 italic">No rooms added yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header row: dates */}
            <div className="flex">
              <div className="w-36 flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans border-b border-r border-white/8">
                Room
              </div>
              {days.map(d => {
                const iso = toISO(d)
                const isToday = iso === toISO(today)
                return (
                  <div key={iso}
                    className={`w-16 flex-shrink-0 px-1 py-2 text-center text-[10px] font-sans border-b border-r border-white/8 ${
                      isToday ? 'bg-gold-600/10 text-gold-400' : 'text-noir-600'
                    }`}>
                    <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="font-medium">{d.getDate()}</div>
                  </div>
                )
              })}
            </div>

            {/* Room rows */}
            {rooms.map((room: any, ri: number) => (
              <motion.div key={room.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.04 }}
                className="flex hover:bg-white/[0.01] transition-colors">
                {/* Room name */}
                <div className="w-36 flex-shrink-0 px-3 py-3 border-b border-r border-white/8">
                  <p className="text-xs text-noir-200 font-sans font-medium truncate">{room.name}</p>
                  <p className="text-[10px] text-noir-600 font-sans capitalize">{room.room_type}</p>
                </div>

                {/* Day cells */}
                {days.map(d => {
                  const iso = toISO(d)
                  const { bks, bds } = getEventsForCell(room.id, iso)
                  const isToday = iso === toISO(today)

                  return (
                    <div key={iso}
                      className={`w-16 flex-shrink-0 h-12 border-b border-r border-white/8 relative ${
                        isToday ? 'bg-gold-600/5' : ''
                      }`}>
                      {bds.length > 0 && (
                        <div className={`absolute inset-1 rounded-sm ${BLACKOUT_COLOR} flex items-center justify-center`}>
                          <span className="text-[8px] text-noir-400 font-sans">🚫</span>
                        </div>
                      )}
                      {bks.map((b: any) => (
                        <div key={b.id}
                          className={`absolute inset-x-0.5 top-1 bottom-1 rounded-sm ${STATUS_COLOR[b.status] ?? 'bg-blue-500/40'} flex items-center justify-center`}>
                          <span className="text-[8px] font-sans text-white">#{b.id}</span>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}