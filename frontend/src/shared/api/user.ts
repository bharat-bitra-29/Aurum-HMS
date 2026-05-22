import client from './client'
import { BookingCreate } from '../types/booking'

export const userApi = {
  search: (params: Record<string, any>) =>
    client.get('/user/search', { params }).then(r => r.data),
  createBooking: (data: BookingCreate) =>
    client.post('/user/bookings', data).then(r => r.data),
  getMyBookings: () => client.get('/user/bookings').then(r => r.data),
  cancelBooking: (id: number) => client.post(`/user/bookings/${id}/cancel`).then(r => r.data),
  getProfile: () => client.get('/user/profile').then(r => r.data),
  updateProfile: (data: any) => client.put('/user/profile', data).then(r => r.data),
  changePassword: (data: any) => client.put('/user/profile/password', data).then(r => r.data),
  getPublicHotels: () => client.get('/public/hotels').then(r => r.data),
}

// ── New feature API calls ────────────────────────────────────────────────────
export const loyaltyApi = {
  getAccount:      () => client.get('/user/loyalty').then(r => r.data),
  getTransactions: () => client.get('/user/loyalty/transactions').then(r => r.data),
  redeem: (points: number) => client.post('/user/loyalty/redeem', { points }).then(r => r.data),
}

export const groupBookingApi = {
  create: (data: any) => client.post('/user/group-bookings', data).then(r => r.data),
  getAll: () => client.get('/user/group-bookings').then(r => r.data),
}

export const messagingApi = {
  getMessages: (bookingId: number) => client.get(`/user/bookings/${bookingId}/messages`).then(r => r.data),
  sendMessage: (bookingId: number, body: string) => client.post(`/user/bookings/${bookingId}/messages`, { body }).then(r => r.data),
}

export const mapApi = {
  getHotelsForMap: () => client.get('/public/hotels/map').then(r => r.data),
}

export const refundApi = {
  request: (bookingId: number, amount: number, reason: string) =>
    client.post(`/user/bookings/${bookingId}/refund-request`, { amount, reason }).then(r => r.data),
}