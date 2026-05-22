import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../../shared/api/admin'
import { useToast } from '../../../shared/hooks/useToast'

export function useAdminUsers() {
  const qc = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  })

  const toggleBlockMutation = useMutation({
    mutationFn: (id: number) => adminApi.toggleBlock(id),
    onSuccess: (updated: any) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(updated.is_blocked ? 'User blocked' : 'User unblocked')
    },
    onError: () => toast.error('Action failed'),
  })

  return {
    users:       query.data ?? [],
    isLoading:   query.isLoading,
    toggleBlock: toggleBlockMutation.mutate,
    toggling:    toggleBlockMutation.isPending,
  }
}