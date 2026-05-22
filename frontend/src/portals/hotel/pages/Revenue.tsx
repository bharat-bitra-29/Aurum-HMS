import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Percent, BookOpen } from 'lucide-react'
import { useRevenue } from '../hooks/useRevenue'
import RevenueChart from '../components/RevenueChart'
import PageHeader from '../../../shared/components/PageHeader'
import KpiCard from '../../../shared/components/StatCard'
import Spinner from '../../../shared/components/Spinner'

export default function Revenue() {
  const { gross, net, commission, rate, totalBookings, confirmedBookings, chartData, isLoading, hasHotel } = useRevenue()

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  if (!hasHotel) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="font-display text-2xl text-noir-500 italic">No hotel registered yet</p>
      <p className="text-sm text-noir-600 font-sans">Register and get your hotel approved to see revenue data</p>
    </div>
  )

  const stats = [
    { label: 'Gross Revenue',   value: `$${gross.toFixed(2)}`,       icon: <TrendingUp size={26} />, sub: 'Before commission',           delay: 0 },
    { label: 'Net Revenue',     value: `$${net.toFixed(2)}`,         icon: <DollarSign size={26} />, sub: 'After platform fee',          delay: 0.08 },
    { label: 'Commission Paid', value: `$${commission.toFixed(2)}`,  icon: <Percent    size={26} />, sub: `${(rate * 100).toFixed(0)}% platform rate`, delay: 0.16 },
    { label: 'Total Bookings',  value: totalBookings,                 icon: <BookOpen   size={26} />, sub: `${confirmedBookings} confirmed`, delay: 0.24 },
  ]

  return (
    <div>
      <PageHeader title="Revenue" subtitle="Earnings and financial overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <KpiCard key={s.label} {...s} />)}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/8 rounded-sm p-6 mb-6">
          <RevenueChart data={chartData} title="Monthly Booking Revenue" />
        </motion.div>
      )}

      {/* Revenue split */}
      {gross > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
          <h2 className="font-display text-lg text-gold-300/80 mb-5 tracking-wide">Revenue Split</h2>
          <div className="space-y-4">
            {[
              { label: 'Net (yours)',   pct: (net        / gross) * 100, cls: 'from-gold-600 to-gold-400' },
              { label: 'Commission',   pct: (commission / gross) * 100, cls: 'from-gold-800 to-gold-700' },
            ].map(({ label, pct, cls }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-noir-500 font-sans">{label}</span>
                  <span className="text-xs text-gold-400 font-mono">{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${cls} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown table */}
          <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Gross', value: `$${gross.toFixed(2)}` },
              { label: `Commission (${(rate * 100).toFixed(0)}%)`, value: `-$${commission.toFixed(2)}` },
              { label: 'Net', value: `$${net.toFixed(2)}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-1">{label}</p>
                <p className="font-display text-lg text-gold-300">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
