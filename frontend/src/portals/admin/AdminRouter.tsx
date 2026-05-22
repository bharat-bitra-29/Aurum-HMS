import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import AdminAuthGuard from './AdminAuthGuard'
import Dashboard        from './pages/Dashboard'
import Hotels           from './pages/Hotels'
import HotelDetail      from './pages/HotelDetail'
import Users            from './pages/Users'
import Commission       from './pages/Commission'
import CommissionTiersPage from './pages/CommissionTiersPage'
import PayoutsPage      from './pages/PayoutsPage'
import RefundsPage      from './pages/RefundsPage'
import HotelEditorPage  from './pages/HotelEditorPage'

export default function AdminRouter() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <Routes>
          <Route path="dashboard"         element={<Dashboard />} />
          <Route path="hotels"            element={<Hotels />} />
          <Route path="hotels/:id"        element={<HotelDetail />} />
          <Route path="hotel-editor"      element={<HotelEditorPage />} />
          <Route path="users"             element={<Users />} />
          <Route path="commission"        element={<Commission />} />
          <Route path="commission-tiers"  element={<CommissionTiersPage />} />
          <Route path="payouts"           element={<PayoutsPage />} />
          <Route path="refunds"           element={<RefundsPage />} />
          <Route path="*"                 element={<Navigate to="dashboard" />} />
        </Routes>
      </AdminLayout>
    </AdminAuthGuard>
  )
}