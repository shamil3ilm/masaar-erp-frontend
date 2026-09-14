import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../store/auth'
import { can, permitted, type Permission } from './permissions'
import { useCan } from './use-can'

describe('can', () => {
  it('allows only granted slugs', () => {
    const granted = ['sales.invoices.view', 'sales.invoices.send']

    expect(can(granted, 'sales.invoices.send')).toBe(true)
    expect(can(granted, 'sales.invoices.void')).toBe(false)
  })

  it('allows nothing before permissions have loaded', () => {
    expect(can(null, 'sales.invoices.view')).toBe(false)
    expect(can(undefined, 'sales.invoices.view')).toBe(false)
  })
})

describe('permitted', () => {
  it('drops entries whose permission is missing and keeps unguarded ones', () => {
    const items: { name: string; permission?: Permission }[] = [
      { name: 'invoices', permission: 'sales.invoices.view' },
      { name: 'payments', permission: 'sales.payments.view' },
      { name: 'profile' },
    ]
    const allow = (p: Permission) => can(['sales.invoices.view'], p)

    expect(permitted(items, allow).map((i) => i.name)).toEqual(['invoices', 'profile'])
  })
})

describe('useCan', () => {
  beforeEach(() => {
    useAuthStore.setState({ permissions: null })
  })

  it('follows the permissions held in the auth store', () => {
    const { result } = renderHook(() => useCan())
    expect(result.current('sales.payments.void')).toBe(false)

    act(() => useAuthStore.getState().setPermissions(['sales.payments.void']))
    expect(result.current('sales.payments.void')).toBe(true)

    act(() => useAuthStore.getState().logout())
    expect(result.current('sales.payments.void')).toBe(false)
  })
})
