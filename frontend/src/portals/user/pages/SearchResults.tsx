import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { userApi } from '../../../shared/api/user'
import SearchBar from '../components/SearchBar'
import HotelCard from '../components/HotelCard'
import Spinner from '../../../shared/components/Spinner'
import Button from '../../../shared/components/Button'

export default function SearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const queryParams: Record<string, any> = {}
  params.forEach((v, k) => { queryParams[k] = v })

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', queryParams],
    queryFn: () => userApi.search(queryParams),
  })

  const initialValues = {
    location:  params.get('location')  ?? '',
    check_in:  params.get('check_in')  ?? '',
    check_out: params.get('check_out') ?? '',
    guests:    Number(params.get('guests') ?? 1),
    min_price: params.get('min_price') ?? '',
    max_price: params.get('max_price') ?? '',
  }

  return (
    <div>
      {/* Compact search bar at top */}
      <div className="mb-8">
        <SearchBar initialValues={initialValues} compact />
      </div>

      {/* Results header */}
      <div className="flex items-center gap-3 mb-6">
        <p className="text-sm text-noir-400 font-sans">
          {isLoading ? (
            <span className="text-noir-600 italic">Searching…</span>
          ) : (
            <>
              <span className="text-gold-300 font-medium">{results.length}</span>
              {' '}propert{results.length !== 1 ? 'ies' : 'y'} found
              {params.get('location') && (
                <span className="text-noir-600"> near <span className="text-gold-400/70">{params.get('location')}</span></span>
              )}
            </>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl text-noir-500 italic mb-2">No properties found</p>
          <p className="text-sm text-noir-600 font-sans mb-6">
            Try a different location, adjust your dates, or broaden your price range.
          </p>
          <Button variant="outline" onClick={() => navigate('/app/search')}>New Search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {results.map((result: any, i: number) => (
            <HotelCard
              key={result.id}
              hotel={result}
              delay={i * 0.07}
              searchParams={Object.fromEntries(params)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
