import client from './client'
import { TokenResponse } from '../types/user'
import { UserRole } from '../types/api'

export const authApi = {
  login: (email: string, password: string) =>
    client.post<TokenResponse>('/auth/login', { email, password }).then(r => r.data),

  register: (email: string, full_name: string, password: string, role: UserRole = 'user') =>
    client.post<TokenResponse>('/auth/register', { email, full_name, password, role }).then(r => r.data),
}