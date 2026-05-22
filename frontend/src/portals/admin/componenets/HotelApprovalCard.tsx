import { motion } from 'framer-motion'
import { MapPin, Star, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'

interface Hotel {
  id: number
  name: string
  city: string
  country: string
  star_rating: number
  status: string
  created_at: string
}

interface Props {
  hotel: Hotel
  onApprove: (id: number) => void
  onReject:  (id: number) => void
  loading?: boolean
  delay?: number
}

export default function HotelApprovalCard({ hotel, onApprove, onReject, loading, delay = 0 }: Props) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.02] border border-white/8 rounded-sm p-5 hover:border-gold-600/15 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-display text-lg text-gold-300 tracking-wide truncate">{hotel.name}</h3>
          <p className="text-xs text-noir-500 font-sans flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {hotel.city}, {hotel.country}
          </p>
        </div>
        <Badge status={hotel.status}>{hotel.status}</Badge>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12}
            className={i < hotel.star_rating ? 'text-gold-400 fill-gold-400' : 'text-noir-700'} />
        ))}
        <span className="text-xs text-noir-600 font-sans ml-1">
          Applied {new Date(hotel.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/hotels/${hotel.id}`)}>
          <Eye size={12} /> View
        </Button>
        {hotel.status === 'pending' && (
          <>
            <Button variant="outline" size="sm" loading={loading} onClick={() => onApprove(hotel.id)}>
              <CheckCircle size={12} /> Approve
            </Button>
            <Button variant="danger" size="sm" loading={loading} onClick={() => onReject(hotel.id)}>
              <XCircle size={12} /> Reject
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}