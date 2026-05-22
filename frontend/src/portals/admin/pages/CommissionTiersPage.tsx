import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Percent, Edit2, Check } from 'lucide-react'
import { adminManagementApi } from '../../../shared/api/admin'
import { adminApi } from '../../../shared/api/admin'
import PageHeader from '../../../shared/components/PageHeader'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'
import toast from 'react-hot-toast'

const TIER_PRESETS = [
  { label: 'Standard',    rate: 0.10, color: 'gray'   },
  { label: 'Premium',     rate: 0.08, color: 'gold'   },
  { label: 'Partner',     rate: 0.06, color: 'green'  },
  { label: 'Enterprise',  rate: 0.05, color: 'blue'   },
]

export default function CommissionTiersPage() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRate,  setEditRate]  = useState('')
  const [editLabel, setEditLabel] = useState('')

  const { data: hotels = [],  isLoading: loadingHotels } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  })

  const { data: tiers = [], isLoading: loadingTiers } = useQuery({
    queryKey: ['admin-tiers'],
    queryFn: adminManagementApi.getTiers,
  })

  const setTierMutation = useMutation({
    mutationFn: ({ hotel_id, rate, label }: any) => adminManagementApi.setTier(hotel_id, rate, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tiers'] })
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      setEditingId(null)
      toast.success('Commission tier updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const getTierForHotel = (hotelId: number) =>
    tiers.find((t: any) => t.hotel_id === hotelId)

  const approvedHotels = hotels.filter((h: any) => h.status === 'approved')

  if (loadingHotels || loadingTiers) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Commission Tiers"
        subtitle="Set custom commission rates per hotel — default is 10%"
      />

      {/* Tier presets reference */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {TIER_PRESETS.map(t => (
          <div key={t.label} className="bg-white/[0.02] border border-white/8 rounded-sm p-4 text-center">
            <p className="font-display text-2xl text-gold-300">{(t.rate * 100).toFixed(0)}%</p>
            <p className="text-xs font-sans text-noir-400 mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Hotels table */}
      {approvedHotels.length === 0 ? (
        <div className="text-center py-16">
          <Percent size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-xl text-noir-500 italic">No approved hotels yet</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-white/8">
                {['Hotel', 'City', 'Current Rate', 'Tier Label', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-gold-500/70 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvedHotels.map((hotel: any, i: number) => {
                const tier   = getTierForHotel(hotel.id)
                const rate   = tier?.rate ?? 0.10
                const label  = tier?.label ?? 'Standard'
                const isEditing = editingId === hotel.id

                return (
                  <motion.tr key={hotel.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="text-noir-100 font-medium">{hotel.name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-noir-500">{hotel.city}</td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <input type="number" min={1} max={30} step={0.5}
                          value={editRate}
                          onChange={e => setEditRate(e.target.value)}
                          className="w-20 bg-white/[0.05] border border-gold-600/30 rounded-sm px-2 py-1 text-sm text-gold-300 font-mono focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-gold-300">{(rate * 100).toFixed(1)}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <select value={editLabel} onChange={e => setEditLabel(e.target.value)}
                          className="bg-white/[0.05] border border-white/10 rounded-sm px-2 py-1 text-sm text-noir-100 font-sans focus:outline-none">
                          {TIER_PRESETS.map(t => <option key={t.label} value={t.label} className="bg-obsidian-950">{t.label}</option>)}
                        </select>
                      ) : (
                        <Badge variant="gray">{label}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setTierMutation.mutate({
                              hotel_id: hotel.id,
                              rate: Number(editRate) / 100,
                              label: editLabel,
                            })}
                            className="w-7 h-7 flex items-center justify-center bg-emerald-900/40 border border-emerald-800/40 rounded-sm text-emerald-400 hover:bg-emerald-900/60 transition-all">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-noir-500 hover:text-noir-200 font-sans transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(hotel.id)
                            setEditRate(String((rate * 100).toFixed(1)))
                            setEditLabel(label)
                          }}
                          className="flex items-center gap-1.5 text-xs text-gold-400/60 hover:text-gold-400 font-sans transition-colors">
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}