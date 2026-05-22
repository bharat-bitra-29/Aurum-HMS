import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Star } from 'lucide-react'
import { userApi } from '../../../shared/api/user'
import RoomSelector from '../components/RoomSelector'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const searchParams = state?.searchParams ?? {}

  // Re-use search with empty params to get all hotels, then find by id
  const { data: allHotels = [], isLoading } = useQuery({
    queryKey: ['all-hotels-for-detail'],
    queryFn: () => userApi.search({}),
  })

  const hotel = allHotels.find((h: any) => h.id === Number(id))

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  if (!hotel) return (
    <div className="text-center py-24">
      <p className="font-display text-2xl text-noir-500 italic mb-4">Property not found</p>
      <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
    </div>
  )

  const amenities = (() => { try { return JSON.parse(hotel.amenities) } catch { return [] } })()

  return (
    <div>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-noir-500 hover:text-gold-400 transition-colors mb-6 font-sans">
        <ArrowLeft size={14} /> Back to results
      </button>

      {/* Hero banner */}
      <div className="h-52 bg-gradient-to-br from-obsidian-950 via-noir-950 to-black rounded-sm mb-8 relative overflow-hidden border border-white/8">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-display text-[140px] text-gold-600/[0.05] tracking-widest leading-none select-none">
            {hotel.name[0]}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950/70 to-transparent" />

        {/* Star badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-noir-950/80 px-3 py-1.5 rounded-sm border border-white/10">
          {[...Array(hotel.star_rating)].map((_, i) => (
            <Star key={i} size={11} className="text-gold-400 fill-gold-400" />
          ))}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-6 left-8">
          <h1 className="font-display text-3xl text-gold-300 tracking-wide mb-1">{hotel.name}</h1>
          <p className="text-sm text-noir-400 font-sans flex items-center gap-1">
            <MapPin size={12} /> {hotel.address}, {hotel.city}, {hotel.country}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
            <h2 className="font-display text-lg text-gold-300/80 mb-3 tracking-wide">About this property</h2>
            <p className="text-sm text-noir-400 font-sans leading-relaxed">
              {hotel.description || 'An exceptional property awaiting your arrival.'}
            </p>
            {amenities.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-3">Property amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a: string) => (
                    <span key={a} className="text-xs px-3 py-1 bg-white/5 border border-white/8 rounded-sm text-noir-400 font-sans">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Room selector */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide">Select Your Room</h2>
            <RoomSelector
              rooms={hotel.rooms ?? []}
              nights={
                searchParams.check_in && searchParams.check_out
                  ? Math.max(0,
                      (new Date(searchParams.check_out).getTime() - new Date(searchParams.check_in).getTime()) / 86_400_000
                    )
                  : 1
              }
              onSelect={(room) =>
                navigate(`/app/booking/${hotel.id}/${room.id}`, {
                  state: { room, hotel, searchParams },
                })
              }
            />
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="bg-white/[0.02] border border-gold-600/15 rounded-sm p-6 h-fit sticky top-24">
          <h3 className="font-display text-lg text-gold-300 mb-5 tracking-wide">Quick Info</h3>
          <div className="space-y-3.5">
            {[
              { label: 'Location',   value: hotel.city },
              { label: 'Country',    value: hotel.country },
              { label: 'Rating',     value: `${hotel.star_rating} ★` },
              { label: 'Rooms',      value: `${hotel.available_rooms} available` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm font-sans border-b border-white/[0.04] pb-3.5">
                <span className="text-noir-600">{label}</span>
                <span className="text-noir-200">{value}</span>
              </div>
            ))}
            <div className="pt-1">
              <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans mb-1">Starting from</p>
              <p className="font-display text-2xl text-gold-300">${hotel.min_price.toLocaleString()}<span className="text-sm text-noir-500 font-sans">/night</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
