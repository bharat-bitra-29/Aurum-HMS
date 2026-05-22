import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'

const icons = {
  success: <CheckCircle size={15} className="text-emerald-400" />,
  error:   <XCircle    size={15} className="text-red-400" />,
  info:    <Info       size={15} className="text-gold-400" />,
}

function ToastItem({ id, message, type }: { id: string; message: string; type: 'success' | 'error' | 'info' }) {
  const removeToast = useUIStore(s => s.removeToast)

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), 4000)
    return () => clearTimeout(t)
  }, [id, removeToast])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1,  y: 0,   scale: 1 }}
      exit={{    opacity: 0,  y: -8,   scale: 0.96 }}
      className="flex items-center gap-3 px-4 py-3 bg-obsidian-950 border border-white/10 rounded-sm shadow-xl min-w-[280px] max-w-sm"
    >
      {icons[type]}
      <span className="flex-1 text-sm text-noir-200 font-sans">{message}</span>
      <button onClick={() => removeToast(id)} className="text-noir-600 hover:text-noir-300 transition-colors">
        <X size={13} />
      </button>
    </motion.div>
  )
}

export default function ToastContainer() {
  const toasts = useUIStore(s => s.toasts)

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => <ToastItem key={t.id} {...t} />)}
      </AnimatePresence>
    </div>
  )
}
