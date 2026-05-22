import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../../shared/api/user'
import { useToast } from '../../../shared/hooks/useToast'
import { BookingCreate } from '../../../shared/types/booking'

export function useBooking(hotel: any, room: any) {
  const navigate  = useNavigate()
  const toast     = useToast()

  const [checkIn,  setCheckIn]  = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests,   setGuests]   = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')

  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000)
    : 0

  const total = nights * (room?.price_per_night ?? 0)

  const mutation = useMutation({
    mutationFn: () => {
      const payload: BookingCreate = {
        room_id:  room.id,
        hotel_id: hotel.id,
        check_in:  checkIn,
        check_out: checkOut,
        guests,
        special_requests: specialRequests,
      }
      return userApi.createBooking(payload)
    },
    onSuccess: (booking) => {
      navigate('/app/booking-confirmation', { state: { booking, room, hotel } })
      toast.success('Reservation confirmed!')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Booking failed'),
  })

  const submit = () => {
    if (!checkIn || !checkOut) { toast.error('Please select your dates'); return }
    if (nights <= 0)           { toast.error('Check-out must be after check-in'); return }
    if (guests < 1)            { toast.error('At least 1 guest required'); return }
    mutation.mutate()
  }

  return {
    checkIn,  setCheckIn,
    checkOut, setCheckOut,
    guests,   setGuests,
    specialRequests, setSpecialRequests,
    nights,
    total,
    submit,
    isLoading: mutation.isPending,
  }
}
