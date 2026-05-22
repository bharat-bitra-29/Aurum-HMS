import { useAuthStore } from './shared/stores/authStore'
import AppRouter from './router'
import { ThemeProvider } from './shared/components/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  )
}
