import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useListFilter } from './use-list-filter'

describe('useListFilter', () => {
  it('starts on page 1 with no filter', () => {
    const { result } = renderHook(() => useListFilter())
    expect(result.current).toMatchObject({ page: 1, filter: '' })
  })

  it('returns to page 1 when the filter changes', () => {
    const { result } = renderHook(() => useListFilter())

    act(() => result.current.setPage(4))
    expect(result.current.page).toBe(4)

    act(() => result.current.setFilter('paid'))
    expect(result.current).toMatchObject({ page: 1, filter: 'paid' })
  })
})
