import { useQuery } from '@tanstack/react-query'
import { hotelApi } from '../../../shared/api/hotel'
import { useMemo } from 'react'

export function useRevenue() {
  const query = useQuery({ queryKey: ['hotel-revenue'], queryFn: hotelApi.getRevenue })
  const data = query.data

  const chartData = useMemo(() => {
    if (!data?.commissions) return []
    const monthly: Record<string, number> = {}
    for (const c of data.commissions) {
      const month = new Date(c.created_at).toLocaleDateString('en-US', {
        month: 'short', year: '2-digit',
      })
      monthly[month] = (monthly[month] ?? 0) + c.booking_amount
    }
    return Object.entries(monthly).map(([month, amount]) => ({ month, amount }))
  }, [data?.commissions])

  return {
    gross:       data?.gross_revenue   ?? 0,
    net:         data?.net_revenue     ?? 0,
    commission:  data?.commission_paid ?? 0,
    rate:        data?.commission_rate ?? 0.1,
    totalBookings:     data?.total_bookings     ?? 0,
    confirmedBookings: data?.confirmed_bookings ?? 0,
    chartData,
    isLoading:   query.isLoading,
    hasHotel:    !data?.error,
  }
}