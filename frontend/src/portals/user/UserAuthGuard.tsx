import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../shared/stores/authStore'
import { ReactNode } from 'react'

export default function UserAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (role !== 'user') return <Navigate to="/login" />
  return <>{children}</>
}
