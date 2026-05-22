import { motion } from 'framer-motion'
import { Hotel, Users, BookOpen, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../../shared/api/admin'
import KpiCard from '../componenets/KpiCard'
import PageHeader from '../../../shared/components/PageHeader'
import Spinner from '../../../shared/components/Spinner'

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30_000,
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  const kpis = [
    {
      label: 'Total Hotels',
      value: data?.total_hotels ?? 0,
      icon: <Hotel size={26} />,
      sub: `${data?.pending_hotels ?? 0} awaiting approval`,
      delay: 0,
    },
    {
      label: 'Registered Users',
      value: data?.total_users ?? 0,
      icon: <Users size={26} />,
      sub: 'Active guest accounts',
      delay: 0.08,
    },
    {
      label: 'Total Bookings',
      value: data?.total_bookings ?? 0,
      icon: <BookOpen size={26} />,
      sub: `${data?.active_bookings ?? 0} currently active`,
      delay: 0.16,
    },
    {
      label: 'Platform Revenue',
      value: `$${(data?.total_revenue ?? 0).toLocaleString('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      })}`,
      icon: <DollarSign size={26} />,
      sub: '10% commission on bookings',
      delay: 0.24,
    },
  ]

  const approvalRate = data?.total_hotels > 0
    ? Math.round(((data.total_hotels - data.pending_hotels) / data.total_hotels) * 100)
    : 0
  const activityRate = data?.total_bookings > 0
    ? Math.round((data.active_bookings / data.total_bookings) * 100)
    : 0

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview — live metrics"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Lower panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white/[0.02] border border-gold-600/15 rounded-sm p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-sm bg-gold-600/10 border border-gold-600/20 flex items-center justify-center">
              <Clock size={15} className="text-gold-400" />
            </div>
            <h2 className="font-display text-lg text-gold-300 tracking-wide">Pending Actions</h2>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Hotels awaiting approval', value: data?.pending_hotels ?? 0, urgent: (data?.pending_hotels ?? 0) > 0 },
              { label: 'Active bookings',           value: data?.active_bookings ?? 0, urgent: false },
              { label: 'Total hotels on platform',  value: data?.total_hotels ?? 0, urgent: false },
            ].map(item => (
              <div key={item.label}
                className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 ${
                  item.urgent && item.value > 0 ? 'text-amber-300' : ''
                }`}>
                <span className="text-sm text-noir-400 font-sans">{item.label}</span>
                <span className={`font-display text-2xl ${item.urgent && item.value > 0 ? 'text-amber-300' : 'text-gold-300'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform health */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.43 }}
          className="bg-white/[0.02] border border-white/8 rounded-sm p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-sm bg-emerald-900/20 border border-emerald-800/30 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
            </div>
            <h2 className="font-display text-lg text-gold-300 tracking-wide">Platform Health</h2>
          </div>
          <div className="space-y-5">
            {[
              { label: 'Hotel approval rate',   value: approvalRate },
              { label: 'Active booking ratio',  value: activityRate },
            ].map(m => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-noir-500 font-sans">{m.label}</span>
                  <span className="text-xs text-gold-400 font-mono">{m.value}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-gold-700 to-gold-400 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue summary */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 font-sans mb-2">Total platform earnings</p>
            <p className="font-display text-2xl text-gold-300">
              ${(data?.total_revenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-noir-600 font-sans mt-1">From {data?.total_bookings ?? 0} bookings at 10% commission</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}