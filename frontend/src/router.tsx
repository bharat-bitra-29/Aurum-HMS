import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Spinner from './shared/components/Spinner'
import { useAuthStore } from './shared/stores/authStore'

const AdminApp   = lazy(() => import('./portals/admin/AdminApp'))
const HotelApp   = lazy(() => import('./portals/hotel/HotelApp'))
const UserApp    = lazy(() => import('./portals/user/UserApp'))
const LoginPage  = lazy(() => import('./pages/Login'))
const RegisterPage = lazy(() => import('./pages/Register'))

function Loading() {
  return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <Spinner size={32} />
      </div>
  )
}

export default function AppRouter() {
  const { role, isAuthenticated } = useAuthStore()

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/*"  element={<AdminApp />} />
        <Route path="/hotel/*"  element={<HotelApp />} />
        <Route path="/app/*"    element={<UserApp />} />
        <Route path="/" element={
          isAuthenticated
            ? role === 'platform_admin' ? <Navigate to="/admin/dashboard" />
            : role === 'hotel_admin'    ? <Navigate to="/hotel/dashboard" />
            : <Navigate to="/app/search" />
            : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  )
}