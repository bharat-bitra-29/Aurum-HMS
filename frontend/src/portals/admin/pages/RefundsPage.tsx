import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { RefreshCcw, CheckCircle, XCircle } from 'lucide-react'
import { adminManagementApi } from '../../../shared/api/admin'
import PageHeader from '../../../shared/components/PageHeader'
import Button from '../../../shared/components/Button'
import Badge from '../../../shared/components/Badge'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import StatCard from '../../../shared/components/StatCard'
import toast from 'react-hot-toast'

export default function RefundsPage() {
  const qc = useQueryClient()
  const [decisionModal, setDecisionModal] = useState<{ open: boolean; id: number | null; approve: boolean }>({
    open: false, id: null, approve: true,
  })
  const [adminNote, setAdminNote] = useState('')

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['admin-refunds'],
    queryFn: adminManagementApi.getRefunds,
  })

  const processMutation = useMutation({
    mutationFn: ({ id, approved, note }: any) => adminManagementApi.processRefund(id, approved, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-refunds'] })
      setDecisionModal({ open: false, id: null, approve: true })
      setAdminNote('')
      toast.success(vars.approved ? 'Refund approved' : 'Refund rejected')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const requested = refunds.filter((r: any) => r.status === 'requested').length
  const approved  = refunds.filter((r: any) => r.status === 'approved').length
  const totalAmt  = refunds.filter((r: any) => ['approved', 'processed'].includes(r.status))
    .reduce((s: number, r: any) => s + r.amount, 0)

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Refund Management" subtitle="Review and process guest refund requests" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Pending Requests" value={requested}            icon={<RefreshCcw size={24} />} delay={0} />
        <StatCard label="Approved"         value={approved}             icon={<CheckCircle size={24} />} delay={0.08} />
        <StatCard label="Total Refunded"   value={`$${totalAmt.toFixed(2)}`} icon={<XCircle size={24} />} delay={0.16} />
      </div>

      {refunds.length === 0 ? (
        <div className="text-center py-16">
          <RefreshCcw size={40} className="text-gold-600/15 mx-auto mb-3" />
          <p className="font-display text-xl text-noir-500 italic">No refund requests</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-white/8">
                {['Booking', 'Amount', 'Reason', 'Status', 'Requested', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-gold-500/70 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refunds.map((r: any, i: number) => (
                <motion.tr key={r.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-gold-500/70">
                    #{String(r.booking_id).padStart(6, '0')}
                  </td>
                  <td className="px-4 py-3.5 text-gold-300 font-sans font-medium">
                    ${r.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-noir-400 max-w-[200px]">
                    <p className="truncate text-xs">{r.reason}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={r.status}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-noir-500 text-xs font-mono">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.status === 'requested' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                          onClick={() => { setDecisionModal({ open: true, id: r.id, approve: true }); setAdminNote('') }}>
                          <CheckCircle size={12} /> Approve
                        </Button>
                        <Button variant="danger" size="sm"
                          onClick={() => { setDecisionModal({ open: true, id: r.id, approve: false }); setAdminNote('') }}>
                          <XCircle size={12} /> Reject
                        </Button>
                      </div>
                    )}
                    {r.admin_note && (
                      <p className="text-xs text-noir-600 italic mt-1 max-w-[160px] truncate">{r.admin_note}</p>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Decision modal */}
      <Modal
        open={decisionModal.open}
        onClose={() => setDecisionModal({ open: false, id: null, approve: true })}
        title={decisionModal.approve ? 'Approve Refund' : 'Reject Refund'}
        width="max-w-sm">
        <p className="text-sm text-noir-400 font-sans mb-4">
          {decisionModal.approve
            ? 'This will approve the refund request. Add an optional note for the guest.'
            : 'This will reject the refund request. Please provide a reason.'}
        </p>
        <Input
          label={decisionModal.approve ? 'Note (optional)' : 'Rejection reason'}
          value={adminNote}
          onChange={e => setAdminNote(e.target.value)}
          placeholder={decisionModal.approve ? 'e.g. Refund processed within 5 business days' : 'e.g. Non-refundable rate'}
        />
        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" size="sm" onClick={() => setDecisionModal({ open: false, id: null, approve: true })}>
            Cancel
          </Button>
          <Button
            variant={decisionModal.approve ? 'outline' : 'danger'}
            size="sm"
            loading={processMutation.isPending}
            onClick={() => processMutation.mutate({
              id: decisionModal.id,
              approved: decisionModal.approve,
              note: adminNote,
            })}>
            {decisionModal.approve ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}