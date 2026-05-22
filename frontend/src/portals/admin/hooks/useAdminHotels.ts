import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../../shared/api/admin'
import { useToast } from '../../../shared/hooks/useToast'

export function useAdminHotels() {
  const qc = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: adminApi.getHotels,
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveHotel(id, true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Hotel approved successfully')
    },
    onError: () => toast.error('Failed to approve hotel'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      adminApi.approveHotel(id, false, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hotels'] })
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] })
      toast.success('Hotel rejected')
    },
    onError: () => toast.error('Failed to reject hotel'),
  })

  return {
    hotels:    query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    approve:   approveMutation.mutate,
    reject:    rejectMutation.mutate,
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
  }
}