import { UserRole } from './api'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  is_blocked: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  role: UserRole
  user_id: number
  full_name: string
}
