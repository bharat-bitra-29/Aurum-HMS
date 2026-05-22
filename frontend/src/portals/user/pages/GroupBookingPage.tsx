import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Users, Building, CalendarDays } from 'lucide-react'
import { groupBookingApi, userApi } from '../../../shared/api/user'
import PageHeader from '../../../shared/components/PageHeader'
import Input from '../../../shared/components/Input'
import Button from '../../../shared/components/Button'
import Badge from '../../../shared/components/Badge'
import toast from 'react-hot-toast'

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'presidential']

export default function GroupBookingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    hotel_id: '',
    room_type: 'standard',
    num_rooms: 5,
    check_in: '',
    check_out: '',
    guests_per_room: 2,
    special_requests: '',
    contact_name: '',
    contact_phone: '',
  })

  // Load approved hotels for selection
  const { data: hotels = [] } = useQuery({
    queryKey: ['search-all'],
    queryFn: () => userApi.search({}),
  })

  // Load existing group bookings
  const { data: groupBookings = [] } = useQuery({
    queryKey: ['group-bookings'],
    queryFn: groupBookingApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => groupBookingApi.create({
      ...form,
      hotel_id: Number(form.hotel_id),
      num_rooms: Number(form.num_rooms),
      guests_per_room: Number(form.guests_per_room),
    }),
    onSuccess: () => {
      toast.success('Group booking request submitted!')
      navigate('/app/bookings')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Submission failed'),
  })

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

  const nights = form.check_in && form.check_out
    ? Math.max(0, (new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86_400_000)
    : 0

  const selectedHotel = hotels.find((h: any) => h.id === Number(form.hotel_id))
  const estimatedBase = selectedHotel
    ? selectedHotel.min_price * nights * Number(form.num_rooms)
    : 0
  const discount = estimatedBase * 0.10
  const estimatedTotal = estimatedBase - discount

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Group Booking"
        subtitle="Book 5 or more rooms and receive an automatic 10% group discount"
      />

      {/* Discount banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 bg-gold-900/20 border border-gold-600/20 rounded-sm mb-6">
        <div className="text-2xl">🎉</div>
        <div>
          <p className="text-sm font-sans font-medium text-gold-300">10% Group Discount Applied Automatically</p>
          <p className="text-xs text-noir-500 font-sans mt-0.5">Available for bookings of 5 or more rooms of the same type</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm p-6 space-y-4">

        {/* Hotel selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">
            Select Hotel
          </label>
          <select value={form.hotel_id} onChange={set('hotel_id')}
            className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
            <option value="" className="bg-obsidian-950">Choose a hotel…</option>
            {hotels.map((h: any) => (
              <option key={h.id} value={h.id} className="bg-obsidian-950">
                {h.name} — {h.city} (from ${h.min_price}/night)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Room type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Room Type</label>
            <select value={form.room_type} onChange={set('room_type')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              {ROOM_TYPES.map(t => (
                <option key={t} value={t} className="bg-obsidian-950 capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Number of rooms */}
          <div>
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">
              Number of Rooms (min 5)
            </label>
            <input type="number" min={5} max={50} value={form.num_rooms}
              onChange={e => setForm(f => ({ ...f, num_rooms: Number(e.target.value) }))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60" />
          </div>

          <Input label="Check-in" type="date" value={form.check_in} onChange={set('check_in')}
            min={new Date().toISOString().split('T')[0]} />
          <Input label="Check-out" type="date" value={form.check_out} onChange={set('check_out')}
            min={form.check_in || new Date().toISOString().split('T')[0]} />
          <Input label="Guests per room" type="number" min={1} max={10}
            value={form.guests_per_room}
            onChange={e => setForm(f => ({ ...f, guests_per_room: Number(e.target.value) }))} />
          <Input label="Contact phone" value={form.contact_phone} onChange={set('contact_phone')} placeholder="+91 98765 43210" />
        </div>

        <Input label="Contact name" value={form.contact_name} onChange={set('contact_name')} placeholder="Group coordinator name" />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Special Requests</label>
          <textarea value={form.special_requests} onChange={set('special_requests')} rows={2}
            placeholder="Adjacent rooms, specific floor, dietary requirements…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 resize-none placeholder:text-noir-600" />
        </div>

        {/* Estimate */}
        {estimatedBase > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 bg-white/[0.02] border border-gold-600/15 rounded-sm space-y-2">
            <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans">Estimated Cost</p>
            <div className="flex justify-between text-sm font-sans">
              <span className="text-noir-500">{form.num_rooms} rooms × {nights} nights</span>
              <span className="text-noir-300">${estimatedBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-sans text-emerald-400">
              <span>Group discount (10%)</span>
              <span>−${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-2 font-sans">
              <span className="text-noir-300 font-medium">Total</span>
              <span className="font-display text-xl text-gold-300">${estimatedTotal.toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        <Button size="lg" className="w-full" loading={createMutation.isPending}
          disabled={!form.hotel_id || !form.check_in || !form.check_out || Number(form.num_rooms) < 5}
          onClick={() => createMutation.mutate()}>
          <Users size={14} /> Submit Group Booking Request
        </Button>
      </motion.div>

      {/* Existing group bookings */}
      {groupBookings.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-8">
          <h2 className="font-display text-lg text-gold-300/80 mb-4 tracking-wide">Your Group Bookings</h2>
          <div className="space-y-3">
            {groupBookings.map((gb: any) => (
              <div key={gb.id} className="bg-white/[0.02] border border-white/8 rounded-sm p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-noir-200 font-sans font-medium">
                    {gb.num_rooms} rooms · {gb.room_type}
                  </p>
                  <p className="text-xs text-noir-500 font-sans mt-0.5">
                    {new Date(gb.check_in).toLocaleDateString()} → {new Date(gb.check_out).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-gold-300">${gb.total_amount.toFixed(2)}</p>
                  <Badge status={gb.status}>{gb.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}