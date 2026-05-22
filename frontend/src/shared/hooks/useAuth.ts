import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'

export function useAuth() {
  const { setAuth, logout, role, isAuthenticated, fullName, userId } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string, expectedRole?: string) => {
    const data = await authApi.login(email, password)
    
    // Validate role matches if expectedRole is provided
    if (expectedRole && data.role !== expectedRole) {
      throw new Error(`This account is a ${data.role.replace('_', ' ')}, not a ${expectedRole.replace('_', ' ')}`)
    }
    
    setAuth(data.access_token, data.role, data.user_id, data.full_name)
    if (data.role === 'platform_admin') navigate('/admin/dashboard')
    else if (data.role === 'hotel_admin') navigate('/hotel/dashboard')
    else navigate('/app/search')
    toast.success(`Welcome back, ${data.full_name}`)
    return data
  }

  const register = async (email: string, full_name: string, password: string, role: any) => {
    const data = await authApi.register(email, full_name, password, role)
    setAuth(data.access_token, data.role, data.user_id, data.full_name)
    if (data.role === 'platform_admin') navigate('/admin/dashboard')
    else if (data.role === 'hotel_admin') navigate('/hotel/dashboard')
    else navigate('/app/search')
    toast.success('Account created successfully')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return { login, register, logout: handleLogout, role, isAuthenticated, fullName, userId }
}
