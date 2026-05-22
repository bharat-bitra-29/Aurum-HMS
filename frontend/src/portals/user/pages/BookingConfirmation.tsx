import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, MapPin, BedDouble, Hash } from 'lucide-react'
import Button from '../../../shared/components/Button'

export default function BookingConfirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { booking, room, hotel } = state ?? {}

  if (!booking) return (
    <div className="text-center py-24">
      <p className="font-display text-2xl text-noir-500 italic">No booking to confirm</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/app/search')}>Back to Search</Button>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto py-8">
      {/* Success indicator */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-xl scale-150" />
          <CheckCircle size={64} className="relative text-emerald-400" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h1 className="font-display text-3xl text-gold-300 tracking-wide text-center mb-2">
          Reservation Confirmed
        </h1>
        <p className="text-sm text-noir-500 font-sans text-center mb-8">
          A luxury experience awaits. We look forward to welcoming you.
        </p>

        {/* Booking card */}
        <div className="bg-white/[0.03] border border-gold-600/15 rounded-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-600/10 to-transparent px-6 py-4 border-b border-white/8">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.15em] text-noir-500 font-sans">Booking Reference</p>
              <div className="flex items-center gap-1.5 text-gold-400 font-mono text-sm">
                <Hash size={12} />
                {String(booking.id).padStart(6, '0')}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {hotel && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-600/50 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-0.5">Property</p>
                  <p className="text-sm text-noir-200 font-sans">{hotel.name}</p>
                  <p className="text-xs text-noir-500 font-sans">{hotel.city}, {hotel.country}</p>
                </div>
              </div>
            )}

            {room && (
              <div className="flex items-start gap-3">
                <BedDouble size={16} className="text-gold-600/50 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-0.5">Room</p>
                  <p className="text-sm text-noir-200 font-sans">{room.name}</p>
                  <p className="text-xs text-noir-500 font-sans capitalize">{room.room_type}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-gold-600/50 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-0.5">Dates</p>
                <p className="text-sm text-noir-200 font-sans">
                  {new Date(booking.check_in).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                  {' — '}
                  {new Date(booking.check_out).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-noir-500 font-sans">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <span className="text-sm text-noir-400 font-sans">Total charged</span>
              <span className="font-display text-2xl text-gold-300">${booking.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Status note */}
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-950/20 border border-amber-800/25 rounded-sm mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
          <p className="text-xs text-amber-300/80 font-sans leading-relaxed">
            Your reservation is pending hotel confirmation. You'll receive an update once the hotel reviews your booking.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" size="lg" onClick={() => navigate('/app/bookings')} className="flex-1">
            View My Bookings
          </Button>
          <Button size="lg" onClick={() => navigate('/app/search')} className="flex-1">
            Explore More
          </Button>
        </div>
      </motion.div>
    </div>
  )
}