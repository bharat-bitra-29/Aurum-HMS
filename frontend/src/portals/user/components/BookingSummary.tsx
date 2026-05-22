import { motion } from 'framer-motion'
import { MapPin, Star, BedDouble, Calendar, Users, DollarSign } from 'lucide-react'

interface Hotel {
  name: string
  city: string
  country: string
  star_rating: number
}

interface Room {
  name: string
  room_type: string
  price_per_night: number
  capacity: number
}

interface Props {
  hotel: Hotel
  room:  Room
  checkIn:   string
  checkOut:  string
  guests:    number
  nights:    number
  total:     number
}

export default function BookingSummary({ hotel, room, checkIn, checkOut, guests, nights, total }: Props) {
  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'

  const lineItems = [
    {
      label: `$${room.price_per_night.toLocaleString()} × ${nights} night${nights !== 1 ? 's' : ''}`,
      value: nights > 0 ? `$${(room.price_per_night * nights).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—',
    },
    { label: 'Taxes & service fees', value: 'Included' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/[0.02] border border-gold-600/15 rounded-sm overflow-hidden sticky top-24"
    >
      {/* Hotel banner */}
      <div className="bg-gradient-to-br from-obsidian-950 to-noir-950 px-5 py-4 border-b border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-5">
          <span className="font-display text-6xl text-gold-400">{hotel.name[0]}</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(hotel.star_rating)].map((_, i) => (
              <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
            ))}
          </div>
          <h3 className="font-display text-lg text-gold-300 tracking-wide leading-tight">{hotel.name}</h3>
          <p className="text-xs text-noir-500 font-sans flex items-center gap-1 mt-0.5">
            <MapPin size={9} /> {hotel.city}, {hotel.country}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Room */}
        <div className="pb-4 border-b border-white/5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-2">Room</p>
          <div className="flex items-start gap-2">
            <BedDouble size={14} className="text-gold-600/50 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-noir-200 font-sans">{room.name}</p>
              <p className="text-xs text-noir-600 font-sans capitalize">{room.room_type} · {room.capacity} guests max</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="pb-4 border-b border-white/5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-2">Stay</p>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-gold-600/50 flex-shrink-0" />
            <div className="text-sm font-sans">
              <span className="text-noir-200">{formatDate(checkIn)}</span>
              <span className="text-noir-600 mx-2">→</span>
              <span className="text-noir-200">{formatDate(checkOut)}</span>
            </div>
          </div>
          {nights > 0 && (
            <p className="text-xs text-noir-600 font-sans mt-1 pl-5">
              {nights} night{nights !== 1 ? 's' : ''} · {guests} guest{guests !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="pb-4 border-b border-white/5 space-y-2">
          {lineItems.map(item => (
            <div key={item.label} className="flex items-center justify-between text-sm font-sans">
              <span className="text-noir-500">{item.label}</span>
              <span className={item.label.includes('Taxes') ? 'text-noir-600 text-xs italic' : 'text-noir-300'}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-noir-300 font-sans font-medium">Total</span>
          <span className="font-display text-2xl text-gold-300">
            {nights > 0 ? `$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
          </span>
        </div>

        {/* Guarantee note */}
        <div className="pt-2 border-t border-white/5">
          <p className="text-[10px] text-noir-700 font-sans leading-relaxed">
            Free cancellation available. Payment collected at the property.
          </p>
        </div>
      </div>
    </motion.div>
  )
}