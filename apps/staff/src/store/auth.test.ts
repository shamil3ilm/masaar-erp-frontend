import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      organization: null,
      organizations: [],
    })
    localStorage.clear()
  })

  it('setAuth stores token and user', () => {
    const user = {
      id: '1',
      name: 'John',
      email: 'john@test.com',
      organization_id: 'org-1',
      roles: [],
      permissions: [],
    }
    const org = {
      id: 'org-1',
      name: 'Acme',
      tax_number: '123',
      country: 'SA' as const,
      currency: 'SAR',
      is_active: true,
    }
    useAuthStore.getState().setAuth('tok-123', user, [org], org)
    expect(useAuthStore.getState().token).toBe('tok-123')
    expect(useAuthStore.getState().user?.email).toBe('john@test.com')
    expect(useAuthStore.getState().organization?.id).toBe('org-1')
    expect(localStorage.getItem('erp_token')).toBe('tok-123')
  })

  it('logout clears all state and localStorage', () => {
    localStorage.setItem('erp_token', 'tok-123')
    useAuthStore.setState({ token: 'tok-123' })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(localStorage.getItem('erp_token')).toBeNull()
  })

  it('switchOrg updates selected organization', () => {
    const org1 = {
      id: 'org-1',
      name: 'Acme',
      tax_number: '123',
      country: 'SA' as const,
      currency: 'SAR',
      is_active: true,
    }
    const org2 = {
      id: 'org-2',
      name: 'Beta',
      tax_number: '456',
      country: 'AE' as const,
      currency: 'AED',
      is_active: true,
    }
    useAuthStore.setState({ organizations: [org1, org2], organization: org1 })
    useAuthStore.getState().switchOrg(org2)
    expect(useAuthStore.getState().organization?.id).toBe('org-2')
    expect(localStorage.getItem('erp_org_id')).toBe('org-2')
  })

  it('hydrateFromStorage restores token from localStorage', () => {
    localStorage.setItem('erp_token', 'stored-token')
    useAuthStore.getState().hydrateFromStorage()
    expect(useAuthStore.getState().token).toBe('stored-token')
  })
})
