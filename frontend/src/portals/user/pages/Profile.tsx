import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Save } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import PageHeader from '../../../shared/components/PageHeader'
import Input from '../../../shared/components/Input'
import Button from '../../../shared/components/Button'
import Spinner from '../../../shared/components/Spinner'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, isLoading, update, updating, changePassword, changingPw } = useProfile()

  const [info, setInfo] = useState({ full_name: '', email: '' })
  const [pw, setPw]     = useState({ current_password: '', new_password: '', confirm: '' })
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (profile && !synced) {
      setInfo({ full_name: profile.full_name, email: profile.email })
      setSynced(true)
    }
  }, [profile, synced])

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.new_password !== pw.confirm) { toast.error('Passwords do not match'); return }
    if (pw.new_password.length < 6)     { toast.error('Password must be at least 6 characters'); return }
    changePassword(
      { current_password: pw.current_password, new_password: pw.new_password },
      { onSuccess: () => setPw({ current_password: '', new_password: '', confirm: '' }) }
    )
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size={32} /></div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information and security" />

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-8 p-5 bg-white/[0.02] border border-white/8 rounded-sm">
        <div className="w-14 h-14 rounded-sm bg-gold-600/10 border border-gold-600/20 flex items-center justify-center flex-shrink-0">
          <span className="font-display text-2xl text-gold-400">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        <div>
          <h2 className="font-display text-xl text-gold-300 tracking-wide">{profile?.full_name}</h2>
          <p className="text-sm text-noir-500 font-sans">{profile?.email}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-noir-600 font-sans mt-1">
            Guest · Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm p-6 mb-5">
        <h2 className="font-display text-lg text-gold-300/80 mb-5 tracking-wide flex items-center gap-2">
          <User size={16} className="text-gold-600/50" /> Personal Information
        </h2>
        <div className="space-y-4 mb-5">
          <Input label="Full name" value={info.full_name}
            onChange={e => setInfo(f => ({ ...f, full_name: e.target.value }))}
            icon={<User size={13} />} />
          <Input label="Email address" type="email" value={info.email}
            onChange={e => setInfo(f => ({ ...f, email: e.target.value }))}
            icon={<Mail size={13} />} />
        </div>
        <Button size="sm" loading={updating}
          onClick={() => update({ full_name: info.full_name, email: info.email })}>
          <Save size={13} /> Save Changes
        </Button>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/[0.02] border border-white/8 rounded-sm p-6">
        <h2 className="font-display text-lg text-gold-300/80 mb-5 tracking-wide flex items-center gap-2">
          <Lock size={16} className="text-gold-600/50" /> Change Password
        </h2>
        <form onSubmit={handlePwSubmit} className="space-y-4">
          <Input label="Current password" type="password" placeholder="••••••••"
            value={pw.current_password}
            onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))}
            icon={<Lock size={13} />} required />
          <Input label="New password" type="password" placeholder="••••••••"
            value={pw.new_password}
            onChange={e => setPw(p => ({ ...p, new_password: e.target.value }))}
            icon={<Lock size={13} />} required />
          <Input label="Confirm new password" type="password" placeholder="••••••••"
            value={pw.confirm}
            onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
            icon={<Lock size={13} />} required />
          <Button type="submit" size="sm" loading={changingPw}>
            <Lock size={13} /> Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}