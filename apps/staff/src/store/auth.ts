import { create } from 'zustand'
import type { User, Organization } from '@erp/types'

interface AuthState {
  token: string | null
  user: User | null
  organization: Organization | null
  organizations: Organization[]
  setAuth: (token: string, user: User, orgs: Organization[], selectedOrg: Organization | null) => void
  switchOrg: (org: Organization) => void
  logout: () => void
  hydrateFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  organization: null,
  organizations: [],

  setAuth: (token, user, orgs, selectedOrg) => {
    localStorage.setItem('erp_token', token)
    localStorage.setItem('erp_user', JSON.stringify(user))
    localStorage.setItem('erp_orgs', JSON.stringify(orgs))
    if (selectedOrg) {
      localStorage.setItem('erp_org_id', selectedOrg.id)
    } else {
      localStorage.removeItem('erp_org_id')
    }
    set({ token, user, organizations: orgs, organization: selectedOrg })
  },

  switchOrg: (org) => {
    localStorage.setItem('erp_org_id', org.id)
    set({ organization: org })
  },

  logout: () => {
    localStorage.removeItem('erp_token')
    localStorage.removeItem('erp_user')
    localStorage.removeItem('erp_orgs')
    localStorage.removeItem('erp_org_id')
    set({ token: null, user: null, organization: null, organizations: [] })
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem('erp_token')
    if (!token) return
    try {
      const user: User | null = JSON.parse(localStorage.getItem('erp_user') ?? 'null')
      const orgs: Organization[] = JSON.parse(localStorage.getItem('erp_orgs') ?? '[]')
      const orgId = localStorage.getItem('erp_org_id')
      const organization = orgs.find((o) => o.id === orgId) ?? null
      set({ token, user, organizations: orgs, organization })
    } catch {
      set({ token })
    }
  },
}))
