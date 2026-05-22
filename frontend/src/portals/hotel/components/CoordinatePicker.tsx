/**
 * CoordinatePicker.tsx - SIMPLIFIED & ROBUST VERSION
 * 
 * Simplified coordinate picker for hotel location
 * - Manual lat/lng input (primary method)
 * - Optional interactive map (if Leaflet loads)
 * - Always works, even if map fails
 */

import { useEffect, useRef, useState } from 'react'
import { MapPin, AlertCircle } from 'lucide-react'

interface CoordinatePickerProps {
  latitude: number
  longitude: number
  address?: string
  onCoordinateChange: (lat: number, lng: number) => void
}

export default function CoordinatePicker({
  latitude,
  longitude,
  address = '',
  onCoordinateChange,
}: CoordinatePickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [error, setError] = useState('')

  // Initialize map (optional - not required for form submission)
  useEffect(() => {
    if (!mapRef.current) return

    // Delay initialization to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const initializeMap = async () => {
    try {
      // Check if Leaflet is already loaded
      let L = (window as any).L

      if (!L) {
        // Load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => resolve(true)
          script.onerror = () => reject(new Error('Leaflet failed to load'))
          document.head.appendChild(script)
        })

        L = (window as any).L
      }

      if (!mapRef.current || !L) return

      // Create map
      const initialLat = latitude || 20
      const initialLng = longitude || 0
      const zoom = latitude !== 0 && longitude !== 0 ? 15 : 2

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([initialLat, initialLng], zoom)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      // Add marker
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
      }).addTo(map)

      marker.bindPopup('Drag to move • Click map to set location')

      // Click handler
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onCoordinateChange(lat, lng)
      })

      // Drag handler
      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onCoordinateChange(pos.lat, pos.lng)
      })

      mapInstanceRef.current = map
      setMapReady(true)
      setError('')
    } catch (err) {
      console.error('Map init failed:', err)
      setError('Map not available - use manual coordinate entry below')
      setMapReady(false)
    }
  }

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (!val) return
    const lat = parseFloat(val)
    if (!isNaN(lat) && lat >= -90 && lat <= 90) {
      onCoordinateChange(lat, longitude)
    }
  }

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (!val) return
    const lng = parseFloat(val)
    if (!isNaN(lng) && lng >= -180 && lng <= 180) {
      onCoordinateChange(latitude, lng)
    }
  }

  return (
    <div className="mb-6 p-4 bg-white/[0.02] border border-white/8 rounded-sm">
      {/* Header */}
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium mb-4">
        <MapPin size={14} className="text-gold-500" />
        Hotel Location Coordinates
      </label>

      {/* Info */}
      <div className="mb-4 p-3 bg-blue-950/30 border border-blue-800/30 rounded-sm">
        <p className="text-xs text-blue-300 font-sans">
          💡 <strong>Enter latitude and longitude below.</strong> You can use the map to help find coordinates, or enter them manually.
        </p>
      </div>

      {/* Error if map fails - but form still works */}
      {error && (
        <div className="mb-4 p-3 bg-amber-950/30 border border-amber-800/30 rounded-sm flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300 font-sans">{error}</p>
        </div>
      )}

      {/* Map container (optional) */}
      <div
        ref={mapRef}
        className="w-full rounded-sm mb-4 bg-noir-950 border border-white/8"
        style={{ height: '350px' }}
      />

      {/* Manual coordinate input - REQUIRED */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.1em] text-gold-400/80 block mb-2 font-sans font-medium">
            Latitude *
          </label>
          <input
            type="number"
            step="0.00001"
            min="-90"
            max="90"
            value={latitude || ''}
            onChange={handleLatChange}
            placeholder="e.g. 40.7128"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-noir-200 placeholder-noir-600 focus:outline-none focus:border-gold-600/50 focus:bg-white/10 transition"
          />
          <p className="text-[10px] text-noir-500 mt-1 font-sans">Range: -90 to 90</p>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.1em] text-gold-400/80 block mb-2 font-sans font-medium">
            Longitude *
          </label>
          <input
            type="number"
            step="0.00001"
            min="-180"
            max="180"
            value={longitude || ''}
            onChange={handleLngChange}
            placeholder="e.g. -74.0060"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-noir-200 placeholder-noir-600 focus:outline-none focus:border-gold-600/50 focus:bg-white/10 transition"
          />
          <p className="text-[10px] text-noir-500 mt-1 font-sans">Range: -180 to 180</p>
        </div>
      </div>

      {/* Display current coordinates */}
      {(latitude !== 0 || longitude !== 0) && (
        <div className="p-3 bg-gold-950/20 border border-gold-800/30 rounded-sm">
          <p className="text-xs text-gold-400 font-sans mb-1">
            <strong>Current Location:</strong>
          </p>
          <p className="text-sm text-gold-300 font-mono">
            {latitude.toFixed(5)}°, {longitude.toFixed(5)}°
          </p>
          {address && (
            <p className="text-xs text-noir-400 font-sans mt-2">
              📍 {address}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
