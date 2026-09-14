import { useCallback, useState } from 'react'

/** The page number and one filter value of a paginated list; a new filter goes back to page 1. */
export function useListFilter(initial = '') {
  const [page, setPage] = useState(1)
  const [filter, setFilterValue] = useState(initial)

  const setFilter = useCallback((value: string) => {
    setFilterValue(value)
    setPage(1)
  }, [])

  return { page, setPage, filter, setFilter }
}
