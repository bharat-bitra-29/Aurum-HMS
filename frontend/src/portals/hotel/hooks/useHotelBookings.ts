import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hotelApi } from '../../../shared/api/hotel'
import { useToast } from '../../../shared/hooks/useToast'
import { BookingStatus } from '../../../shared/types/api'

export function useHotelBookings() {
  const qc = useQueryClient()
  const toast = useToast()

  const query = useQuery({ queryKey: ['hotel-bookings'], queryFn: hotelApi.getBookings })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookingStatus }) =>
      hotelApi.updateBookingStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['hotel-bookings'] })
      toast.success(`Booking ${vars.status}`)
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const bookings = query.data ?? []

  const byStatus = (status: BookingStatus) => bookings.filter((b: any) => b.status === status)

  return {
    bookings,
    isLoading:    query.isLoading,
    updateStatus: statusMutation.mutate,
    updating:     statusMutation.isPending,
    pending:      byStatus('pending'),
    confirmed:    byStatus('confirmed'),
    completed:    byStatus('completed'),
    cancelled:    byStatus('cancelled'),
  }
}
