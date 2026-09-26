import type { AuthTokenResponse } from '@masaar/api-client'
import type { User } from '@masaar/types'

/*
 * The payloads `/auth/login` and `/auth/2fa/verify` actually answer with:
 * integer ids and the nested user resource. They are typed against
 * @masaar/types so the suite fails the typecheck the moment the contract moves.
 */

export const TOKEN = 'admin-access-token'
export const PASSWORD = 'correct-horse-battery-staple'
export const CHALLENGE_TOKEN = 'challenge-abc'

export const ADMIN_USER: User = {
  id: 1,
  uuid: '018f3c2a-9b41-7c55-8d3e-000000000001',
  name: 'Rana Al-Otaibi',
  email: 'rana.alotaibi@masaar.test',
  is_super_admin: true,
  two_factor_enabled: false,
  // A platform super admin belongs to no single tenant.
  organization: null,
  roles: [{ id: 1, name: 'Super Admin', slug: 'super-admin' }],
}

export const LOGIN: AuthTokenResponse = {
  token: TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  user: ADMIN_USER,
}

/** Someone with a good password and no business in this console. */
export const STAFF_USER: User = {
  id: 2,
  uuid: '018f3c2a-9b41-7c55-8d3e-000000000002',
  name: 'Omar Haddad',
  email: 'omar.haddad@masaar.test',
  is_super_admin: false,
  two_factor_enabled: false,
  organization: null,
  roles: [{ id: 2, name: 'Accountant', slug: 'accountant' }],
}

export const STAFF_LOGIN: AuthTokenResponse = {
  token: 'staff-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  user: STAFF_USER,
}
