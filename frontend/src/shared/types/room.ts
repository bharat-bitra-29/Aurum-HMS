export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential'

export interface Room {
  id: number
  hotel_id: number
  name: string
  description: string
  room_type: RoomType
  price_per_night: number
  capacity: number
  amenities: string  // JSON string
  is_available: boolean
  created_at: string
}

export interface RoomCreate {
  name: string
  description?: string
  room_type: RoomType
  price_per_night: number
  capacity: number
  amenities: string[]
}

export interface RoomUpdate extends Partial<RoomCreate> {
  is_available?: boolean
}