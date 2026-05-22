import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  sub?: string
  delay?: number
}

export default function StatCard({ label, value, icon, sub, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative bg-white/[0.03] border border-white/8 rounded-sm p-6 overflow-hidden group hover:border-gold-600/20 transition-all duration-300"
    >
      {/* corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/[0.03] rounded-bl-full" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-noir-500 font-sans mb-3">{label}</p>
          <p className="font-display text-3xl text-gold-300 tracking-wide">{value}</p>
          {sub && <p className="text-xs text-noir-500 font-sans mt-1">{sub}</p>}
        </div>
        <div className="text-gold-600/50 group-hover:text-gold-500/70 transition-colors">
          {icon}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold-600/20 to-transparent" />
    </motion.div>
  )
}