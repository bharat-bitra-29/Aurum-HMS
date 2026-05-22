import { BookingStatus } from './api'

export interface Booking {
  id: number
  user_id: number
  room_id: number
  hotel_id: number
  check_in: string
  check_out: string
  guests: number
  total_amount: number
  status: BookingStatus
  special_requests: string
  created_at: string
}

export interface BookingCreate {
  room_id: number
  hotel_id: number
  check_in: string
  check_out: string
  guests: number
  special_requests?: string
}