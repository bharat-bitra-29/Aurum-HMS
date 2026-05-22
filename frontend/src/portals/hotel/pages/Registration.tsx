/**
 * UPDATED Registration.tsx with Coordinate Picker Integration
 * 
 * Key changes:
 * 1. Add latitude & longitude to form state
 * 2. Import CoordinatePicker component
 * 3. Add CoordinatePicker to the form JSX
 * 4. Send coordinates to backend API
 * 
 * Place this: frontend/src/portals/hotel/pages/Registration.tsx
 * 
 * REPLACE THE EXISTING FILE with this updated version
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Building, Clock, CheckCircle, XCircle } from 'lucide-react'
import { hotelApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Input from '../../../shared/components/Input'
import Button from '../../../shared/components/Button'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'
import toast from 'react-hot-toast'
import CoordinatePicker from '../components/CoordinatePicker'

const AMENITIES = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Room Service', 'Concierge', 'Business Center']

export default function Registration() {
  const qc = useQueryClient()
  const { data: hotel, isLoading } = useQuery({ queryKey: ['my-hotel'], queryFn: hotelApi.getMyHotel })

  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '', country: '',
    phone: '', email: '', star_rating: 3, amenities: [] as string[],
    latitude: 0, longitude: 0,
  })

  const registerMutation = useMutation({
    mutationFn: () => hotelApi.register(form),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['my-hotel'] })
      toast.success('Hotel registered! Awaiting approval.')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Registration failed'),
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleAmenity = (a: string) =>
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  /* Show status if already registered */
  if (hotel) {
    const icons: Record<string, any> = {
      pending: <Clock size={40} className="text-amber-400" />,
      approved: <CheckCircle size={40} className="text-emerald-400" />,
      rejected: <XCircle size={40} className="text-red-400" />,
    }
    return (
      <div>
        <PageHeader title="My Hotel" subtitle="Your hotel profile and approval status" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white/[0.02] border border-white/8 rounded-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-gold-300 tracking-wide mb-1">{hotel.name}</h2>
                <p className="text-sm text-noir-500 font-sans">{hotel.city}, {hotel.country}</p>
              </div>
              <Badge status={hotel.status}>{hotel.status}</Badge>
            </div>
            <p className="text-sm text-noir-400 font-sans leading-relaxed mb-6">{hotel.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm font-sans">
              {[['Address', hotel.address], ['Phone', hotel.phone], ['Email', hotel.email], ['Stars', `${hotel.star_rating} ★`]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 mb-1">{k}</p>
                  <p className="text-noir-300">{v}</p>
                </div>
              ))}
            </div>
            {/* NEW: Display coordinates if set */}
            {(hotel.latitude || hotel.longitude) && (
              <div className="mt-6 p-4 bg-gold-950/20 border border-gold-800/30 rounded-sm">
                <p className="text-[10px] uppercase tracking-[0.1em] text-gold-500 mb-1 font-sans">Location Coordinates</p>
                <p className="text-sm text-gold-300 font-mono">{hotel.latitude.toFixed(4)}°, {hotel.longitude.toFixed(4)}°</p>
              </div>
            )}
            {hotel.rejection_reason && (
              <div className="mt-6 p-4 bg-red-950/30 border border-red-800/30 rounded-sm">
                <p className="text-[10px] uppercase tracking-[0.1em] text-red-500 mb-1 font-sans">Rejection Reason</p>
                <p className="text-sm text-red-300 font-sans">{hotel.rejection_reason}</p>
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm p-6 flex flex-col items-center justify-center text-center gap-4">
            {icons[hotel.status]}
            <div>
              <p className="font-display text-lg text-gold-300 tracking-wide mb-1">
                {hotel.status === 'pending' ? 'Under Review' : hotel.status === 'approved' ? 'Approved' : 'Rejected'}
              </p>
              <p className="text-sm text-noir-500 font-sans">
                {hotel.status === 'pending' ? 'The platform admin will review your application shortly.' :
                 hotel.status === 'approved' ? 'Your hotel is live and accepting bookings.' :
                 'Please contact support or re-register with corrected information.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Register Hotel" subtitle="Submit your property for platform approval" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/[0.02] border border-white/8 rounded-sm p-8">
        
        {/* Row 1: Hotel Name & Star Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="Hotel name" value={form.name} onChange={set('name')} placeholder="Grand Aurum Palace" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Star rating</label>
            <select value={form.star_rating} onChange={set('star_rating')}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: City & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="City" value={form.city} onChange={set('city')} placeholder="Dubai" required />
          <Input label="Country" value={form.country} onChange={set('country')} placeholder="UAE" required />
        </div>

        {/* Row 3: Address (Full Width) */}
        <Input label="Address" value={form.address} onChange={set('address')} placeholder="Sheikh Zayed Road" required className="mb-4" />

        {/* Row 4: Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+971 4 000 0000" />
          <Input label="Email" value={form.email} onChange={set('email')} placeholder="info@hotel.com" type="email" />
        </div>

        {/* Row 5: Description */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe your property..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all resize-none placeholder:text-noir-600" />
        </div>

        {/* Row 6: Coordinate Picker (MAP) */}
        <CoordinatePicker
          latitude={form.latitude}
          longitude={form.longitude}
          address={`${form.address}, ${form.city}, ${form.country}`}
          onCoordinateChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
        />

        {/* Row 7: Amenities */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium mb-3">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 text-xs rounded-sm border font-sans transition-all ${
                  form.amenities.includes(a) ? 'bg-gold-600/15 border-gold-600/30 text-gold-300' : 'bg-white/[0.02] border-white/10 text-noir-400 hover:border-white/20'
                }`}>{a}</button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button size="lg" loading={registerMutation.isPending} onClick={() => registerMutation.mutate()}>
          <Building size={14} /> Submit for Approval
        </Button>
      </motion.div>
    </div>
  )
}
