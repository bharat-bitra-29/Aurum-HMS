import { useEffect } from 'react'
import { useThemeStore } from '../stores/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    // Apply theme class to document whenever theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [theme])

  // Initialize theme on first mount from localStorage or system preference
  useEffect(() => {
    const initTheme = () => {
      const stored = localStorage.getItem('theme-store')
      if (stored) {
        try {
          const { state } = JSON.parse(stored)
          if (state?.theme === 'light') {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
          } else {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
          }
        } catch (e) {
          console.error('Failed to parse theme store:', e)
        }
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.remove('dark')
          document.documentElement.classList.add('light')
        }
      }
    }

    initTheme()
  }, [])

  return <>{children}</>
}
