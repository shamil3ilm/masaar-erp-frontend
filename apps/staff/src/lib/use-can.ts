import { useCallback, useEffect } from 'react'
import { useMe } from '@masaar/api-client'
import { useAuthStore } from '../store/auth'
import { can, type Permission } from './permissions'

/** A `can(permission)` check bound to the signed-in user's permissions. */
export function useCan(): (permission: Permission) => boolean {
  const granted = useAuthStore((s) => s.permissions)
  return useCallback((permission: Permission) => can(granted, permission), [granted])
}

/** Load the user's permissions from `/auth/me` into the auth store. */
export function usePermissionSync(): void {
  const { data } = useMe()
  const setPermissions = useAuthStore((s) => s.setPermissions)

  useEffect(() => {
    if (data) setPermissions(data.permissions)
  }, [data, setPermissions])
}
