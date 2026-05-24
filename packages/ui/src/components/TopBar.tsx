import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '../lib/utils'

interface OrgOption {
  id: string
  name: string
}

interface UserInfo {
  name: string
  email?: string
  role?: string
}

interface TopBarProps {
  user?: UserInfo
  organizationName?: string
  organizations?: OrgOption[]
  onSwitchOrg?: (id: string) => void
  onLogout?: () => void
  notificationCount?: number
  breadcrumbs?: ReactNode
  actions?: ReactNode
  /** Slot for theme/dir toggles */
  controls?: ReactNode
  // Legacy compat props
  userName?: string
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

export function TopBar({
  user,
  userName,
  organizationName,
  organizations = [],
  onSwitchOrg,
  onLogout,
  notificationCount = 0,
  breadcrumbs,
  actions,
  controls,
}: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const resolvedUser: UserInfo | null = user ?? (userName ? { name: userName } : null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-between w-full h-full gap-4">
      {/* Left: breadcrumbs or org name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {breadcrumbs ?? (
          <>
            {organizations.length > 1 && onSwitchOrg ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:block text-xs text-muted uppercase tracking-wide">Org</span>
                <select
                  value={organizationName}
                  onChange={(e) => onSwitchOrg(e.target.value)}
                  className="text-sm font-medium text-text bg-transparent border-0 focus:outline-none cursor-pointer"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              organizationName && (
                <span className="text-sm font-medium text-text truncate max-w-[200px]">{organizationName}</span>
              )
            )}
          </>
        )}
      </div>

      {/* Right: actions + controls + notifications + profile */}
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {controls}

        {notificationCount > 0 && (
          <button
            type="button"
            className="relative p-1.5 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors"
            aria-label={`${notificationCount} notifications`}
          >
            <Bell size={16} />
            <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-fg">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          </button>
        )}

        {resolvedUser && (
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-fg shrink-0">
                {initials(resolvedUser.name)}
              </span>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs font-medium text-text leading-tight max-w-[120px] truncate">{resolvedUser.name}</span>
                {resolvedUser.role && (
                  <span className="text-[10px] text-muted leading-tight">{resolvedUser.role}</span>
                )}
              </div>
              <ChevronDown size={12} className={cn('text-muted transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute end-0 top-full mt-1 w-52 rounded-xl border border-border bg-surface shadow-lg z-50 py-1">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-text truncate">{resolvedUser.name}</p>
                  {resolvedUser.email && <p className="text-[11px] text-muted truncate">{resolvedUser.email}</p>}
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text hover:bg-surface-2 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={14} className="text-muted shrink-0" />
                  Profile
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-text hover:bg-surface-2 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={14} className="text-muted shrink-0" />
                  Settings
                </button>

                <div className="border-t border-border mt-1 pt-1">
                  <button
                    type="button"
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-danger hover:bg-danger-subtle transition-colors"
                    onClick={() => { setProfileOpen(false); onLogout?.() }}
                  >
                    <LogOut size={14} className="shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
