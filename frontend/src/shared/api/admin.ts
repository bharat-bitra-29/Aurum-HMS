import client from './client'

export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard').then(r => r.data),
  getHotels: () => client.get('/admin/hotels').then(r => r.data),
  getHotel: (id: number) => client.get(`/admin/hotels/${id}`).then(r => r.data),
  approveHotel: (id: number, approved: boolean, rejection_reason?: string) =>
    client.post(`/admin/hotels/${id}/approve`, { approved, rejection_reason }).then(r => r.data),
  getUsers: () => client.get('/admin/users').then(r => r.data),
  toggleBlock: (id: number) => client.post(`/admin/users/${id}/toggle-block`).then(r => r.data),
  getCommission: () => client.get('/admin/commission').then(r => r.data),
}

// ── New feature API calls ────────────────────────────────────────────────────
export const adminManagementApi = {
  bulkAction:     (hotel_ids: number[], action: string, reason?: string) =>
    client.post('/admin/hotels/bulk-action', { hotel_ids, action, reason }).then(r => r.data),
  editHotel:      (id: number, d: any) => client.put(`/admin/hotels/${id}/edit`, d).then(r => r.data),
  suspendHotel:   (id: number, reason: string) => client.post(`/admin/hotels/${id}/suspend`, { reason }).then(r => r.data),
  reinstateHotel: (id: number) => client.post(`/admin/hotels/${id}/reinstate`).then(r => r.data),
  getSuspensions: (id: number) => client.get(`/admin/hotels/${id}/suspensions`).then(r => r.data),
  getTiers:       () => client.get('/admin/commission-tiers').then(r => r.data),
  setTier:        (hotel_id: number, rate: number, label: string) =>
    client.post('/admin/commission-tiers', { hotel_id, rate, label }).then(r => r.data),
  getPayouts:     (hotel_id?: number) => client.get('/admin/payouts', { params: hotel_id ? { hotel_id } : {} }).then(r => r.data),
  createPayout:   (d: any) => client.post('/admin/payouts', d).then(r => r.data),
  processPayout:  (id: number) => client.post(`/admin/payouts/${id}/process`).then(r => r.data),
  getRefunds:     () => client.get('/admin/refunds').then(r => r.data),
  processRefund:  (id: number, approved: boolean, admin_note: string) =>
    client.post(`/admin/refunds/${id}/process`, { approved, admin_note }).then(r => r.data),
}
