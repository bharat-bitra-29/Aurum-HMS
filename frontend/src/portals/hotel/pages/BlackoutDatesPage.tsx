import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Trash2, CalendarOff } from 'lucide-react'
import { hotelPropertyApi, hotelApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import toast from 'react-hot-toast'

const REASONS = ['Maintenance', 'Renovation', 'Owner Occupied', 'Deep Cleaning', 'Out of Service', 'Other']

export default function BlackoutDatesPage() {
  const qc = useQueryClient()
  const [modal, setModal]       = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm]         = useState({ room_id: '', start_date: '', end_date: '', reason: 'Maintenance' })

  const { data: blackouts = [], isLoading } = useQuery({
    queryKey: ['hotel-blackouts'],
    queryFn: hotelPropertyApi.getBlackouts,
  })

  const { data: rooms = [] } = useQuery({
    queryKey: ['hotel-rooms'],
    queryFn: hotelApi.getRooms,
  })

  const addMutation = useMutation({
    mutationFn: () => hotelPropertyApi.addBlackout({
      room_id: Number(form.room_id),
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-blackouts'] })
      setModal(false)
      setForm({ room_id: '', start_date: '', end_date: '', reason: 'Maintenance' })
      toast.success('Blackout period added')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelPropertyApi.deleteBlackout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-blackouts'] })
      setDeleteId(null)
      toast.success('Blackout removed')
    },
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const getRoomName = (id: number) => rooms.find((r: any) => r.id === id)?.name ?? `Room #${id}`

  const nightsBetween = (s: string, e: string) =>
    s && e ? Math.max(0, (new Date(e).getTime() - new Date(s).getTime()) / 86_400_000) : 0

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  // Group by room for display
  const byRoom: Record<number, any[]> = {}
  blackouts.forEach((bd: any) => {
    if (!byRoom[bd.room_id]) byRoom[bd.room_id] = []
    byRoom[bd.room_id].push(bd)
  })

  return (
    <div>
      <PageHeader
        title="Blackout Dates"
        subtitle="Block rooms from booking — maintenance, renovation, or any unavailability"
        action={<Button onClick={() => setModal(true)}><Plus size={14} /> Add Blackout</Button>}
      />

      {blackouts.length === 0 ? (
        <div className="text-center py-16">
          <CalendarOff size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-xl text-noir-500 italic">No blackout dates set</p>
          <p className="text-xs text-noir-600 font-sans mt-1 mb-4">
            Add blackout periods to prevent bookings during maintenance or other unavailability
          </p>
          <Button onClick={() => setModal(true)} size="sm"><Plus size={13} /> Add First Blackout</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byRoom).map(([roomId, bds]) => (
            <motion.div key={roomId}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-white/8 bg-white/[0.02]">
                <p className="font-sans text-sm font-medium text-noir-200">
                  {getRoomName(Number(roomId))}
                </p>
                <p className="text-[10px] text-noir-600 font-sans mt-0.5">
                  {bds.length} blackout period{bds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {bds.map((bd: any) => {
                  const nights = nightsBetween(bd.start_date, bd.end_date)
                  return (
                    <div key={bd.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-8 rounded-full bg-red-500/40 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-noir-200 font-sans">
                            {new Date(bd.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' → '}
                            {new Date(bd.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-noir-500 font-sans mt-0.5">
                            {bd.reason} · {nights} night{nights !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 bg-red-950/40 border border-red-800/30 rounded-sm text-red-400 font-sans uppercase tracking-wide">
                          Blocked
                        </span>
                        <button onClick={() => setDeleteId(bd.id)}
                          className="text-noir-600 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Blackout Period">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Room</label>
            <select value={form.room_id} onChange={set('room_id')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              <option value="" className="bg-obsidian-950">Select room…</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.id} className="bg-obsidian-950">{r.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start date" type="date" value={form.start_date} onChange={set('start_date')}
              min={new Date().toISOString().split('T')[0]} />
            <Input label="End date" type="date" value={form.end_date} onChange={set('end_date')}
              min={form.start_date || new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Reason</label>
            <select value={form.reason} onChange={set('reason')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              {REASONS.map(r => <option key={r} value={r} className="bg-obsidian-950">{r}</option>)}
            </select>
          </div>
          {form.start_date && form.end_date && nightsBetween(form.start_date, form.end_date) > 0 && (
            <p className="text-xs text-gold-400/60 font-sans">
              {nightsBetween(form.start_date, form.end_date)} night{nightsBetween(form.start_date, form.end_date) !== 1 ? 's' : ''} will be blocked
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" size="sm" onClick={() => setModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={addMutation.isPending}
            disabled={!form.room_id || !form.start_date || !form.end_date}
            onClick={() => addMutation.mutate()}>
            Block Dates
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)} loading={deleteMutation.isPending}
        title="Remove Blackout" message="This will unblock the dates and allow bookings again."
        confirmLabel="Remove Blackout" variant="gold" />
    </div>
  )
}