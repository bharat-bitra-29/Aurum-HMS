import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Percent, Hash } from 'lucide-react'
import { useCommission } from '../hooks/useCommission'
import { usePagination } from '../../../shared/hooks/usePagination'
import PageHeader from '../../../shared/components/PageHeader'
import KpiCard from '../componenets/KpiCard'
import Table from '../../../shared/components/Table'
import Spinner from '../../../shared/components/Spinner'
import Pagination from '../../../shared/components/Pagination'

export default function Commission() {
  const { commissions, total, count, isLoading } = useCommission()
  const { paginated, page, totalPages, goTo } = usePagination(commissions, 15)

  const avgBooking = count > 0 ? (commissions.reduce((s: number, c: any) => s + c.booking_amount, 0) / count) : 0

  const columns = [
    {
      key: 'id', header: '#',
      render: (c: any) => (
        <div className="flex items-center gap-1 text-noir-500 font-mono text-xs">
          <Hash size={10} />{c.id}
        </div>
      ),
    },
    {
      key: 'booking_id', header: 'Booking',
      render: (c: any) => <span className="font-mono text-xs text-gold-500/70">#{String(c.booking_id).padStart(6, '0')}</span>,
    },
    {
      key: 'booking_amount', header: 'Booking Value',
      render: (c: any) => <span className="text-noir-200 font-sans">${c.booking_amount.toFixed(2)}</span>,
    },
    {
      key: 'platform_rate', header: 'Rate',
      render: (c: any) => (
        <span className="text-[10px] font-mono text-noir-500 bg-white/5 px-2 py-0.5 rounded-sm border border-white/8">
          {(c.platform_rate * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      key: 'amount', header: 'Commission Earned',
      render: (c: any) => <span className="text-gold-300 font-sans font-medium">${c.amount.toFixed(2)}</span>,
    },
    {
      key: 'created_at', header: 'Date',
      render: (c: any) => (
        <span className="text-xs text-noir-500 font-mono">
          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ]

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Commission" subtitle="Platform earnings from confirmed bookings" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Total Earned"    value={`$${total.toFixed(2)}`}          icon={<DollarSign  size={26} />} delay={0} />
        <KpiCard label="Transactions"    value={count}                            icon={<TrendingUp  size={26} />} delay={0.08} sub={`avg $${avgBooking.toFixed(2)} per booking`} />
        <KpiCard label="Commission Rate" value="10%"                             icon={<Percent     size={26} />} delay={0.16} sub="Per confirmed booking" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-display text-lg text-gold-300/80 tracking-wide">Transaction Log</h2>
          <span className="text-xs text-noir-600 font-sans">{commissions.length} record{commissions.length !== 1 ? 's' : ''}</span>
        </div>
        <Table columns={columns} data={paginated} emptyMessage="No commissions recorded yet" />
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPage={goTo} />
    </div>
  )
}