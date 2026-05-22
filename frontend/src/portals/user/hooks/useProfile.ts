import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../../../shared/api/user'
import { useToast } from '../../../shared/hooks/useToast'

export function useProfile() {
  const qc    = useQueryClient()
  const toast = useToast()

  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
  })

  const updateMutation = useMutation({
    mutationFn: (data: { full_name?: string; email?: string }) =>
      userApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Update failed'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      userApi.changePassword(data),
    onSuccess: () => toast.success('Password changed successfully'),
    onError:   (e: any) => toast.error(e?.response?.data?.detail ?? 'Password change failed'),
  })

  return {
    profile:        query.data,
    isLoading:      query.isLoading,
    update:         updateMutation.mutate,
    updating:       updateMutation.isPending,
    changePassword: passwordMutation.mutate,
    changingPw:     passwordMutation.isPending,
  }
}
