import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { DollarSign, Plus, CheckCircle, Clock } from 'lucide-react'
import { adminManagementApi } from '../../../shared/api/admin'
import { adminApi } from '../../../shared/api/admin'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Badge from '../../../shared/components/Badge'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import StatCard from '../../../shared/components/StatCard'
import toast from 'react-hot-toast'

export default function PayoutsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ hotel_id: '', period_start: '', period_end: '' })

  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => adminManagementApi.getPayouts(),
  })

  const { data: hotels = [] } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  })

  const createMutation = useMutation({
    mutationFn: () => adminManagementApi.createPayout({
      hotel_id: Number(form.hotel_id),
      period_start: form.period_start,
      period_end: form.period_end,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payouts'] })
      setModal(false)
      setForm({ hotel_id: '', period_start: '', period_end: '' })
      toast.success('Payout created')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed to create payout'),
  })

  const processMutation = useMutation({
    mutationFn: (id: number) => adminManagementApi.processPayout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payouts'] })
      toast.success('Payout marked as processed')
    },
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const getHotelName = (id: number) => hotels.find((h: any) => h.id === id)?.name ?? `Hotel #${id}`

  const totalPending   = payouts.filter((p: any) => p.status === 'pending').reduce((s: number, p: any) => s + p.net_amount, 0)
  const totalProcessed = payouts.filter((p: any) => p.status === 'processed').reduce((s: number, p: any) => s + p.net_amount, 0)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Payout Management"
        subtitle="Track and process hotel net payments after commission deduction"
        action={<Button onClick={() => setModal(true)}><Plus size={14} /> Create Payout</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Payouts"    value={payouts.length}             icon={<DollarSign size={24} />} delay={0} />
        <StatCard label="Pending Amount"   value={`$${totalPending.toFixed(2)}`}   icon={<Clock       size={24} />} delay={0.08} />
        <StatCard label="Processed Amount" value={`$${totalProcessed.toFixed(2)}`} icon={<CheckCircle size={24} />} delay={0.16} />
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-16">
          <DollarSign size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-xl text-noir-500 italic">No payouts yet</p>
          <p className="text-xs text-noir-600 font-sans mt-1 mb-4">Create a payout to track hotel net earnings</p>
          <Button onClick={() => setModal(true)} size="sm"><Plus size={13} /> Create First Payout</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p: any, i: number) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white/[0.02] border border-white/8 rounded-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
                  p.status === 'processed' ? 'bg-emerald-500/40' : 'bg-amber-500/40'
                }`} />
                <div>
                  <p className="text-sm text-noir-200 font-sans font-medium">{getHotelName(p.hotel_id)}</p>
                  <p className="text-xs text-noir-500 font-sans mt-0.5">
                    {new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {new Date(p.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="hidden sm:flex items-center gap-6 text-sm font-sans text-noir-500">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 mb-0.5">Gross</p>
                  <p className="text-noir-300">${p.gross_amount.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 mb-0.5">Commission</p>
                  <p className="text-red-400">−${p.commission.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-noir-600 mb-0.5">Net</p>
                  <p className="font-display text-lg text-gold-300">${p.net_amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge status={p.status}>{p.status}</Badge>
                {p.status === 'pending' && (
                  <Button variant="outline" size="sm"
                    loading={processMutation.isPending}
                    onClick={() => processMutation.mutate(p.id)}>
                    <CheckCircle size={12} /> Mark Paid
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create payout modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Payout">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Hotel</label>
            <select value={form.hotel_id} onChange={set('hotel_id')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              <option value="" className="bg-obsidian-950">Select hotel…</option>
              {hotels.filter((h: any) => h.status === 'approved').map((h: any) => (
                <option key={h.id} value={h.id} className="bg-obsidian-950">{h.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Period start" type="date" value={form.period_start} onChange={set('period_start')} />
            <Input label="Period end"   type="date" value={form.period_end}   onChange={set('period_end')} />
          </div>
          <p className="text-xs text-noir-600 font-sans">
            The system will calculate gross revenue, commission, and net amount from confirmed bookings in this period.
          </p>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" size="sm" onClick={() => setModal(false)}>Cancel</Button>
          <Button size="sm" loading={createMutation.isPending}
            disabled={!form.hotel_id || !form.period_start || !form.period_end}
            onClick={() => createMutation.mutate()}>
            Create Payout
          </Button>
        </div>
      </Modal>
    </div>
  )
}