import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Star, Gift, TrendingUp, Loader2 } from 'lucide-react'
import { loyaltyApi } from '../../../shared/api/user'
import { useState } from 'react'
import Button from '../../../shared/components/Button'
import toast from 'react-hot-toast'

export default function LoyaltyWidget() {
  const qc = useQueryClient()
  const [redeemInput, setRedeemInput] = useState('')
  const [showRedeem, setShowRedeem]   = useState(false)

  const { data: account, isLoading } = useQuery({
    queryKey: ['loyalty-account'],
    queryFn: loyaltyApi.getAccount,
  })

  const { data: txns = [] } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: loyaltyApi.getTransactions,
  })

  const redeemMutation = useMutation({
    mutationFn: (points: number) => loyaltyApi.redeem(points),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['loyalty-account'] })
      qc.invalidateQueries({ queryKey: ['loyalty-transactions'] })
      toast.success(data.message)
      setRedeemInput('')
      setShowRedeem(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Redemption failed'),
  })

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-gold-400" /></div>

  const points = account?.points ?? 0
  const dollarValue = account?.dollar_value ?? 0
  const lifetime   = account?.lifetime_earned ?? 0
  const progress   = Math.min((points % 500) / 500, 1)  // progress to next 500-point milestone

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gold-900/20 via-obsidian-950 to-noir-950 border border-gold-600/20 rounded-sm p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/[0.03] rounded-full blur-2xl" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gold-500/60 font-sans mb-1">Aurum Rewards</p>
            <p className="font-display text-4xl text-gold-300 tracking-wide">{points.toLocaleString()}</p>
            <p className="text-xs text-noir-500 font-sans mt-1">≈ ${dollarValue.toFixed(2)} value</p>
          </div>
          <div className="w-10 h-10 rounded-sm bg-gold-600/15 border border-gold-500/20 flex items-center justify-center">
            <Star size={18} className="text-gold-400 fill-gold-400" />
          </div>
        </div>

        {/* Progress to next milestone */}
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-noir-600 font-sans">Progress to next milestone</span>
            <span className="text-[10px] text-gold-500/60 font-mono">{Math.floor(progress * 500)}/500 pts</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-gold-700 to-gold-400 rounded-full"
            />
          </div>
        </div>

        <p className="text-[10px] text-noir-600 font-sans mt-2">
          {lifetime.toLocaleString()} points earned lifetime · 1 point per $1 spent
        </p>
      </motion.div>

      {/* Redeem section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gift size={14} className="text-gold-600/50" />
            <span className="text-sm text-noir-200 font-sans font-medium">Redeem Points</span>
          </div>
          <button onClick={() => setShowRedeem(s => !s)}
            className="text-xs text-gold-400 hover:text-gold-300 font-sans transition-colors">
            {showRedeem ? 'Cancel' : 'Redeem'}
          </button>
        </div>
        <p className="text-xs text-noir-600 font-sans">100 points = $1 discount on your next booking</p>
        {showRedeem && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="mt-3 flex gap-2">
            <input
              type="number" min={100} step={100} max={points}
              value={redeemInput}
              onChange={e => setRedeemInput(e.target.value)}
              placeholder="Points to redeem"
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-sm px-3 py-2 text-sm text-noir-100 font-sans focus:outline-none focus:border-gold-500/60"
            />
            <Button size="sm" loading={redeemMutation.isPending}
              onClick={() => redeemMutation.mutate(Number(redeemInput))}
              disabled={!redeemInput || Number(redeemInput) > points || Number(redeemInput) < 100}>
              Redeem
            </Button>
          </motion.div>
        )}
        {redeemInput && Number(redeemInput) >= 100 && (
          <p className="text-xs text-gold-400/70 font-sans mt-1.5">
            = ${(Number(redeemInput) / 100).toFixed(2)} discount
          </p>
        )}
      </motion.div>

      {/* Recent transactions */}
      {txns.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <TrendingUp size={13} className="text-gold-600/50" />
            <span className="text-sm text-noir-300 font-sans">Recent Activity</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {txns.slice(0, 5).map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs text-noir-300 font-sans">{txn.description}</p>
                  <p className="text-[10px] text-noir-600 font-sans mt-0.5">
                    {new Date(txn.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-display ${txn.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {txn.points > 0 ? '+' : ''}{txn.points}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}