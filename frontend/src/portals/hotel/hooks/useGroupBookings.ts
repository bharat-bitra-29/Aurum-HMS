import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hotelPropertyApi } from '../../../shared/api/hotel'
import { useToast } from '../../../shared/hooks/useToast'

export function useGroupBookings() {
  const qc = useQueryClient()
  const toast = useToast()

  const query = useQuery({ queryKey: ['group-bookings'], queryFn: hotelPropertyApi.getGroupBookings })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      hotelPropertyApi.updateGroupBookingStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['group-bookings'] })
      toast.success(`Group booking ${vars.status}`)
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Failed'),
  })

  const groupBookings = query.data ?? []

  const byStatus = (status: string) => groupBookings.filter((gb: any) => gb.status === status)

  return {
    groupBookings,
    isLoading: query.isLoading,
    updateStatus: statusMutation.mutate,
    updating: statusMutation.isPending,
    pending: byStatus('pending'),
    confirmed: byStatus('confirmed'),
    cancelled: byStatus('cancelled'),
  }
}
