export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  detail: string
}

export type UserRole = 'platform_admin' | 'hotel_admin' | 'user'
export type HotelStatus = 'pending' | 'approved' | 'rejected'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential'
