import { Routes, Route, Navigate } from 'react-router-dom'
import HotelLayout       from './HotelLayout'
import HotelAuthGuard    from './HotelAuthGuard'
import Registration      from './pages/Registration'
import Rooms             from './pages/Rooms'
import Bookings          from './pages/Bookings'
import Revenue           from './pages/Revenue'
import GanttCalendar     from './pages/GanttCalendar'
import TodayTracker      from './pages/TodayTracker'
import PhotoGallery      from './pages/PhotoGallery'
import DynamicPricingPage from './pages/DynamicPricingPage'
import BlackoutDatesPage from './pages/BlackoutDatesPage'
import HotelMessaging    from './pages/HotelMessaging'

export default function HotelRouter() {
  return (
    <HotelAuthGuard>
      <HotelLayout>
        <Routes>
          <Route path="dashboard"       element={<Navigate to="registration" />} />
          <Route path="registration"    element={<Registration />} />
          <Route path="rooms"           element={<Rooms />} />
          <Route path="bookings"        element={<Bookings />} />
          <Route path="revenue"         element={<Revenue />} />
          <Route path="calendar"        element={<GanttCalendar />} />
          <Route path="today"           element={<TodayTracker />} />
          <Route path="photos"          element={<PhotoGallery />} />
          <Route path="pricing"         element={<DynamicPricingPage />} />
          <Route path="blackouts"       element={<BlackoutDatesPage />} />
          <Route path="messaging"       element={<HotelMessaging />} />
          <Route path="*"               element={<Navigate to="registration" />} />
        </Routes>
      </HotelLayout>
    </HotelAuthGuard>
  )
}
