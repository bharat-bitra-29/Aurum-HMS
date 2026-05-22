import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, BedDouble } from 'lucide-react'
import { useRooms } from '../hooks/useRooms'
import RoomCard from '../components/RoomCard'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'presidential']
const AMENITIES  = ['Air Conditioning', 'Mini Bar', 'Sea View', 'King Bed', 'Jacuzzi', 'Balcony', 'Smart TV', 'Safe', 'Bathrobe', 'Butler Service', 'City View', 'Pool Access']
const EMPTY = { name: '', description: '', room_type: 'standard', price_per_night: '', capacity: 2, amenities: [] as string[] }

export default function Rooms() {
  const { rooms, isLoading, add, update, remove, toggle, saving, deleting } = useRooms()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<any>(null)
  const [form,      setForm]      = useState({ ...EMPTY })
  const [deleteId,  setDeleteId]  = useState<number | null>(null)

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY }); setModalOpen(true) }
  const openEdit = (room: any) => {
    const amenities = (() => { try { return JSON.parse(room.amenities) } catch { return [] } })()
    setEditing(room)
    setForm({ name: room.name, description: room.description, room_type: room.room_type,
               price_per_night: room.price_per_night, capacity: room.capacity, amenities })
    setModalOpen(true)
  }

  const handleSave = () => {
    const payload = { ...form, price_per_night: Number(form.price_per_night) }
    if (editing) {
      update({ id: editing.id, data: payload }, { onSuccess: () => setModalOpen(false) })
    } else {
      add(payload, { onSuccess: () => { setModalOpen(false); setForm({ ...EMPTY }) } })
    }
  }

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleAmenity = (a: string) =>
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x: string) => x !== a) : [...f.amenities, a] }))

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Rooms"
        subtitle={`${rooms.length} room${rooms.length !== 1 ? 's' : ''} · ${rooms.filter((r: any) => r.is_available).length} available`}
        action={<Button onClick={openAdd}><Plus size={14} /> Add Room</Button>}
      />

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <BedDouble size={48} className="text-gold-600/15" />
          <p className="font-display text-2xl text-noir-500 italic">No rooms yet</p>
          <p className="text-sm text-noir-600 font-sans">Add your first room to start accepting bookings</p>
          <Button onClick={openAdd}><Plus size={13} /> Add First Room</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room: any, i: number) => (
            <RoomCard
              key={room.id}
              room={room}
              delay={i * 0.05}
              onEdit={openEdit}
              onDelete={id => setDeleteId(id)}
              onToggle={toggle}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Room' : 'Add New Room'} width="max-w-xl">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Room name" value={form.name} onChange={set('name')}
            placeholder="Presidential Suite" className="col-span-2" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Type</label>
            <select value={form.room_type} onChange={set('room_type')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60">
              {ROOM_TYPES.map(t => (
                <option key={t} value={t} className="bg-obsidian-950 capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <Input label="Capacity (guests)" type="number" min={1} max={20}
            value={form.capacity} onChange={set('capacity')} />
          <Input label="Price per night ($)" type="number" placeholder="0.00"
            value={form.price_per_night} onChange={set('price_per_night')} className="col-span-2" />
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Describe this room…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 resize-none placeholder:text-noir-600" />
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 text-xs rounded-sm border font-sans transition-all ${
                  form.amenities.includes(a)
                    ? 'bg-gold-600/15 border-gold-600/30 text-gold-300'
                    : 'bg-white/[0.02] border-white/10 text-noir-400 hover:border-white/20'
                }`}>{a}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            {editing ? 'Save Changes' : 'Add Room'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => remove(deleteId!, { onSuccess: () => setDeleteId(null) })}
        loading={deleting}
        title="Delete Room"
        message="This will permanently remove the room and cannot be undone."
        confirmLabel="Delete Room"
      />
    </div>
  )
}
