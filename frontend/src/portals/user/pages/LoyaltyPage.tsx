import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import LoyaltyWidget from '../components/LoyaltyWidget'
import PageHeader from '../../../shared/components/PageHeader'

export default function LoyaltyPage() {
  return (
    <div className="max-w-lg">
      <PageHeader
        title="Aurum Rewards"
        subtitle="Earn points on every stay and redeem for discounts"
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* How it works */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '🏨', title: 'Book a Stay',    desc: 'Earn 1 point per $1 spent on any confirmed booking' },
            { icon: '⭐', title: 'Collect Points', desc: 'Points credited instantly after hotel confirmation' },
            { icon: '🎁', title: 'Redeem',         desc: '100 points = $1 off your next booking' },
          ].map((step, i) => (
            <motion.div key={step.title}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/8 rounded-sm p-3 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <p className="text-xs font-sans font-medium text-noir-200 mb-1">{step.title}</p>
              <p className="text-[10px] text-noir-600 font-sans leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
        <LoyaltyWidget />
      </motion.div>
    </div>
  )
}