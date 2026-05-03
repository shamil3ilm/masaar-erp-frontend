import { cn } from '../lib/utils'

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  permission?: string
  children?: NavItem[]
}

interface SidebarProps {
  items: NavItem[]
  permissions: string[]
  currentPath: string
  collapsed?: boolean
}

function hasPermission(item: NavItem, permissions: string[]): boolean {
  if (!item.permission) return true
  return permissions.includes(item.permission)
}

export function Sidebar({ items, permissions, currentPath, collapsed = false }: SidebarProps) {
  const visible = items.filter((item) => hasPermission(item, permissions))
  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
      {visible.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            currentPath.startsWith(item.href)
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100',
          )}
        >
          {item.icon && <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>}
          {!collapsed && <span>{item.label}</span>}
        </a>
      ))}
    </nav>
  )
}
