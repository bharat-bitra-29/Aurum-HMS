import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, MessageSquare } from 'lucide-react'
import { useBooking } from '../hooks/useBooking'
import BookingSummary from '../components/BookingSummary'
import DateRangePicker from '../components/DateRangePicker'
import Button from '../../../shared/components/Button'

export default function BookingCheckout() {
  const { hotelId, roomId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const room  = state?.room
  const hotel = state?.hotel

  const {
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    guests, setGuests,
    specialRequests, setSpecialRequests,
    nights, total,
    submit, isLoading,
  } = useBooking(hotel, room)

  if (!room || !hotel) return (
    <div className="text-center py-24">
      <p className="font-display text-2xl text-noir-500 italic mb-4">No room selected</p>
      <Button variant="outline" onClick={() => navigate('/app/search')}>Back to Search</Button>
    </div>
  )

  return (
    <div>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-noir-500 hover:text-gold-400 transition-colors mb-6 font-sans">
        <ArrowLeft size={14} /> Back to property
      </button>

      <h1 className="font-display text-3xl text-gold-300 tracking-wide mb-8">Complete Your Reservation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: form */}
        <div className="lg:col-span-3 space-y-6">

          {/* Date picker */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
            <h2 className="font-display text-lg text-gold-300/80 mb-5 tracking-wide">Select Dates</h2>
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckIn={setCheckIn}
              onCheckOut={setCheckOut}
              minDate={new Date().toISOString().split('T')[0]}
            />
          </motion.div>

          {/* Guests */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
            <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide flex items-center gap-2">
              <Users size={16} className="text-gold-600/50" /> Number of Guests
            </h2>
            <div className="flex items-center gap-4">
              <button type="button"
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-9 h-9 rounded-sm border border-white/10 bg-white/[0.03] text-noir-200 hover:border-gold-600/30 hover:text-gold-400 transition-all font-sans text-lg flex items-center justify-center">
                −
              </button>
              <span className="font-display text-2xl text-gold-300 w-8 text-center">{guests}</span>
              <button type="button"
                onClick={() => setGuests(Math.min(room.capacity, guests + 1))}
                className="w-9 h-9 rounded-sm border border-white/10 bg-white/[0.03] text-noir-200 hover:border-gold-600/30 hover:text-gold-400 transition-all font-sans text-lg flex items-center justify-center">
                +
              </button>
              <span className="text-xs text-noir-600 font-sans">Max {room.capacity} guests</span>
            </div>
          </motion.div>

          {/* Special requests */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
            <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide flex items-center gap-2">
              <MessageSquare size={16} className="text-gold-600/50" /> Special Requests
            </h2>
            <textarea
              value={specialRequests}
              onChange={e => setSpecialRequests(e.target.value)}
              rows={3}
              placeholder="Late check-in, specific floor, dietary requirements…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-3 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all resize-none placeholder:text-noir-600"
            />
          </motion.div>

          <Button
            size="lg"
            loading={isLoading}
            disabled={nights <= 0}
            onClick={submit}
            className="w-full"
          >
            {nights > 0
              ? `Confirm Reservation · $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              : 'Select dates to continue'}
          </Button>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-2">
          <BookingSummary
            hotel={hotel}
            room={room}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            nights={nights}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}