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
    // Super-admins have no organization; only persist an org id when one exists.
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
    localStorage.removeItem('erp_org_id')
    set({ token: null, user: null, organization: null, organizations: [] })
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem('erp_token')
    if (token) set({ token })
  },
}))
