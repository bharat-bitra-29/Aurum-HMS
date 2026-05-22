import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../../shared/api/admin'

export function useCommission() {
  const query = useQuery({
    queryKey: ['admin-commission'],
    queryFn: adminApi.getCommission,
  })

  const data = query.data
  return {
    commissions: data?.commissions ?? [],
    total:       data?.total       ?? 0,
    count:       data?.count       ?? 0,
    isLoading:   query.isLoading,
    isError:     query.isError,
  }
}
