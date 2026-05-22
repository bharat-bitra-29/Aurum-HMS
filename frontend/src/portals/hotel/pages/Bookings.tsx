import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Hash, Users } from 'lucide-react'
import { useHotelBookings } from '../hooks/useHotelBookings'
import { useGroupBookings } from '../hooks/useGroupBookings'
import { usePagination } from '../../../shared/hooks/usePagination'
import BookingStatusBadge from '../components/BookingStatusBadge'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'
import Pagination from '../../../shared/components/Pagination'
import { BookingStatus } from '../../../shared/types/api'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const
type Filter = typeof FILTERS[number]

const STATUS_ACTIONS: Record<BookingStatus, { next: BookingStatus; label: string; variant: 'outline' | 'danger' }[]> = {
  pending:   [{ next: 'confirmed', label: 'Confirm',  variant: 'outline' }, { next: 'cancelled', label: 'Cancel', variant: 'danger' }],
  confirmed: [{ next: 'completed', label: 'Complete', variant: 'outline' }, { next: 'cancelled', label: 'Cancel', variant: 'danger' }],
  completed: [],
  cancelled: [],
}

export default function Bookings() {
  const { bookings, isLoading, updateStatus, updating, pending, confirmed, completed, cancelled } = useHotelBookings()
  const { groupBookings, isLoading: gbLoading, updateStatus: updateGBStatus, updating: gbUpdating, pending: gbPending, confirmed: gbConfirmed, cancelled: gbCancelled } = useGroupBookings()
  const [filter, setFilter] = useState<Filter>('all')
  const [tab, setTab] = useState<'regular' | 'group'>('regular')

  const nights = (b: any) =>
    Math.max(0, (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86_400_000)

  // Get data based on active tab
  const data = tab === 'regular' ? {
    items: filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter),
    pending, confirmed, completed, cancelled,
    updateStatus, updating,
    isPending: (b: any) => b.status === 'pending',
    isConfirmed: (b: any) => b.status === 'confirmed',
    isCompleted: (b: any) => b.status === 'completed',
    isCancelled: (b: any) => b.status === 'cancelled',
    getActions: (b: any) => STATUS_ACTIONS[b.status as BookingStatus] ?? [],
  } : {
    items: filter === 'all' ? groupBookings : groupBookings.filter((gb: any) => gb.status === filter),
    pending: gbPending, confirmed: gbConfirmed, cancelled: gbCancelled, completed: [],
    updateStatus: updateGBStatus, updating: gbUpdating,
    isPending: (b: any) => b.status === 'pending',
    isConfirmed: (b: any) => b.status === 'confirmed',
    isCompleted: () => false,
    isCancelled: (b: any) => b.status === 'cancelled',
    getActions: (b: any) => {
      if (b.status === 'pending') return [{ next: 'confirmed', label: 'Confirm', variant: 'outline' as const }, { next: 'cancelled', label: 'Cancel', variant: 'danger' as const }]
      if (b.status === 'confirmed') return [{ next: 'cancelled', label: 'Cancel', variant: 'danger' as const }]
      return []
    },
  }

  const filtered = data.items
  const { paginated, page, totalPages, goTo } = usePagination(filtered, 10)

  const currentIsLoading = tab === 'regular' ? isLoading : gbLoading

  if (currentIsLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Bookings" subtitle="Real-time reservation management" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/8">
        {(['regular', 'group'] as const).map(t => (
          <button key={t}
            onClick={() => { setTab(t); setFilter('all'); goTo(1) }}
            className={`px-4 py-3 text-sm uppercase tracking-[0.1em] transition-all border-b-2 ${
              tab === t ? 'text-gold-300 border-gold-600 font-semibold' : 'text-noir-500 border-transparent hover:text-noir-300'
            }`}>{t === 'regular' ? 'Regular' : 'Group'} Bookings</button>
        ))}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(tab === 'regular'
          ? [
              { status: 'pending',   count: data.pending.length },
              { status: 'confirmed', count: data.confirmed.length },
              { status: 'completed', count: data.completed.length },
              { status: 'cancelled', count: data.cancelled.length },
            ]
          : [
              { status: 'pending',   count: data.pending.length },
              { status: 'confirmed', count: data.confirmed.length },
              { status: 'cancelled', count: data.cancelled.length },
            ]
        ).map(({ status, count }: any) => (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { setFilter(status); goTo(1) }}
            className="bg-white/[0.02] border border-white/8 rounded-sm px-4 py-3 text-center cursor-pointer hover:border-gold-600/15 transition-all"
          >
            <p className="font-display text-2xl text-gold-300">{count}</p>
            <div className="flex justify-center mt-1">
              <BookingStatusBadge status={status} size="sm" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-white/[0.02] border border-white/8 rounded-sm w-fit flex-wrap">
        {(tab === 'regular' ? FILTERS : ['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); goTo(1) }}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm font-sans transition-all ${
              filter === f ? 'bg-gold-600/15 text-gold-300 border border-gold-600/20' : 'text-noir-500 hover:text-noir-300'
            }`}>{f}</button>
        ))}
      </div>

      {/* Booking cards */}
      {paginated.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-xl text-noir-500 italic">No {filter === 'all' ? '' : filter} {tab === 'regular' ? 'bookings' : 'group bookings'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((b: any, i: number) => (
            <motion.div key={b.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white/[0.02] border border-white/8 rounded-sm p-5 hover:border-gold-600/10 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Ref + status */}
                <div className="sm:w-40 flex-shrink-0">
                  <div className="flex items-center gap-1 text-gold-400/70 font-mono text-sm mb-1.5">
                    <Hash size={11} />{String(b.id).padStart(6, '0')}
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                {/* Dates */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-sm text-noir-200 font-sans">
                    <Calendar size={12} className="text-gold-600/40" />
                    {new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {new Date(b.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {tab === 'regular' && (
                    <p className="text-xs text-noir-600 font-sans mt-0.5 flex items-center gap-1">
                      <Users size={10} /> {b.guests} guest{b.guests !== 1 ? 's' : ''} · {nights(b)} night{nights(b) !== 1 ? 's' : ''}
                    </p>
                  )}
                  {tab === 'group' && (
                    <p className="text-xs text-noir-600 font-sans mt-0.5 flex items-center gap-1">
                      <Users size={10} /> {b.num_rooms} room{b.num_rooms !== 1 ? 's' : ''} ({b.total_guests} guests) · {nights(b)} night{nights(b) !== 1 ? 's' : ''}
                    </p>
                  )}
                  {b.special_requests && (
                    <p className="text-xs text-noir-600 italic font-sans mt-1">"{b.special_requests}"</p>
                  )}
                  {tab === 'group' && b.contact_name && (
                    <p className="text-xs text-noir-600 font-sans mt-1">Contact: {b.contact_name}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="sm:w-28 sm:text-right">
                  <p className="font-display text-xl text-gold-300">${b.total_amount.toFixed(2)}</p>
                  <p className="text-[10px] text-noir-600 font-sans">total charge</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {(data.getActions(b) ?? [])
                    .filter(action => {
                      // Hide cancel button if check-in date has passed
                      if (action.next === 'cancelled' && new Date(b.check_in) <= new Date()) {
                        return false
                      }
                      return true
                    })
                    .map(({ next, label, variant }) => (
                    <Button key={next} variant={variant} size="sm"
                      loading={data.updating}
                      onClick={() => data.updateStatus({ id: b.id, status: next as any })}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={goTo} />
    </div>
  )
}
