import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MapSearch from '../components/MapSearch'
import PageHeader from '../../../shared/components/PageHeader'

export default function MapSearchPage() {
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader
        title="Explore on Map"
        subtitle="Browse luxury properties by location — drag the map to discover hotels near you"
      />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <MapSearch onHotelSelect={(hotel) => navigate(`/app/hotels/${hotel.id}`)} />
      </motion.div>
      <div className="mt-6 p-4 bg-white/[0.02] border border-white/8 rounded-sm">
        <p className="text-xs text-noir-600 font-sans">
          💡 <strong className="text-noir-400">Tip:</strong> Hotels are shown on the map once coordinates are set by the hotel admin.
          Use the <strong className="text-noir-400">Near me</strong> button to centre the map on your current location.
        </p>
      </div>
    </div>
  )
}