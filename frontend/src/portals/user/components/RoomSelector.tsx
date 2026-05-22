import { motion } from 'framer-motion'
import { BedDouble, Users, Check } from 'lucide-react'
import Button from '../../../shared/components/Button'

interface Room {
  id: number
  name: string
  description: string
  room_type: string
  price_per_night: number
  capacity: number
  amenities: string
}

interface Props {
  rooms: Room[]
  selectedRoomId?: number
  onSelect: (room: Room) => void
  nights?: number
}

const typeLabel: Record<string, string> = {
  standard:     'Standard',
  deluxe:       'Deluxe',
  suite:        'Suite',
  presidential: 'Presidential Suite',
}

export default function RoomSelector({ rooms, selectedRoomId, onSelect, nights = 1 }: Props) {
  if (!rooms.length) {
    return (
      <div className="text-center py-10">
        <BedDouble size={40} className="text-gold-600/20 mx-auto mb-3" />
        <p className="font-display text-lg text-noir-500 italic">No rooms available</p>
        <p className="text-xs text-noir-600 font-sans mt-1">Try different dates or adjust your search</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rooms.map((room, i) => {
        const amenities = (() => { try { return JSON.parse(room.amenities) } catch { return [] } })()
        const isSelected = room.id === selectedRoomId
        const total = room.price_per_night * nights

        return (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(room)}
            className={`
              relative rounded-sm p-5 cursor-pointer transition-all duration-200 border
              ${isSelected
                ? 'bg-gold-600/[0.08] border-gold-500/30 shadow-lg shadow-gold-900/10'
                : 'bg-white/[0.02] border-white/8 hover:border-gold-600/15 hover:bg-white/[0.03]'}
            `}
          >
            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center"
              >
                <Check size={11} className="text-obsidian-950" />
              </motion.div>
            )}

            <div className="flex items-start justify-between mb-2 pr-6">
              <div>
                <h4 className="font-display text-lg text-gold-300 tracking-wide">{room.name}</h4>
                <p className="text-xs text-noir-500 font-sans capitalize">
                  {typeLabel[room.room_type] ?? room.room_type}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl text-gold-400">
                  ${room.price_per_night.toLocaleString()}
                </p>
                <p className="text-[10px] text-noir-600 font-sans">/night</p>
              </div>
            </div>

            {room.description && (
              <p className="text-xs text-noir-500 font-sans leading-relaxed mb-3 line-clamp-2">
                {room.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-noir-500 font-sans mb-3">
              <span className="flex items-center gap-1">
                <Users size={11} className="text-gold-600/40" />
                {room.capacity} guests max
              </span>
              {nights > 1 && (
                <span className="text-gold-400/60 font-display">
                  ${total.toLocaleString()} total
                </span>
              )}
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {amenities.slice(0, 5).map((a: string) => (
                  <span key={a} className={`text-[10px] px-2 py-0.5 rounded-sm font-sans border transition-colors
                    ${isSelected
                      ? 'bg-gold-600/10 border-gold-600/20 text-gold-400/70'
                      : 'bg-white/5 border-white/8 text-noir-500'}`}>
                    {a}
                  </span>
                ))}
                {amenities.length > 5 && (
                  <span className="text-[10px] text-noir-600 font-sans px-1">+{amenities.length - 5}</span>
                )}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
