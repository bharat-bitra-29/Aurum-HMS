import { Routes, Route, Navigate } from 'react-router-dom'
import UserLayout           from './UserLayout'
import UserAuthGuard        from './UserAuthGuard'
import Search               from './pages/Search'
import SearchResults        from './pages/SearchResults'
import HotelDetail          from './pages/HotelDetail'
import BookingCheckout      from './pages/BookingCheckout'
import BookingConfirmation  from './pages/BookingConfirmation'
import MyBookings           from './pages/MyBookings'
import Profile              from './pages/Profile'
import MapSearchPage        from './pages/MapSearchPage'
import LoyaltyPage          from './pages/LoyaltyPage'
import GroupBookingPage     from './pages/GroupBookingPage'

export default function UserRouter() {
  return (
    <UserAuthGuard>
      <UserLayout>
        <Routes>
          <Route path="search"                   element={<Search />} />
          <Route path="results"                  element={<SearchResults />} />
          <Route path="map"                      element={<MapSearchPage />} />
          <Route path="hotels/:id"               element={<HotelDetail />} />
          <Route path="booking/:hotelId/:roomId" element={<BookingCheckout />} />
          <Route path="booking-confirmation"     element={<BookingConfirmation />} />
          <Route path="bookings"                 element={<MyBookings />} />
          <Route path="group-booking"            element={<GroupBookingPage />} />
          <Route path="loyalty"                  element={<LoyaltyPage />} />
          <Route path="profile"                  element={<Profile />} />
          <Route path="*"                        element={<Navigate to="search" />} />
        </Routes>
      </UserLayout>
    </UserAuthGuard>
  )
}
