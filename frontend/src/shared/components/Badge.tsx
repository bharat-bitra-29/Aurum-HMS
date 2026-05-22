import { ReactNode } from 'react'

type Variant = 'gold' | 'green' | 'red' | 'gray' | 'blue' | 'amber'

const styles: Record<Variant, string> = {
  gold:  'bg-gold-900/40 text-gold-300 border-gold-700/40',
  green: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
  red:   'bg-red-950/60 text-red-300 border-red-800/40',
  gray:  'bg-white/5 text-noir-400 border-white/10',
  blue:  'bg-blue-950/60 text-blue-300 border-blue-800/40',
  amber: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
}

const statusMap: Record<string, Variant> = {
  approved: 'green', confirmed: 'green', active: 'green', completed: 'green',
  pending: 'amber',
  rejected: 'red', cancelled: 'red', blocked: 'red',
  platform_admin: 'gold', hotel_admin: 'blue', user: 'gray',
}

interface Props {
  children: ReactNode
  variant?: Variant
  status?: string
  className?: string
}

export default function Badge({ children, variant, status, className = '' }: Props) {
  const v = variant ?? (status ? statusMap[status] ?? 'gray' : 'gray')
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase tracking-[0.1em] font-medium border rounded-sm font-sans ${styles[v]} ${className}`}>
      {children}
    </span>
  )
}
