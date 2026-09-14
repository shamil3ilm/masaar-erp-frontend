import { describe, it, expect, beforeEach } from 'vitest'
import type { Organization } from '@masaar/types'
import { useAuthStore } from './auth'
import { queryClient } from '../lib/query-client'

function org(id: number, name: string, country_code: Organization['country_code'], base_currency: string): Organization {
  return { id, uuid: `uuid-${id}`, name, legal_name: null, tax_number: '123', country_code, base_currency, is_active: true }
}

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      organization: null,
      organizations: [],
    })
    localStorage.clear()
    queryClient.clear()
  })

  it('setAuth stores token and user', () => {
    const user = { id: 1, name: 'John', email: 'john@test.com', roles: [] }
    const acme = org(1, 'Acme', 'SA', 'SAR')
    useAuthStore.getState().setAuth('tok-123', user, [acme], acme)
    expect(useAuthStore.getState().token).toBe('tok-123')
    expect(useAuthStore.getState().user?.email).toBe('john@test.com')
    expect(useAuthStore.getState().organization?.id).toBe(1)
    expect(localStorage.getItem('erp_token')).toBe('tok-123')
  })

  it('setToken persists a refreshed token', () => {
    useAuthStore.setState({ token: 'old' })
    useAuthStore.getState().setToken('new')
    expect(useAuthStore.getState().token).toBe('new')
    expect(localStorage.getItem('erp_token')).toBe('new')
  })

  it('logout clears all state, localStorage and the query cache', () => {
    localStorage.setItem('erp_token', 'tok-123')
    useAuthStore.setState({ token: 'tok-123' })
    queryClient.setQueryData(['sales', 'invoices'], ['cached'])
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(localStorage.getItem('erp_token')).toBeNull()
    expect(queryClient.getQueryData(['sales', 'invoices'])).toBeUndefined()
  })

  it('switchOrg updates the selection and drops the previous organization cache', () => {
    const acme = org(1, 'Acme', 'SA', 'SAR')
    const beta = org(2, 'Beta', 'AE', 'AED')
    useAuthStore.setState({ organizations: [acme, beta], organization: acme })
    queryClient.setQueryData(['sales', 'invoices'], ['acme invoice'])
    useAuthStore.getState().switchOrg(beta)
    expect(useAuthStore.getState().organization?.id).toBe(2)
    expect(localStorage.getItem('erp_org_id')).toBe('2')
    expect(queryClient.getQueryData(['sales', 'invoices'])).toBeUndefined()
  })

  it('hydrateFromStorage restores token and the numeric-id organization', () => {
    const acme = org(7, 'Acme', 'SA', 'SAR')
    localStorage.setItem('erp_token', 'stored-token')
    localStorage.setItem('erp_orgs', JSON.stringify([acme]))
    localStorage.setItem('erp_org_id', '7')
    useAuthStore.getState().hydrateFromStorage()
    expect(useAuthStore.getState().token).toBe('stored-token')
    expect(useAuthStore.getState().organization?.id).toBe(7)
  })
})
