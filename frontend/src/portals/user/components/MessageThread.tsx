import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Send, MessageSquare } from 'lucide-react'
import { messagingApi } from '../../../shared/api/user'

interface Props {
  bookingId: number
  currentUserId: number
}

export default function MessageThread({ bookingId, currentUserId }: Props) {
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', bookingId],
    queryFn: () => messagingApi.getMessages(bookingId),
    refetchInterval: 8000,
  })

  const sendMutation = useMutation({
    mutationFn: (text: string) => messagingApi.sendMessage(bookingId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', bookingId] })
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

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-sm flex flex-col" style={{ height: 360 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
        <MessageSquare size={14} className="text-gold-600/50" />
        <span className="text-sm text-noir-300 font-sans">Chat with Hotel</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-noir-600 font-sans italic">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg: any) => {
            const isGuest = msg.sender_role === 'guest'
            return (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isGuest ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-sm px-3 py-2 ${
                  isGuest
                    ? 'bg-gold-600/15 border border-gold-600/20'
                    : 'bg-white/[0.04] border border-white/10'
                }`}>
                  <p className="text-sm text-noir-200 font-sans">{msg.body}</p>
                  <p className="text-[10px] text-noir-600 font-sans mt-1">
                    {isGuest ? 'You' : 'Hotel'} · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-sm px-3 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sendMutation.isPending}
          className="w-9 h-9 flex items-center justify-center bg-gold-600/15 border border-gold-600/20 rounded-sm text-gold-400 hover:bg-gold-600/25 transition-all disabled:opacity-40"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}