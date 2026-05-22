import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { userApi } from '../../../shared/api/user'

export function useSearch() {
  const [params] = useSearchParams()

  const queryParams: Record<string, any> = {}
  params.forEach((v, k) => { queryParams[k] = v })

  const hasQuery = Object.keys(queryParams).length > 0

  const query = useQuery({
    queryKey: ['search', queryParams],
    queryFn: () => userApi.search(queryParams),
    enabled: true,        // always run — empty query returns all approved hotels
  })

  return {
    results:    query.data ?? [],
    isLoading:  query.isLoading,
    isError:    query.isError,
    queryParams,
    location:   params.get('location') ?? '',
    checkIn:    params.get('check_in')  ?? '',
    checkOut:   params.get('check_out') ?? '',
    guests:     Number(params.get('guests') ?? 1),
  }
}
