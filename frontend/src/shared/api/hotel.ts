import client from './client'

export const hotelApi = {
  register: (data: any) => client.post('/hotel/register', data).then(r => r.data),
  getMyHotel: () => client.get('/hotel/my-hotel').then(r => r.data),
  updateMyHotel: (data: any) => client.put('/hotel/my-hotel', data).then(r => r.data),
  getRooms: () => client.get('/hotel/rooms').then(r => r.data),
  addRoom: (data: any) => client.post('/hotel/rooms', data).then(r => r.data),
  updateRoom: (id: number, data: any) => client.put(`/hotel/rooms/${id}`, data).then(r => r.data),
  deleteRoom: (id: number) => client.delete(`/hotel/rooms/${id}`).then(r => r.data),
  getBookings: () => client.get('/hotel/bookings').then(r => r.data),
  updateBookingStatus: (id: number, status: string) =>
    client.put(`/hotel/bookings/${id}/status`, { status }).then(r => r.data),
  getRevenue: () => client.get('/hotel/revenue').then(r => r.data),
}

// ── New feature API calls ────────────────────────────────────────────────────
export const hotelPropertyApi = {
  // Dynamic pricing
  getPricing:    () => client.get('/hotel/dynamic-pricing').then(r => r.data),
  addPricing:    (d: any) => client.post('/hotel/dynamic-pricing', d).then(r => r.data),
  deletePricing: (id: number) => client.delete(`/hotel/dynamic-pricing/${id}`).then(r => r.data),
  // Blackout dates
  getBlackouts:   () => client.get('/hotel/blackout-dates').then(r => r.data),
  addBlackout:    (d: any) => client.post('/hotel/blackout-dates', d).then(r => r.data),
  deleteBlackout: (id: number) => client.delete(`/hotel/blackout-dates/${id}`).then(r => r.data),
  // Photos
  getPhotos:    (roomId?: number) => client.get('/hotel/photos', { params: roomId ? { room_id: roomId } : {} }).then(r => r.data),
  uploadPhoto:  (d: any) => client.post('/hotel/photos', d).then(r => r.data),
  deletePhoto:  (id: number) => client.delete(`/hotel/photos/${id}`).then(r => r.data),
  // Calendar & tracker
  getCalendar:     () => client.get('/hotel/calendar').then(r => r.data),
  getTodayTracker: () => client.get('/hotel/today-tracker').then(r => r.data),
  // Messaging
  getMessages: (bookingId: number) => client.get(`/hotel/bookings/${bookingId}/messages`).then(r => r.data),
  sendMessage: (bookingId: number, body: string) => client.post(`/hotel/bookings/${bookingId}/messages`, { body }).then(r => r.data),
  // Group bookings
  getGroupBookings: () => client.get('/hotel/group-bookings').then(r => r.data),
  updateGroupBookingStatus: (id: number, status: string) =>
    client.put(`/hotel/group-bookings/${id}/status`, { status }).then(r => r.data),
}
