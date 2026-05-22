import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  checkIn:  string
  checkOut: string
  onCheckIn:  (date: string) => void
  onCheckOut: (date: string) => void
  minDate?: string
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function DateRangePicker({ checkIn, checkOut, onCheckIn, onCheckOut, minDate }: Props) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selecting, setSelecting] = useState<'in' | 'out'>('in')
  const [hovered, setHovered] = useState<string | null>(null)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days  = daysInMonth(year, month)
  const startDay = firstDayOfMonth(year, month)

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const minISO = minDate ?? toISO(today)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const handleDayClick = (iso: string) => {
    if (iso < minISO) return
    if (selecting === 'in') {
      onCheckIn(iso)
      if (checkOut && iso >= checkOut) onCheckOut('')
      setSelecting('out')
    } else {
      if (iso <= checkIn) {
        onCheckIn(iso)
        onCheckOut('')
        setSelecting('out')
      } else {
        onCheckOut(iso)
        setSelecting('in')
      }
    }
  }

  const isInRange = (iso: string) => {
    const end = hovered ?? checkOut
    if (!checkIn || !end) return false
    return iso > checkIn && iso < end
  }

  const cells: (string | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1)
      return toISO(d)
    }),
  ]

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-sm p-5 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth}
          className="p-1.5 text-noir-500 hover:text-gold-400 hover:bg-white/5 rounded-sm transition-all">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display text-base text-gold-300 tracking-wide">{monthLabel}</span>
        <button onClick={nextMonth}
          className="p-1.5 text-noir-500 hover:text-gold-400 hover:bg-white/5 rounded-sm transition-all">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[10px] uppercase tracking-[0.1em] text-noir-600 font-sans py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />
          const isStart    = iso === checkIn
          const isEnd      = iso === checkOut
          const inRange    = isInRange(iso)
          const isPast     = iso < minISO
          const isToday    = iso === toISO(today)

          return (
            <button
              key={iso}
              disabled={isPast}
              onMouseEnter={() => setHovered(iso)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleDayClick(iso)}
              className={`
                relative h-8 w-full text-xs font-sans transition-all duration-100 rounded-sm
                ${isPast ? 'text-noir-700 cursor-not-allowed' : 'cursor-pointer'}
                ${isStart || isEnd
                  ? 'bg-gold-500 text-obsidian-950 font-semibold z-10'
                  : inRange
                    ? 'bg-gold-600/15 text-gold-300'
                    : isPast
                      ? ''
                      : 'hover:bg-white/8 text-noir-200'}
                ${isToday && !isStart && !isEnd ? 'ring-1 ring-gold-600/30' : ''}
              `}
            >
              {new Date(iso + 'T00:00:00').getDate()}
            </button>
          )
        })}
      </div>

      {/* Selection status */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 text-xs font-sans">
        <div className={`flex items-center gap-1.5 ${selecting === 'in' ? 'text-gold-400' : 'text-noir-500'}`}>
          <Calendar size={11} />
          <span>{checkIn || 'Select check-in'}</span>
        </div>
        <span className="text-noir-700">→</span>
        <div className={`flex items-center gap-1.5 ${selecting === 'out' ? 'text-gold-400' : 'text-noir-500'}`}>
          <Calendar size={11} />
          <span>{checkOut || 'Select check-out'}</span>
        </div>
      </div>
    </div>
  )
}