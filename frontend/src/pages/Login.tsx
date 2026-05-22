import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import Input from '../shared/components/Input'
import Button from '../shared/components/Button'
import { ThemeToggle } from '../shared/components/ThemeToggle'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'platform_admin' | 'hotel_admin' | 'user' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole) {
      toast.error('Please select a login role first')
      return
    }

    setLoading(true)
    try {
      await login(email, password, selectedRole)
    } catch (err: any) {
      toast.error((err?.message || err?.response?.data?.detail) ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const roleButtons = [
    { role: 'platform_admin' as const, label: 'Platform Admin', icon: '🏢' },
    { role: 'hotel_admin' as const, label: 'Hotel Admin', icon: '🏨' },
    { role: 'user' as const, label: 'Guest', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-light-bg dark:bg-noir-950 flex relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-obsidian-50 via-light-bg to-white dark:from-obsidian-950 dark:via-noir-950 dark:to-black">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-light-bg dark:from-obsidian-950 dark:via-noir-950 dark:to-black" />
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(200,137,26,0.08) 0%, transparent 60%)' }}
        />
        {/* Decorative lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute border-t border-gold-600/5 dark:border-gold-600/5 light:border-gold-600/20"
              style={{ top: `${15 + i * 14}%`, left: '-5%', right: '-5%', transform: `rotate(-${2 + i}deg)` }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 text-center px-12"
        >
          <div className="text-gold-400/20 dark:text-gold-400/20 light:text-gold-500/30 text-8xl font-display font-light tracking-widest mb-6">✦</div>
          <h1 className="font-display text-5xl text-gold-300 dark:text-gold-300 light:text-gold-600 tracking-widest mb-4 italic">Aurum</h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500/50 dark:via-gold-500/50 light:via-gold-600/80 to-transparent mx-auto mb-4" />
          <p className="text-noir-500 dark:text-noir-500 light:text-noir-700 text-sm font-sans tracking-[0.2em] uppercase">Hotel Management</p>
        </motion.div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light-bg dark:bg-noir-950">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-10">
            <div className="lg:hidden text-center mb-8">
              <h1 className="font-display text-4xl text-gold-300 dark:text-gold-300 light:text-gold-600 tracking-widest italic">Aurum</h1>
            </div>
            <h2 className="font-display text-2xl text-gold-300 dark:text-gold-300 light:text-gold-600 mb-1 tracking-wide">Welcome back</h2>
            <p className="text-sm text-noir-500 dark:text-noir-500 light:text-noir-700 font-sans">Sign in to your account</p>
          </div>

          {/* Role Selection Buttons */}
          <div className="mb-8 space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-noir-600 dark:text-noir-600 light:text-noir-700 font-sans mb-3">Select Your Role</p>
            <div className="grid grid-cols-3 gap-2">
              {roleButtons.map((btn) => (
                <motion.button
                  key={btn.role}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRole(btn.role)}
                  className={`py-3 px-3 rounded-sm font-sans text-xs uppercase tracking-wider transition-all duration-300 border ${
                    selectedRole === btn.role
                      ? 'bg-gold-100 dark:bg-gold-500/20 border-gold-600 dark:border-gold-500 text-gold-700 dark:text-gold-300'
                      : 'bg-white dark:bg-white/5 border-gold-200 dark:border-white/10 text-noir-600 dark:text-noir-400 hover:border-gold-400 dark:hover:border-gold-500/50 hover:text-gold-600 dark:hover:text-gold-400'
                  }`}
                >
                  <div className="mb-1">{btn.icon}</div>
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail size={14} />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock size={14} />}
              required
            />
            <div className="mt-2">
              <Button type="submit" size="lg" loading={loading} className="w-full">
                Sign In
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-noir-500 dark:text-noir-500 light:text-noir-700 font-sans">
            No account?{' '}
            <Link to="/register" className="text-gold-400 dark:text-gold-400 light:text-gold-600 hover:text-gold-300 dark:hover:text-gold-300 light:hover:text-gold-700 transition-colors">
              Register here
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 border border-white/5 dark:border-white/5 light:border-gold-200 rounded-sm bg-white/[0.02] dark:bg-white/[0.02] light:bg-gold-50/30">
            <p className="text-[10px] uppercase tracking-[0.12em] text-noir-600 dark:text-noir-600 light:text-noir-700 mb-2 font-sans">Demo Credentials</p>
            <p className="text-xs text-noir-400 dark:text-noir-400 light:text-noir-600 font-mono">admin@luxury.com / admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
