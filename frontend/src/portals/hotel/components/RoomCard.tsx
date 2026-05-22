import { motion } from 'framer-motion'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import Badge from '../../../shared/components/Badge'

interface Room {
  id: number
  name: string
  room_type: string
  price_per_night: number
  capacity: number
  amenities: string
  is_available: boolean
}

interface Props {
  room: Room
  delay?: number
  onEdit:   (room: Room) => void
  onDelete: (id: number) => void
  onToggle: (room: Room) => void
}

export default function RoomCard({ room, delay = 0, onEdit, onDelete, onToggle }: Props) {
  const amenities = (() => { try { return JSON.parse(room.amenities) } catch { return [] } })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.02] border border-white/8 rounded-sm p-5 hover:border-gold-600/15 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg text-gold-300 tracking-wide truncate">{room.name}</h3>
          <p className="text-xs text-noir-500 font-sans capitalize">{room.room_type}</p>
        </div>
        <Badge variant={room.is_available ? 'green' : 'gray'}>
          {room.is_available ? 'Available' : 'Unavailable'}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <p className="font-display text-2xl text-gold-400">
          ${room.price_per_night}
          <span className="text-sm text-noir-500 font-sans">/night</span>
        </p>
        <div className="flex items-center gap-1 text-xs text-noir-500 font-sans">
          <Users size={12} className="text-gold-600/40" /> {room.capacity} guests
        </div>
      </div>

      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {amenities.slice(0, 4).map((a: string) => (
            <span key={a} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/8 rounded-sm text-noir-500 font-sans">
              {a}
            </span>
          ))}
          {amenities.length > 4 && (
            <span className="text-[10px] text-noir-600 font-sans px-1">+{amenities.length - 4} more</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          onClick={() => onToggle(room)}
          title={room.is_available ? 'Mark unavailable' : 'Mark available'}
          className="text-noir-500 hover:text-gold-400 transition-colors"
        >
          {room.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
        <button
          onClick={() => onEdit(room)}
          className="ml-auto text-noir-500 hover:text-gold-400 transition-colors p-1"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(room.id)}
          className="text-noir-500 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}