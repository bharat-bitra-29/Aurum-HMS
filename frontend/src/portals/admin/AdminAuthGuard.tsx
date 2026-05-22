import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../shared/stores/authStore'
import { ReactNode } from 'react'

export default function AdminAuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (role !== 'platform_admin') return <Navigate to="/login" />
  return <>{children}</>
}