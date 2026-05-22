import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Users as UsersIcon } from 'lucide-react'
import { useAdminUsers } from '../hooks/useAdminUsers'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { usePagination } from '../../../shared/hooks/usePagination'
import PageHeader from '../../../shared/components/PageHeader'
import UserActivityTable from '../componenets/UserActivityTable'
import Input from '../../../shared/components/Input'
import Spinner from '../../../shared/components/Spinner'
import Pagination from '../../../shared/components/Pagination'
import StatCard from '../../../shared/components/StatCard'
import { ShieldOff, Shield } from 'lucide-react'

export default function Users() {
  const { users, isLoading, toggleBlock, toggling } = useAdminUsers()
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search, 300)

  const filtered = users.filter((u: any) =>
    u.full_name.toLowerCase().includes(debounced.toLowerCase()) ||
    u.email.toLowerCase().includes(debounced.toLowerCase())
  )

  const { paginated, page, totalPages, goTo } = usePagination(filtered, 12)

  const active  = users.filter((u: any) => !u.is_blocked).length
  const blocked = users.filter((u: any) =>  u.is_blocked).length

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div>
      <PageHeader title="Users" subtitle="Monitor and manage guest accounts" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Users"    value={users.length} icon={<UsersIcon size={24} />} delay={0} />
        <StatCard label="Active"         value={active}       icon={<Shield    size={24} />} delay={0.06} />
        <StatCard label="Blocked"        value={blocked}      icon={<ShieldOff size={24} />} delay={0.12} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-80">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); goTo(1) }}
            icon={<Search size={14} />}
          />
        </div>
        {debounced && (
          <p className="text-sm text-noir-500 font-sans">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm overflow-hidden">
        <UserActivityTable
          users={paginated as any}
          onToggleBlock={toggleBlock}
          loading={toggling}
        />
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onPage={goTo} />
    </div>
  )
}