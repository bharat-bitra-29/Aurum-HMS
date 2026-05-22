import { useThemeStore } from '../stores/themeStore'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-sm bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 light:border-gold-200 light:bg-gold-50 dark:hover:border-gold-500/50 dark:hover:bg-white/10 light:hover:border-gold-400 light:hover:bg-gold-100 transition-all duration-300"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={16} className="text-gold-400" />
      ) : (
        <Moon size={16} className="text-gold-600" />
      )}
    </motion.button>
  )
}
