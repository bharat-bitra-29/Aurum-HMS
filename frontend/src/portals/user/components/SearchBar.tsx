import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Users, Search, Loader2 } from 'lucide-react'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import client from '../../../shared/api/client'
import Button from '../../../shared/components/Button'

interface SearchValues {
  location: string
  check_in:  string
  check_out: string
  guests:    number
  min_price: string
  max_price: string
}

interface Props {
  initialValues?: Partial<SearchValues>
  compact?: boolean       // smaller variant for results page
}

export default function SearchBar({ initialValues = {}, compact = false }: Props) {
  const navigate = useNavigate()

  const [form, setForm] = useState<SearchValues>({
    location:  initialValues.location  ?? '',
    check_in:  initialValues.check_in  ?? '',
    check_out: initialValues.check_out ?? '',
    guests:    initialValues.guests    ?? 1,
    min_price: initialValues.min_price ?? '',
    max_price: initialValues.max_price ?? '',
  })

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedLocation = useDebounce(form.location, 300)

  // Fetch suggestions whenever debounced location changes
  useEffect(() => {
    if (debouncedLocation.length < 2) { setSuggestions([]); return }
    setLoadingSuggestions(true)
    client
      .get('/user/search/suggestions', { params: { q: debouncedLocation } })
      .then(r => setSuggestions(r.data))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false))
  }, [debouncedLocation])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current  && !inputRef.current.contains(e.target as Node)
      ) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const set = (k: keyof SearchValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (form.location)  params.set('location',  form.location)
    if (form.check_in)  params.set('check_in',  form.check_in)
    if (form.check_out) params.set('check_out', form.check_out)
    if (form.guests > 1) params.set('guests',   String(form.guests))
    if (form.min_price) params.set('min_price', form.min_price)
    if (form.max_price) params.set('max_price', form.max_price)
    navigate(`/app/results?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setShowSuggestions(false); handleSearch() }
    if (e.key === 'Escape') setShowSuggestions(false)
  }

  const selectSuggestion = (s: string) => {
    setForm(f => ({ ...f, location: s }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-end gap-3 p-4 bg-white/[0.02] border border-white/8 rounded-sm">
        {/* Location */}
        <div className="relative flex-1 min-w-[180px]">
          <label className="text-[10px] uppercase tracking-[0.12em] text-gold-400/70 font-sans block mb-1">Location</label>
          <div className="relative">
            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
            <input
              ref={inputRef}
              value={form.location}
              onChange={set('location')}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="City or country"
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm pl-9 pr-4 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all placeholder:text-noir-600"
            />
            {loadingSuggestions && (
              <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 animate-spin" />
            )}
          </div>
          <SuggestionDropdown
            ref={dropdownRef}
            show={showSuggestions && suggestions.length > 0}
            suggestions={suggestions}
            onSelect={selectSuggestion}
          />
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] text-gold-400/70 font-sans block mb-1">In</label>
            <input type="date" value={form.check_in} onChange={set('check_in')} min={new Date().toISOString().split('T')[0]}
              className="bg-white/[0.03] border border-white/10 rounded-sm px-3 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.12em] text-gold-400/70 font-sans block mb-1">Out</label>
            <input type="date" value={form.check_out} onChange={set('check_out')} min={form.check_in || new Date().toISOString().split('T')[0]}
              className="bg-white/[0.03] border border-white/10 rounded-sm px-3 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all" />
          </div>
        </div>

        <Button onClick={handleSearch} size="sm">
          <Search size={13} /> Search
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-sm p-6 border-gold-glow">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Location with autocomplete */}
        <div className="relative lg:col-span-2">
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">
            Destination
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500 pointer-events-none" />
            <input
              ref={inputRef}
              value={form.location}
              onChange={set('location')}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="City, country, or hotel name…"
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all placeholder:text-noir-600"
            />
            {loadingSuggestions && (
              <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 animate-spin" />
            )}
          </div>

          <SuggestionDropdown
            ref={dropdownRef}
            show={showSuggestions && suggestions.length > 0}
            suggestions={suggestions}
            onSelect={selectSuggestion}
          />
        </div>

        {/* Check-in */}
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">
            Check-in
          </label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500 pointer-events-none" />
            <input type="date" value={form.check_in} onChange={set('check_in')}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">
            Check-out
          </label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500 pointer-events-none" />
            <input type="date" value={form.check_out} onChange={set('check_out')}
              min={form.check_in || new Date().toISOString().split('T')[0]}
              className="w-full bg-white/[0.03] border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-end gap-4">
        {/* Guests */}
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">Guests</label>
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 w-36">
            <Users size={13} className="text-noir-500 flex-shrink-0" />
            <input type="number" min={1} max={20} value={form.guests}
              onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))}
              className="flex-1 bg-transparent text-sm text-noir-100 font-sans focus:outline-none w-full" />
          </div>
        </div>

        {/* Price range */}
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">Min price</label>
          <input type="number" placeholder="$0" value={form.min_price} onChange={set('min_price')}
            className="w-28 bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 placeholder:text-noir-600" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 font-sans font-medium block mb-1.5">Max price</label>
          <input type="number" placeholder="Any" value={form.max_price} onChange={set('max_price')}
            className="w-28 bg-white/[0.03] border border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 placeholder:text-noir-600" />
        </div>

        <Button size="lg" onClick={handleSearch} className="ml-auto">
          <Search size={14} /> Search Properties
        </Button>
      </div>
    </div>
  )
}

import { forwardRef } from 'react'

const SuggestionDropdown = forwardRef<HTMLDivElement, {
  show: boolean; suggestions: string[]; onSelect: (s: string) => void
}>(({ show, suggestions, onSelect }, ref) => (
  <AnimatePresence>
    {show && (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="absolute top-full left-0 right-0 mt-1 bg-obsidian-950 border border-white/10 rounded-sm shadow-2xl z-50 overflow-hidden"
      >
        {suggestions.map((s, i) => (
          <button key={i} onMouseDown={() => onSelect(s)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-noir-300 hover:bg-gold-600/10 hover:text-gold-300 transition-colors font-sans">
            <MapPin size={12} className="text-gold-600/50 flex-shrink-0" />
            {s}
          </button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
))
SuggestionDropdown.displayName = 'SuggestionDropdown'
