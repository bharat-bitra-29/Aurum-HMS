import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, Image, Plus } from 'lucide-react'
import { hotelPropertyApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import toast from 'react-hot-toast'

export default function PhotoGallery() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null) // null = hotel-level
  const [deleteId, setDeleteId]         = useState<number | null>(null)
  const [caption, setCaption]           = useState('')

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['hotel-photos', activeRoomId],
    queryFn: () => hotelPropertyApi.getPhotos(activeRoomId ?? undefined),
  })

  const uploadMutation = useMutation({
    mutationFn: (data_url: string) =>
      hotelPropertyApi.uploadPhoto({ data_url, caption, room_id: activeRoomId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-photos'] })
      setCaption('')
      toast.success('Photo uploaded')
    },
    onError: () => toast.error('Upload failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hotelPropertyApi.deletePhoto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-photos'] })
      setDeleteId(null)
      toast.success('Photo deleted')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return }
    const reader = new FileReader()
    reader.onload = () => uploadMutation.mutate(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Photo Gallery" subtitle="Upload photos for your hotel and rooms" />

      {/* Tab: Hotel vs Room */}
      <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] border border-white/8 rounded-sm w-fit">
        {[{ id: null, label: 'Hotel Photos' }].map(({ id, label }) => (
          <button key="hotel" onClick={() => setActiveRoomId(id)}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm font-sans transition-all ${
              activeRoomId === null ? 'bg-gold-600/15 text-gold-300 border border-gold-600/20' : 'text-noir-500 hover:text-noir-300'
            }`}>{label}</button>
        ))}
      </div>

      {/* Upload area */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 border-2 border-dashed border-white/10 rounded-sm p-8 text-center hover:border-gold-600/30 transition-all cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <Upload size={32} className="text-gold-600/30 mx-auto mb-3" />
        <p className="text-sm text-noir-400 font-sans">Click to upload or drag & drop</p>
        <p className="text-xs text-noir-600 font-sans mt-1">PNG, JPG up to 5MB</p>
        {uploadMutation.isPending && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gold-400 font-sans">
            <Spinner size={14} /> Uploading…
          </div>
        )}
      </motion.div>

      {/* Caption input */}
      <div className="mb-6 flex gap-3">
        <input value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Photo caption (optional)"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60" />
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <Image size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-lg text-noir-500 italic">No photos yet</p>
          <p className="text-xs text-noir-600 font-sans mt-1">Upload photos to showcase your property</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {photos.map((photo: any, i: number) => (
              <motion.div key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}
                className="relative group rounded-sm overflow-hidden border border-white/8 aspect-video bg-obsidian-950">
                <img src={photo.url} alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => setDeleteId(photo.id)}
                    className="p-2 bg-red-950/80 border border-red-800/50 rounded-sm text-red-300 hover:bg-red-900/80 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <p className="text-[10px] text-white/80 font-sans truncate">{photo.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId!)} loading={deleteMutation.isPending}
        title="Delete Photo" message="This will permanently delete the photo."
        confirmLabel="Delete" />
    </div>
  )
}