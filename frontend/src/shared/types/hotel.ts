import { HotelStatus } from './api'

export interface Hotel {
  id: number
  owner_id: number
  name: string
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  star_rating: number
  status: HotelStatus
  rejection_reason?: string
  amenities: string
  created_at: string
}

export interface HotelSearchResult {
  id: number
  name: string
  description: string
  city: string
  country: string
  address: string
  star_rating: number
  amenities: string
  min_price: number
  available_rooms: number
  rooms: Room[]
}

export interface Room {
  id: number
  hotel_id: number
  name: string
  description: string
  room_type: string
  price_per_night: number
  capacity: number
  amenities: string
  is_available: boolean
  created_at: string
}