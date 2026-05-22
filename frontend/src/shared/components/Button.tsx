import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  gold: 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 dark:from-gold-600 dark:via-gold-400 dark:to-gold-600 bg-[length:200%_100%] hover:bg-right text-white dark:text-obsidian-950 font-semibold shadow-lg shadow-gold-400/30 dark:shadow-gold-900/30 border border-gold-500/50 dark:border-gold-400/30',
  ghost: 'bg-white dark:bg-transparent dark:hover:bg-white/5 hover:bg-gold-100 text-noir-700 dark:text-noir-300 border border-gold-200 dark:border-white/10 dark:hover:border-white/20 hover:border-gold-300',
  danger: 'bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 hover:bg-red-200 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-800/40',
  outline: 'bg-white dark:bg-transparent border border-gold-500 dark:border-gold-600/50 text-gold-600 dark:text-gold-400 dark:hover:bg-gold-600/10 hover:bg-gold-100 dark:hover:border-gold-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs tracking-widest',
  md: 'px-5 py-2.5 text-sm tracking-widest',
  lg: 'px-8 py-3.5 text-sm tracking-[0.15em]',
}

export default function Button({
  variant = 'gold', size = 'md', loading, children, className = '', disabled, ...props
}: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-sm uppercase transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed font-sans
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </motion.button>
  )
}