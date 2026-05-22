import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { userApi } from '../../../shared/api/user'

interface Props {
  hotelId?: number
  roomId?:  number
  onDateSelect?: (date: string) => void
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Colour intensity based on price relative to range
function priceColor(price: number | null, min: number, max: number): string {
  if (price === null) return 'bg-noir-900/30 text-noir-700'
  if (min === max) return 'bg-gold-700/20 text-gold-400'
  const ratio = (price - min) / (max - min)
  if (ratio < 0.25) return 'bg-emerald-900/50 text-emerald-300'
  if (ratio < 0.5)  return 'bg-gold-900/40 text-gold-300'
  if (ratio < 0.75) return 'bg-amber-900/40 text-amber-300'
  return 'bg-red-950/40 text-red-300'
}

export default function PriceCalendar({ hotelId, roomId, onDateSelect }: Props) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Build simulated price data for the month (in real app, call API per date range)
    setLoading(true)
    const map: Record<string, number> = {}
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Simulate: weekends are pricier, mid-month slightly cheaper
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = isoDate(year, month, d)
      const dow = new Date(year, month, d).getDay()
      const base = 150 + Math.floor(Math.random() * 100)
      const multiplier = (dow === 0 || dow === 6) ? 1.4 : (d >= 10 && d <= 20) ? 0.85 : 1.0
      map[iso] = Math.round(base * multiplier)
    }
    setPrices(map)
    setLoading(false)
  }, [year, month, hotelId, roomId])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const monthLabel   = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const priceValues  = Object.values(prices).filter(Boolean)
  const minPrice     = priceValues.length ? Math.min(...priceValues) : 0
  const maxPrice     = priceValues.length ? Math.max(...priceValues) : 0
  const todayISO     = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 text-noir-500 hover:text-gold-400 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <h3 className="font-display text-base text-gold-300 tracking-wide">{monthLabel}</h3>
          <p className="text-[10px] text-noir-600 font-sans mt-0.5">Price per night</p>
        </div>
        <button onClick={nextMonth} className="p-1.5 text-noir-500 hover:text-gold-400 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] text-noir-600 font-sans py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const iso = isoDate(year, month, day)
          const price = prices[iso] ?? null
          const isPast = iso < todayISO
          const colorClass = isPast ? 'bg-noir-900/20 text-noir-700 cursor-not-allowed' : priceColor(price, minPrice, maxPrice)

          return (
            <motion.button
              key={iso}
              whileHover={!isPast ? { scale: 1.05 } : {}}
              onClick={() => !isPast && onDateSelect?.(iso)}
              disabled={isPast}
              className={`rounded-sm p-1 text-center transition-all ${colorClass}`}
            >
              <span className="block text-xs font-sans">{day}</span>
              {price && !isPast && (
                <span className="block text-[9px] font-mono leading-none">${price}</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
        <span className="text-[10px] text-noir-600 font-sans">Price:</span>
        {[
          { cls: 'bg-emerald-900/50', label: 'Low' },
          { cls: 'bg-gold-900/40',    label: 'Mid' },
          { cls: 'bg-amber-900/40',   label: 'High' },
          { cls: 'bg-red-950/40',     label: 'Peak' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${cls}`} />
            <span className="text-[10px] text-noir-500 font-sans">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-noir-600 font-sans">
          ${minPrice}–${maxPrice}
        </span>
      </div>
    </div>
  )
}
