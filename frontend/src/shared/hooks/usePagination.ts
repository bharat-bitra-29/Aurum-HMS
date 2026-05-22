import { useState, useMemo } from 'react'

export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const goTo    = (p: number) => setPage(Math.min(Math.max(1, p), totalPages))
  const next    = () => goTo(page + 1)
  const prev    = () => goTo(page - 1)
  const reset   = () => setPage(1)

  return {
    page,
    totalPages,
    pageSize,
    total: items.length,
    paginated,
    goTo,
    next,
    prev,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}