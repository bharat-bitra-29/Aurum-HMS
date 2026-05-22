import { useState } from 'react'
import { motion } from 'framer-motion'
import { BedDouble, Calendar, Hash } from 'lucide-react'
import { useMyBookings } from '../hooks/useMyBookings'
import PageHeader from '../../../shared/components/PageHeader'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import Pagination from '../../../shared/components/Pagination'
import { usePagination } from '../../../shared/hooks/usePagination'

export default function MyBookings() {
  const { bookings, isLoading, cancel, cancelling, nightsFor } = useMyBookings()
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [cancelId, setCancelId] = useState<number | null>(null)

  const filtered = filter === 'all' ? bookings : bookings.filter((b: any) => b.status === filter)
  const { paginated, page, totalPages, goTo } = usePagination(filtered, 8)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="My Bookings" subtitle="Your reservation history and upcoming stays" />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] border border-white/8 rounded-sm w-fit flex-wrap">
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); goTo(1) }}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm font-sans transition-all ${
              filter === f
                ? 'bg-gold-600/15 text-gold-300 border border-gold-600/20'
                : 'text-noir-500 hover:text-noir-300'
            }`}>
            {f}
            {f !== 'all' && (
              <span className="ml-1.5 text-noir-600">
                ({bookings.filter((b: any) => b.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <BedDouble size={48} className="text-gold-600/15 mx-auto mb-4" />
          <p className="font-display text-2xl text-noir-500 italic mb-2">No bookings found</p>
          <p className="text-sm text-noir-600 font-sans mb-6">
            {filter === 'all' ? "You haven't made any reservations yet." : `No ${filter} bookings.`}
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/app/search'}>
            Explore Hotels
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((booking: any, i: number) => (
              <motion.div key={booking.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden hover:border-gold-600/10 transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Colour status bar */}
                  <div className={`w-full sm:w-1 self-stretch flex-shrink-0 h-1 sm:h-auto ${
                    booking.status === 'confirmed'  ? 'bg-emerald-500/40' :
                    booking.status === 'pending'    ? 'bg-amber-500/40'   :
                    booking.status === 'completed'  ? 'bg-blue-500/30'    :
                    'bg-white/10'
                  }`} />

                  <div className="flex-1 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    {/* Reference */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-1">Reference</p>
                      <div className="flex items-center gap-1 text-gold-400/80 font-mono text-sm mb-1.5">
                        <Hash size={11} />{String(booking.id).padStart(6, '0')}
                      </div>
                      <Badge status={booking.status}>{booking.status}</Badge>
                    </div>

                    {/* Dates */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-1">Stay</p>
                      <div className="flex items-center gap-1.5 text-sm text-noir-200 font-sans">
                        <Calendar size={12} className="text-gold-600/40" />
                        {new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <p className="text-xs text-noir-600 font-sans mt-0.5">
                        {nightsFor(booking)} night{nightsFor(booking) !== 1 ? 's' : ''} · {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-1">Total</p>
                      <p className="font-display text-xl text-gold-300">${booking.total_amount.toFixed(2)}</p>
                      <p className="text-xs text-noir-600 font-sans mt-0.5">
                        Booked {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-start sm:justify-end">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && 
                       new Date(booking.check_in) > new Date() && (
                        <Button variant="danger" size="sm" onClick={() => setCancelId(booking.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={goTo} />
        </>
      )}

      <ConfirmDialog
        open={cancelId !== null}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancel(cancelId!)}
        loading={cancelling}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmLabel="Cancel Reservation"
      />
    </div>
  )
}