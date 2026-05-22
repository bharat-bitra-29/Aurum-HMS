import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-between mb-8"
    >
      <div>
        <h1 className="font-display text-3xl text-gold-300 tracking-wide">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-noir-500 font-sans tracking-wide">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
