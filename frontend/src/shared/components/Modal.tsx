import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full ${width} bg-obsidian-950 border border-white/10 rounded-sm shadow-2xl`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <h2 className="font-display text-lg text-gold-300 tracking-wide">{title}</h2>
                <button onClick={onClose} className="text-noir-500 hover:text-noir-200 transition-colors">
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
