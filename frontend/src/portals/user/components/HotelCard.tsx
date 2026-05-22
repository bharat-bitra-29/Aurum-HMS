import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, BedDouble, ArrowRight } from 'lucide-react'

interface Hotel {
  id: number
  name: string
  description: string
  city: string
  country: string
  address: string
  star_rating: number
  amenities: string
  min_price: number
  available_rooms: number
  rooms: any[]
}

interface Props {
  hotel: Hotel
  delay?: number
  searchParams?: Record<string, any>
}

export default function HotelCard({ hotel, delay = 0, searchParams = {} }: Props) {
  const navigate = useNavigate()
  const amenities = (() => { try { return JSON.parse(hotel.amenities) } catch { return [] } })()

  const handleClick = () =>
    navigate(`/app/hotels/${hotel.id}`, { state: { searchParams } })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={handleClick}
      className="group bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden hover:border-gold-600/20 transition-all duration-300 cursor-pointer"
    >
      {/* Decorative header */}
      <div className="h-36 bg-gradient-to-br from-obsidian-950 via-noir-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[96px] text-gold-600/[0.07] tracking-widest select-none leading-none">
            {hotel.name[0]}
          </span>
        </div>
        {/* Diagonal shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-600/0 to-gold-600/0 group-hover:from-gold-600/[0.03] group-hover:to-transparent transition-all duration-500" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-noir-950/70 to-transparent" />

        {/* Star rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-noir-950/80 px-2.5 py-1.5 rounded-sm backdrop-blur-sm border border-white/8">
          {[...Array(hotel.star_rating)].map((_, i) => (
            <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
          ))}
        </div>

        {/* Available rooms chip */}
        <div className="absolute bottom-3 left-4">
          <span className="text-[10px] font-sans text-gold-400/70 flex items-center gap-1">
            <BedDouble size={10} />
            {hotel.available_rooms} room{hotel.available_rooms !== 1 ? 's' : ''} available
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl text-gold-300 tracking-wide group-hover:text-gold-200 transition-colors truncate">
              {hotel.name}
            </h3>
            <p className="text-xs text-noir-500 font-sans flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {hotel.city}, {hotel.country}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display text-xl text-gold-400">
              from ${hotel.min_price.toLocaleString()}
            </p>
            <p className="text-[10px] text-noir-600 font-sans">/night</p>
          </div>
        </div>

        {/* Description */}
        {hotel.description && (
          <p className="text-xs text-noir-500 font-sans leading-relaxed line-clamp-2 mb-3">
            {hotel.description}
          </p>
        )}

        {/* Amenity pills */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenities.slice(0, 3).map((a: string) => (
              <span key={a} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/8 rounded-sm text-noir-500 font-sans">
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[10px] text-noir-600 font-sans px-1">
                +{amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <p className="text-xs text-noir-600 font-sans">
            {hotel.rooms?.length ?? hotel.available_rooms} room type{(hotel.rooms?.length ?? hotel.available_rooms) !== 1 ? 's' : ''} from ${hotel.min_price}/night
          </p>
          <span className="text-xs text-gold-500/50 font-sans group-hover:text-gold-400 transition-colors flex items-center gap-1">
            View property <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}