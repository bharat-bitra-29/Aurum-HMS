import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Mail, Star, CheckCircle, XCircle } from 'lucide-react'
import { adminApi } from '../../../shared/api/admin'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'
import toast from 'react-hot-toast'

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['admin-hotel', id],
    queryFn: () => adminApi.getHotel(Number(id)),
  })

  const approveMutation = useMutation({
    mutationFn: (approved: boolean) => adminApi.approveHotel(Number(id), approved),
    onSuccess: (_, approved) => {
      qc.invalidateQueries({ queryKey: ['admin-hotel', id] })
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      toast.success(approved ? 'Hotel approved' : 'Hotel rejected')
    },
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>
  if (!hotel) return null

  const amenities = (() => { try { return JSON.parse(hotel.amenities) } catch { return [] } })()

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-noir-500 hover:text-gold-400 transition-colors mb-6 font-sans">
        <ArrowLeft size={14} /> Back to hotels
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl text-gold-300 tracking-wide">{hotel.name}</h1>
            <Badge status={hotel.status}>{hotel.status}</Badge>
          </div>
          <p className="text-sm text-noir-500 font-sans flex items-center gap-1">
            <MapPin size={12} /> {hotel.address}, {hotel.city}, {hotel.country}
          </p>
        </div>
        {hotel.status === 'pending' && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => approveMutation.mutate(true)} loading={approveMutation.isPending}>
              <CheckCircle size={14} /> Approve
            </Button>
            <Button variant="danger" onClick={() => approveMutation.mutate(false)} loading={approveMutation.isPending}>
              <XCircle size={14} /> Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white/[0.02] border border-white/8 rounded-sm p-6"
        >
          <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide">About</h2>
          <p className="text-sm text-noir-300 font-sans leading-relaxed mb-6">
            {hotel.description || 'No description provided.'}
          </p>

          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className={i < hotel.star_rating ? 'text-gold-400 fill-gold-400' : 'text-noir-700'} />
            ))}
            <span className="text-sm text-noir-500 ml-2 font-sans">{hotel.star_rating}-star property</span>
          </div>

          {amenities.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 mb-3 font-sans">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a: string) => (
                  <span key={a} className="text-xs px-3 py-1 bg-white/5 border border-white/8 rounded-sm text-noir-400 font-sans">{a}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/8 rounded-sm p-6"
        >
          <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide">Contact</h2>
          <div className="space-y-4">
            {[
              { icon: <Phone size={14} />, label: 'Phone', value: hotel.phone || '—' },
              { icon: <Mail size={14} />, label: 'Email', value: hotel.email || '—' },
              { icon: <MapPin size={14} />, label: 'City', value: hotel.city },
              { icon: <MapPin size={14} />, label: 'Country', value: hotel.country },
            ].map(({ icon, label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-1">{label}</p>
                <div className="flex items-center gap-2 text-sm text-noir-300 font-sans">
                  <span className="text-noir-600">{icon}</span> {value}
                </div>
              </div>
            ))}
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-1">Applied</p>
              <p className="text-sm text-noir-300 font-sans">{new Date(hotel.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          {hotel.rejection_reason && (
            <div className="mt-6 p-3 bg-red-950/30 border border-red-800/30 rounded-sm">
              <p className="text-[10px] uppercase tracking-[0.12em] text-red-500 font-sans mb-1">Rejection reason</p>
              <p className="text-xs text-red-300 font-sans">{hotel.rejection_reason}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}