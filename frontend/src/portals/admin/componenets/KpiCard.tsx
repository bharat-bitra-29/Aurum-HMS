import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  sub?: string
  trend?: number        // positive = up, negative = down, 0/undefined = neutral
  delay?: number
  onClick?: () => void
}

export default function KpiCard({ label, value, icon, sub, trend, delay = 0, onClick }: Props) {
  const TrendIcon =
    trend === undefined || trend === 0 ? Minus :
    trend > 0 ? TrendingUp : TrendingDown

  const trendColor =
    trend === undefined || trend === 0 ? 'text-noir-600' :
    trend > 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className={`
        relative bg-white/[0.03] border border-white/8 rounded-sm p-6 overflow-hidden
        hover:border-gold-600/20 transition-all duration-300 group
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Corner shimmer */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/[0.03] rounded-bl-full group-hover:bg-gold-500/[0.06] transition-all" />

      <div className="flex items-start justify-between mb-4">
        <div className="text-gold-600/50 group-hover:text-gold-500/70 transition-colors">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-sans ${trendColor}`}>
            <TrendIcon size={12} />
            {trend !== 0 && <span>{Math.abs(trend)}%</span>}
          </div>
        )}
      </div>

      <p className="text-[10px] uppercase tracking-[0.15em] text-noir-500 font-sans mb-2">{label}</p>
      <p className="font-display text-3xl text-gold-300 tracking-wide leading-none">{value}</p>
      {sub && <p className="text-xs text-noir-600 font-sans mt-2">{sub}</p>}

      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-gold-600/20 to-transparent" />
    </motion.div>
  )
}
