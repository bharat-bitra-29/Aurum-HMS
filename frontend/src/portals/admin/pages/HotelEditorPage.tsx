import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Edit2, Save, MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { adminManagementApi } from '../../../shared/api/admin'
import { adminApi } from '../../../shared/api/admin'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Input from '../../../shared/components/Input'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'
import Modal from '../../../shared/components/Modal'
import toast from 'react-hot-toast'

export default function HotelEditorPage() {
  const qc = useQueryClient()
  const [search, setSearch]       = useState('')
  const [editing, setEditing]     = useState<any>(null)
  const [suspendModal, setSuspendModal] = useState<{ open: boolean; hotel: any | null }>({ open: false, hotel: null })
  const [suspendReason, setSuspendReason] = useState('')
  const [form, setForm]           = useState<any>({})

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: any) => adminManagementApi.editHotel(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      setEditing(null)
      toast.success('Hotel updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Update failed'),
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, reason }: any) => adminManagementApi.suspendHotel(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      setSuspendModal({ open: false, hotel: null })
      setSuspendReason('')
      toast.success('Hotel suspended')
    },
  })

  const reinstateMutation = useMutation({
    mutationFn: (id: number) => adminManagementApi.reinstateHotel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      toast.success('Hotel reinstated')
    },
  })

  const openEdit = (hotel: any) => {
    setEditing(hotel)
    setForm({
      name: hotel.name, description: hotel.description,
      city: hotel.city, country: hotel.country, address: hotel.address,
      star_rating: hotel.star_rating, latitude: hotel.latitude, longitude: hotel.longitude,
    })
  }
  const setF = (k: string) => (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value }))

  const filtered = hotels.filter((h: any) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Hotel Editor" subtitle="Edit hotel details and manage suspension status on behalf of properties" />

      {/* Search */}
      <div className="w-80 mb-6">
        <Input placeholder="Search hotels…" value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={14} />} />
      </div>

      <div className="space-y-3">
        {filtered.map((hotel: any, i: number) => (
          <motion.div key={hotel.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`bg-white/[0.02] border rounded-sm p-5 flex items-center justify-between gap-4 ${
              hotel.is_suspended ? 'border-red-800/30' : 'border-white/8'
            }`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {hotel.is_suspended && (
                <div className="w-1 h-10 bg-red-500/40 rounded-full flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm text-noir-100 font-medium font-sans truncate">{hotel.name}</p>
                  <Badge status={hotel.status}>{hotel.status}</Badge>
                  {hotel.is_suspended && <Badge variant="red">Suspended</Badge>}
                </div>
                <p className="text-xs text-noir-500 font-sans flex items-center gap-1">
                  <MapPin size={10} /> {hotel.city}, {hotel.country}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => openEdit(hotel)}>
                <Edit2 size={12} /> Edit
              </Button>
              {hotel.is_suspended ? (
                <Button variant="outline" size="sm"
                  loading={reinstateMutation.isPending}
                  onClick={() => reinstateMutation.mutate(hotel.id)}>
                  <CheckCircle size={12} /> Reinstate
                </Button>
              ) : hotel.status === 'approved' && (
                <Button variant="danger" size="sm"
                  onClick={() => { setSuspendModal({ open: true, hotel }); setSuspendReason('') }}>
                  <AlertTriangle size={12} /> Suspend
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit — ${editing.name}`} width="max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hotel name"   value={form.name}        onChange={setF('name')}        className="col-span-2" />
            <Input label="City"         value={form.city}        onChange={setF('city')} />
            <Input label="Country"      value={form.country}     onChange={setF('country')} />
            <Input label="Address"      value={form.address}     onChange={setF('address')}     className="col-span-2" />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Stars</label>
              <select value={form.star_rating} onChange={setF('star_rating')}
                className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
                {[1,2,3,4,5].map(n => <option key={n} value={n} className="bg-obsidian-950">{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div />
            <Input label="Latitude"  type="number" step="0.000001" value={form.latitude}  onChange={setF('latitude')}  placeholder="e.g. 25.2048" />
            <Input label="Longitude" type="number" step="0.000001" value={form.longitude} onChange={setF('longitude')} placeholder="e.g. 55.2708" />
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Description</label>
              <textarea value={form.description} onChange={setF('description')} rows={3}
                className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-5">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" loading={editMutation.isPending}
              onClick={() => editMutation.mutate({ id: editing.id, data: form })}>
              <Save size={13} /> Save Changes
            </Button>
          </div>
        </Modal>
      )}

      {/* Suspend modal */}
      <Modal open={suspendModal.open} onClose={() => setSuspendModal({ open: false, hotel: null })}
        title={`Suspend — ${suspendModal.hotel?.name}`} width="max-w-sm">
        <p className="text-sm text-noir-400 font-sans mb-4">
          This will immediately prevent guests from booking this hotel. The hotel admin will still be able to log in.
        </p>
        <Input label="Reason for suspension" value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
          placeholder="e.g. Pending documentation review" />
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" size="sm" onClick={() => setSuspendModal({ open: false, hotel: null })}>Cancel</Button>
          <Button variant="danger" size="sm" loading={suspendMutation.isPending}
            disabled={!suspendReason.trim()}
            onClick={() => suspendMutation.mutate({ id: suspendModal.hotel?.id, reason: suspendReason })}>
            <AlertTriangle size={13} /> Suspend Hotel
          </Button>
        </div>
      </Modal>
    </div>
  )
}