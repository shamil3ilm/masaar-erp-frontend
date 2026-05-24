interface TopBarProps {
  organizationName: string
  organizations: { id: string; name: string }[]
  onSwitchOrg: (orgId: string) => void
  userName: string
  onLogout: () => void
  notificationCount?: number
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
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
    <div className="flex items-center justify-between w-full h-full">
      {/* Left — org identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:block">
            Org
          </span>
          {organizations.length > 1 ? (
            <select
              value={organizationName}
              onChange={(e) => onSwitchOrg(e.target.value)}
              className="text-sm font-medium text-gray-900 border-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer pr-1"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-medium text-gray-900">{organizationName}</span>
          )}
        </div>
      </div>

      {/* Right — user + actions */}
      <div className="flex items-center gap-4">
        {notificationCount > 0 && (
          <button className="relative p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          </button>
        )}

        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-[#14b8a6] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-semibold text-white leading-none">
              {initials(userName)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[140px] truncate">
            {userName}
          </span>
          <span className="text-gray-200">|</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
