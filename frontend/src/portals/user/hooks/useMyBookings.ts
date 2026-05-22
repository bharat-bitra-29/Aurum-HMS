import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../../shared/api/user'
import { useToast } from '../../../shared/hooks/useToast'
import { useMemo } from 'react'

export function useMyBookings() {
  const qc   = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: ['my-bookings'],
    queryFn: userApi.getMyBookings,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => userApi.cancelBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] })
      toast.success('Booking cancelled')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Cancellation failed'),
  })

  const bookings = query.data ?? []

  const grouped = useMemo(() => ({
    upcoming:  bookings.filter((b: any) => ['pending', 'confirmed'].includes(b.status) && new Date(b.check_in) >= new Date()),
    past:      bookings.filter((b: any) => b.status === 'completed' || new Date(b.check_out) < new Date()),
    cancelled: bookings.filter((b: any) => b.status === 'cancelled'),
    all:       bookings,
  }), [bookings])

  const nightsFor = (b: any) =>
    Math.max(0, (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86_400_000)

  return {
    bookings,
    grouped,
    isLoading:  query.isLoading,
    cancel:     cancelMutation.mutate,
    cancelling: cancelMutation.isPending,
    nightsFor,
  }
}
