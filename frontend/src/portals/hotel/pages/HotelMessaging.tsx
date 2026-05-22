import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Hash } from 'lucide-react'
import { hotelPropertyApi } from '../../../shared/api/hotel'
import { hotelApi } from '../../../shared/api/hotel'
import PageHeader from '../../../shared/components/PageHeader'
import Badge from '../../../shared/components/Badge'
import Spinner from '../../../shared/components/Spinner'
import { useRef, useEffect } from 'react'

export default function HotelMessaging() {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['hotel-bookings'],
    queryFn: hotelApi.getBookings,
  })

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['hotel-messages', selectedBookingId],
    queryFn: () => hotelPropertyApi.getMessages(selectedBookingId!),
    enabled: !!selectedBookingId,
    refetchInterval: 8000,
  })

  const sendMutation = useMutation({
    mutationFn: (text: string) => hotelPropertyApi.sendMessage(selectedBookingId!, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel-messages', selectedBookingId] })
      setBody('')
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!body.trim()) return
    sendMutation.mutate(body.trim())
  }

  const activeBookings = bookings.filter((b: any) =>
    ['pending', 'confirmed'].includes(b.status)
  )

  if (loadingBookings) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader
        title="Guest Messaging"
        subtitle="Communicate with guests pre-arrival and during their stay"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 520 }}>

        {/* Booking list */}
        <div className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-xs uppercase tracking-[0.12em] text-gold-500/60 font-sans">Active Bookings</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {activeBookings.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-noir-600 font-sans italic">No active bookings</p>
              </div>
            ) : (
              activeBookings.map((b: any) => (
                <button key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`w-full text-left px-4 py-3 transition-all hover:bg-white/[0.03] ${
                    selectedBookingId === b.id ? 'bg-gold-600/10 border-l-2 border-gold-500' : 'border-l-2 border-transparent'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gold-400/70 font-mono text-xs flex items-center gap-0.5">
                      <Hash size={10} />{String(b.id).padStart(6, '0')}
                    </span>
                    <Badge status={b.status} className="scale-90">{b.status}</Badge>
                  </div>
                  <p className="text-xs text-noir-400 font-sans">
                    {new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' → '}
                    {new Date(b.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-noir-600 font-sans mt-0.5">{b.guests} guest{b.guests !== 1 ? 's' : ''}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message thread */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/8 rounded-sm flex flex-col">
          {!selectedBookingId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <MessageSquare size={36} className="text-gold-600/15" />
              <p className="font-display text-lg text-noir-500 italic">Select a booking to chat</p>
              <p className="text-xs text-noir-600 font-sans">
                Send pre-arrival instructions, directions, or answer guest questions
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
                <MessageSquare size={14} className="text-gold-600/50" />
                <span className="text-sm text-noir-300 font-sans">
                  Booking #{String(selectedBookingId).padStart(6, '0')}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-noir-600 font-sans italic">No messages yet. Send the first message.</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isHotel = msg.sender_role === 'hotel'
                    return (
                      <motion.div key={msg.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isHotel ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-sm px-3 py-2 ${
                          isHotel
                            ? 'bg-gold-600/15 border border-gold-600/20'
                            : 'bg-white/[0.04] border border-white/10'
                        }`}>
                          <p className="text-sm text-noir-200 font-sans">{msg.body}</p>
                          <p className="text-[10px] text-noir-600 font-sans mt-1">
                            {isHotel ? 'You (Hotel)' : 'Guest'} ·{' '}
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/8 flex gap-2">
                <input value={body} onChange={e => setBody(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message to the guest…"
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-sm px-3 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all" />
                <button onClick={handleSend}
                  disabled={!body.trim() || sendMutation.isPending}
                  className="w-9 h-9 flex items-center justify-center bg-gold-600/15 border border-gold-600/20 rounded-sm text-gold-400 hover:bg-gold-600/25 transition-all disabled:opacity-40">
                  <Send size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}