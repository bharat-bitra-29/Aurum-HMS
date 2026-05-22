import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { hotelPropertyApi, hotelApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import toast from 'react-hot-toast'

const PRICING_TYPES = ['peak', 'off_peak', 'weekend', 'custom']
const TYPE_COLORS: Record<string, string> = {
  peak: 'red', off_peak: 'blue', weekend: 'amber', custom: 'gray'
}

export default function DynamicPricingPage() {
  const qc = useQueryClient()
  const [modal, setModal]   = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm]     = useState({
    room_id: '', pricing_type: 'custom', label: '',
    start_date: '', end_date: '', price_per_night: '',
  })

  const { data: pricing = [], isLoading } = useQuery({
    queryKey: ['hotel-dynamic-pricing'],
    queryFn: hotelPropertyApi.getPricing,
  })

  const { data: rooms = [] } = useQuery({
    queryKey: ['hotel-rooms'],
    queryFn: hotelApi.getRooms,
  })

  const addMutation = useMutation({
    mutationFn: () => hotelPropertyApi.addPricing({
      ...form, room_id: Number(form.room_id), price_per_night: Number(form.price_per_night),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-dynamic-pricing'] })
      setModal(false)
      toast.success('Pricing rule added')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelPropertyApi.deletePricing(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hotel-dynamic-pricing'] }); setDeleteId(null); toast.success('Rule deleted') },
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const getRoomName = (id: number) => rooms.find((r: any) => r.id === id)?.name ?? `Room #${id}`

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Dynamic Pricing"
        subtitle="Override room rates for specific date ranges — peak seasons, weekends, and special events"
        action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Rule</Button>}
      />

      {pricing.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-xl text-noir-500 italic">No pricing rules yet</p>
          <p className="text-xs text-noir-600 font-sans mt-1 mb-4">Add rules to automatically adjust rates for specific periods</p>
          <Button onClick={() => setModal(true)} size="sm"><Plus size={13} /> Add First Rule</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {pricing.map((rule: any, i: number) => (
            <motion.div key={rule.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/8 rounded-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={TYPE_COLORS[rule.pricing_type] as any}>{rule.pricing_type}</Badge>
                <div>
                  <p className="text-sm text-noir-200 font-sans font-medium">
                    {rule.label || rule.pricing_type} — {getRoomName(rule.room_id)}
                  </p>
                  <p className="text-xs text-noir-500 font-sans mt-0.5">
                    {new Date(rule.start_date).toLocaleDateString()} → {new Date(rule.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-display text-xl text-gold-300">${rule.price_per_night}</p>
                  <p className="text-[10px] text-noir-600 font-sans">/night</p>
                </div>
                <button onClick={() => setDeleteId(rule.id)}
                  className="text-noir-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Pricing Rule">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Room</label>
            <select value={form.room_id} onChange={set('room_id')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              <option value="" className="bg-obsidian-950">Select room…</option>
              {rooms.map((r: any) => <option key={r.id} value={r.id} className="bg-obsidian-950">{r.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Type</label>
              <select value={form.pricing_type} onChange={set('pricing_type')}
                className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
                {PRICING_TYPES.map(t => <option key={t} value={t} className="bg-obsidian-950 capitalize">{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <Input label="Label (e.g. Diwali Peak)" value={form.label} onChange={set('label')} placeholder="Optional label" />
            <Input label="Start date" type="date" value={form.start_date} onChange={set('start_date')} />
            <Input label="End date" type="date" value={form.end_date} onChange={set('end_date')} />
          </div>
          <Input label="Price per night ($)" type="number" value={form.price_per_night} onChange={set('price_per_night')} placeholder="0.00" />
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" size="sm" onClick={() => setModal(false)}>Cancel</Button>
          <Button size="sm" loading={addMutation.isPending}
            disabled={!form.room_id || !form.start_date || !form.end_date || !form.price_per_night}
            onClick={() => addMutation.mutate()}>Add Rule</Button>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)} loading={deleteMutation.isPending}
        title="Delete Pricing Rule" message="This will remove the pricing override for this date range."
        confirmLabel="Delete Rule" />
    </div>
  )
}