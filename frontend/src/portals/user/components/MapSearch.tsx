import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Loader2 } from 'lucide-react'
import { mapApi } from '../../../shared/api/user'

interface MapHotel {
  id: number; name: string; city: string; country: string
  latitude: number; longitude: number; star_rating: number
}

interface Props {
  onHotelSelect?: (hotel: MapHotel) => void
}

export default function MapSearch({ onHotelSelect }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const navigate  = useNavigate()
  const [hotels,  setHotels]  = useState<MapHotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    mapApi.getHotelsForMap()
      .then(setHotels)
      .catch(() => setError('Could not load hotels'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading || !mapRef.current) return

    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Dynamically load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => initMap()
    document.head.appendChild(script)

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [loading, hotels])

  const initMap = () => {
    const L = (window as any).L
    if (!L || !mapRef.current || leafletRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    })

    leafletRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Custom gold marker icon
    const goldIcon = L.divIcon({
      html: `<div style="
        width:28px;height:28px;background:linear-gradient(135deg,#c8891a,#e5a82e);
        border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.3);
        box-shadow:0 2px 8px rgba(200,137,26,0.5)">
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      className: '',
    })

    hotels.forEach(hotel => {
      const marker = L.marker([hotel.latitude, hotel.longitude], { icon: goldIcon })
      marker.bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;min-width:160px">
          <p style="font-weight:600;margin:0 0 4px;color:#1a1a14">${hotel.name}</p>
          <p style="font-size:12px;color:#6b7280;margin:0 0 8px">${hotel.city}, ${hotel.country}</p>
          <p style="font-size:11px;color:#c8891a;margin:0">${'★'.repeat(hotel.star_rating)}</p>
        </div>
      `, { maxWidth: 200 })
      marker.on('click', () => {
        if (onHotelSelect) onHotelSelect(hotel)
        else navigate(`/app/hotels/${hotel.id}`)
      })
      marker.addTo(map)
    })
  }

  const locateMe = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const L = (window as any).L
        if (L && leafletRef.current) {
          leafletRef.current.setView([pos.coords.latitude, pos.coords.longitude], 10)
        }
        setLocating(false)
      },
      () => { setLocating(false) }
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-gold-300 tracking-wide">Hotel Map</h2>
        <button
          onClick={locateMe}
          disabled={locating}
          className="flex items-center gap-2 text-xs font-sans text-gold-400/70 hover:text-gold-400 transition-colors border border-gold-600/20 rounded-sm px-3 py-1.5 hover:border-gold-600/40"
        >
          {locating
            ? <><Loader2 size={12} className="animate-spin" /> Locating…</>
            : <><MapPin size={12} /> Near me</>}
        </button>
      </div>

      <div className="relative rounded-sm overflow-hidden border border-white/10" style={{ height: 420 }}>
        {loading && (
          <div className="absolute inset-0 bg-obsidian-950 flex items-center justify-center z-10">
            <Loader2 size={28} className="animate-spin text-gold-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-obsidian-950 flex items-center justify-center">
            <p className="text-sm text-noir-500 font-sans">{error}</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {hotels.length > 0 && (
        <p className="mt-2 text-xs text-noir-600 font-sans text-right">
          {hotels.length} propert{hotels.length !== 1 ? 'ies' : 'y'} on map · Click a marker to view
        </p>
      )}
    </motion.div>
  )
}