import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '../types/api'

interface AuthState {
  token: string | null
  role: UserRole | null
  userId: number | null
  fullName: string | null
  isAuthenticated: boolean
  setAuth: (token: string, role: UserRole, userId: number, fullName: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      fullName: null,
      isAuthenticated: false,
      setAuth: (token, role, userId, fullName) => {
        localStorage.setItem('token', token)
        set({ token, role, userId, fullName, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, role: null, userId: null, fullName: null, isAuthenticated: false })
      },
    }),
    { name: 'auth' }
  )
)
