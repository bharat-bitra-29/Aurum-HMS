import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'

export default function Search() {
  return (
    <div>
      {/* Hero */}
      <div className="relative mb-10 text-center py-16">
        <div className="absolute inset-0 -mx-6"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,137,26,0.06) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold-500/60 font-sans mb-3">
            Curated Luxury Stays
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-gold-300 mb-3 tracking-wide">
            Find Your<br /><em>Perfect Retreat</em>
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent mx-auto mb-4" />
          <p className="text-noir-500 font-sans text-sm tracking-wide">
            Exceptional properties, handpicked for the discerning traveller
          </p>
        </motion.div>
      </div>

      {/* Search bar with location autocomplete */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="max-w-3xl mx-auto mb-16"
      >
        <SearchBar />
      </motion.div>

      {/* Feature strip */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
      >
        {[
          { title: 'Location Search',      desc: 'Search by city, country, or hotel name with instant suggestions.' },
          { title: 'Curated Properties',   desc: 'Every hotel personally reviewed and approved by our team.' },
          { title: 'Flexible Cancellation', desc: 'Plans change. Cancel directly from your bookings dashboard.' },
        ].map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
            className="text-center"
          >
            <div className="h-px w-8 bg-gold-600/30 mx-auto mb-4" />
            <h3 className="font-display text-base text-gold-300/80 mb-2 tracking-wide">{f.title}</h3>
            <p className="text-xs text-noir-600 font-sans leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}