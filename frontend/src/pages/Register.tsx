import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import Input from '../shared/components/Input'
import Button from '../shared/components/Button'
import { ThemeToggle } from '../shared/components/ThemeToggle'
import toast from 'react-hot-toast'
import { UserRole } from '../shared/types/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: '', full_name: '', password: '', role: 'user' as UserRole })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form.email, form.full_name, form.password, form.role)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-noir-950 flex items-center justify-center p-8 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-gold-300 dark:text-gold-300 light:text-gold-600 tracking-widest italic mb-1">Aurum</h1>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/40 dark:via-gold-500/40 light:via-gold-600/80 to-transparent mx-auto" />
        </div>
        <h2 className="font-display text-2xl text-gold-300 dark:text-gold-300 light:text-gold-600 mb-1 tracking-wide">Create account</h2>
        <p className="text-sm text-noir-500 dark:text-noir-500 light:text-noir-700 font-sans mb-8">Join the Aurum platform</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" placeholder="Your name" value={form.full_name} onChange={set('full_name')} icon={<User size={14} />} required />
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} icon={<Mail size={14} />} required />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} icon={<Lock size={14} />} required />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-[0.12em] text-gold-400/80 dark:text-gold-400/80 light:text-gold-600/80 font-sans font-medium">Account type</label>
            <select
              value={form.role}
              onChange={set('role')}
              className="w-full bg-white dark:bg-white/[0.03] border border-gold-200 dark:border-white/10 rounded-sm px-4 py-2.5 text-sm text-noir-700 dark:text-noir-100 font-sans focus:outline-none focus:border-gold-600 dark:focus:border-gold-500/60 transition-all"
            >
              <option value="user">Guest — Book hotels</option>
              <option value="hotel_admin">Hotel Manager — List your hotel</option>
            </select>
          </div>

          <div className="mt-2">
            <Button type="submit" size="lg" loading={loading} className="w-full">Create Account</Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-noir-500 dark:text-noir-500 light:text-noir-700 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 dark:text-gold-400 light:text-gold-600 hover:text-gold-300 dark:hover:text-gold-300 light:hover:text-gold-700 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}