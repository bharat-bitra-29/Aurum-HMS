import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminHotels } from '../hooks/useAdminHotels'
import PageHeader from '../../../shared/components/PageHeader'
import HotelApprovalCard from '../componenets/HotelApprovalCard'
import Table from '../../../shared/components/Table'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'
import Modal from '../../../shared/components/Modal'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import Pagination from '../../../shared/components/Pagination'
import { usePagination } from '../../../shared/hooks/usePagination'
import { useNavigate } from 'react-router-dom'
import { Eye, MapPin, Star } from 'lucide-react'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'
const FILTERS: Filter[] = ['all', 'pending', 'approved', 'rejected']

export default function Hotels() {
  const navigate = useNavigate()
  const { hotels, isLoading, approve, reject, approving, rejecting } = useAdminHotels()

  const [filter, setFilter]       = useState<Filter>('all')
  const [view, setView]           = useState<'cards' | 'table'>('table')
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [reason, setReason]       = useState('')

  const filtered = filter === 'all' ? hotels : hotels.filter((h: any) => h.status === filter)
  const { paginated, page, totalPages, goTo } = usePagination(filtered, 10)

  const handleApprove = (id: number) => approve(id)
  const handleOpenReject = (id: number) => { setRejectModal({ open: true, id }); setReason('') }
  const handleConfirmReject = () => {
    if (!rejectModal.id) return
    reject({ id: rejectModal.id, reason }, {
      onSuccess: () => setRejectModal({ open: false, id: null }),
    })
  }

  const columns = [
    {
      key: 'name', header: 'Hotel',
      render: (h: any) => (
        <div>
          <p className="text-noir-100 font-medium font-sans">{h.name}</p>
          <p className="text-xs text-noir-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {h.city}, {h.country}
          </p>
        </div>
      ),
    },
    {
      key: 'star_rating', header: 'Stars',
      render: (h: any) => (
        <div className="flex gap-0.5">
          {[...Array(h.star_rating)].map((_: any, i: number) =>
            <Star key={i} size={11} className="text-gold-400 fill-gold-400" />)}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (h: any) => <Badge status={h.status}>{h.status}</Badge> },
    {
      key: 'created_at', header: 'Applied',
      render: (h: any) => <span className="text-xs text-noir-500 font-mono">{new Date(h.created_at).toLocaleDateString()}</span>,
    },
    {
      key: 'actions', header: '',
      render: (h: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/hotels/${h.id}`)}>
            <Eye size={13} />
          </Button>
          {h.status === 'pending' && (
            <>
              <Button variant="outline" size="sm" loading={approving} onClick={() => handleApprove(h.id)}>
                Approve
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleOpenReject(h.id)}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle="Manage hotel registrations and approvals"
        action={
          <div className="flex gap-1 p-1 bg-white/[0.02] border border-white/8 rounded-sm">
            {(['table', 'cards'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 text-xs rounded-sm font-sans uppercase tracking-wider transition-all ${
                  view === v ? 'bg-gold-600/15 text-gold-300' : 'text-noir-500 hover:text-noir-300'
                }`}>{v}</button>
            ))}
          </div>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-white/[0.02] border border-white/8 rounded-sm w-fit flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => { setFilter(f); goTo(1) }}
            className={`px-4 py-1.5 text-xs uppercase tracking-[0.1em] rounded-sm font-sans transition-all ${
              filter === f ? 'bg-gold-600/15 text-gold-300 border border-gold-600/20' : 'text-noir-500 hover:text-noir-300'
            }`}>
            {f}
            {f !== 'all' && (
              <span className="ml-1.5 text-noir-600">({hotels.filter((h: any) => h.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : view === 'cards' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((hotel: any, i: number) => (
              <HotelApprovalCard
                key={hotel.id}
                hotel={hotel}
                delay={i * 0.05}
                onApprove={handleApprove}
                onReject={handleOpenReject}
                loading={approving || rejecting}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={goTo} />
        </>
      ) : (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
            <Table columns={columns} data={paginated} emptyMessage="No hotels match this filter" />
          </motion.div>
          <Pagination page={page} totalPages={totalPages} onPage={goTo} />
        </>
      )}

      {/* Rejection modal */}
      <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} title="Reject Hotel Registration">
        <p className="text-sm text-noir-400 font-sans mb-4">
          Provide a reason for rejection. The hotel manager will be able to see this.
        </p>
        <Input
          label="Rejection reason"
          placeholder="e.g. Incomplete documentation, invalid address…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" size="sm" onClick={() => setRejectModal({ open: false, id: null })}>Cancel</Button>
          <Button variant="danger" size="sm" loading={rejecting} onClick={handleConfirmReject}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </div>
  )
}
