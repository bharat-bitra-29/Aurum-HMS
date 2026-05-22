import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

interface DataPoint { month: string; amount: number }

interface Props {
  data: DataPoint[]
  title?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-obsidian-950 border border-white/10 rounded-sm px-3 py-2 shadow-xl">
        <p className="text-[10px] uppercase tracking-[0.1em] text-noir-500 font-sans mb-1">{label}</p>
        <p className="font-display text-lg text-gold-300">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data, title = 'Monthly Revenue' }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-noir-600 font-display italic text-base">
        No revenue data yet
      </div>
    )
  }

  const max = Math.max(...data.map(d => d.amount))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      {title && (
        <h3 className="font-display text-lg text-gold-300/80 mb-5 tracking-wide">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#4e4e4e', fontSize: 11, fontFamily: 'DM Mono' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: '#4e4e4e', fontSize: 11, fontFamily: 'DM Mono' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,137,26,0.04)' }} />
          <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.amount === max
                  ? 'rgba(200,137,26,0.85)'
                  : 'rgba(200,137,26,0.35)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
