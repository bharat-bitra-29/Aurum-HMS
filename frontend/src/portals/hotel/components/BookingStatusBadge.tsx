import { BookingStatus } from '../../../shared/types/api'

interface Props {
  status: BookingStatus
  size?: 'sm' | 'md'
}

const config: Record<BookingStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-amber-950/50 text-amber-300 border-amber-800/40' },
  confirmed: { label: 'Confirmed', className: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40' },
  cancelled: { label: 'Cancelled', className: 'bg-red-950/50 text-red-300 border-red-800/40' },
  completed: { label: 'Completed', className: 'bg-blue-950/50 text-blue-300 border-blue-800/40' },
}

export default function BookingStatusBadge({ status, size = 'md' }: Props) {
  const { label, className } = config[status] ?? config.pending
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[9px]'
    : 'px-2.5 py-0.5 text-[10px]'

  return (
    <span className={`inline-flex items-center font-sans font-medium uppercase tracking-[0.1em] border rounded-sm ${sizeClass} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {label}
    </span>
  )
}
