import { ShieldOff, ShieldCheck } from 'lucide-react'
import Badge from '../../../shared/components/Badge'
import Button from '../../../shared/components/Button'

interface User {
  id: number
  email: string
  full_name: string
  is_blocked: boolean
  created_at: string
}

interface Props {
  users: User[]
  onToggleBlock: (id: number) => void
  loading?: boolean
}

export default function UserActivityTable({ users, onToggleBlock, loading }: Props) {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-lg text-noir-600 italic">No users registered yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-white/8">
            {['User', 'Email', 'Status', 'Joined', 'Action'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-gold-500/70 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3.5 text-noir-200 font-medium">{u.full_name}</td>
              <td className="px-4 py-3.5 text-noir-500 font-mono text-xs">{u.email}</td>
              <td className="px-4 py-3.5">
                <Badge status={u.is_blocked ? 'blocked' : 'active'}>
                  {u.is_blocked ? 'Blocked' : 'Active'}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-noir-600 text-xs font-mono">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3.5">
                <Button
                  variant={u.is_blocked ? 'outline' : 'danger'}
                  size="sm"
                  loading={loading}
                  onClick={() => onToggleBlock(u.id)}
                >
                  {u.is_blocked
                    ? <><ShieldCheck size={12} /> Unblock</>
                    : <><ShieldOff  size={12} /> Block</>}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
