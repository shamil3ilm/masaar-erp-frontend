import { Logo } from './Logo'

interface TopBarProps {
  organizationName: string
  organizations: { id: string; name: string }[]
  onSwitchOrg: (orgId: string) => void
  userName: string
  onLogout: () => void
  notificationCount?: number
}

export function TopBar({
  organizationName,
  organizations,
  onSwitchOrg,
  userName,
  onLogout,
  notificationCount = 0,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <Logo size={28} showName />
        {organizations.length > 1 ? (
          <select
            value={organizationName}
            onChange={(e) => onSwitchOrg(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-1 text-gray-700"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-gray-600">{organizationName}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {notificationCount > 0 && (
          <button className="relative text-gray-500 hover:text-gray-900">
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{userName}</span>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
        </div>
      </div>
    </div>
  )
}
