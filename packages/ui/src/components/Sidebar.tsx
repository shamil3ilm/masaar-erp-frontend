import { useState, type ReactNode } from 'react'
import { cn } from '../lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  permission?: string
  children?: NavItem[]
}

export interface NavSection {
  label: string
  items: NavItem[]
}

interface SidebarProps {
  sections: NavSection[]
  permissions?: string[]
  currentPath: string
  header?: ReactNode
  footer?: ReactNode
  collapsed?: boolean
  onCollapsedChange?: (c: boolean) => void
  onNav?: (href: string) => void
  /** Render an item as a link — lets the app inject its own router link */
  renderLink?: (item: NavItem, active: boolean, collapsed: boolean) => ReactNode
}

function hasPermission(item: NavItem, permissions: string[]): boolean {
  if (!item.permission) return true
  return permissions.includes(item.permission)
}

/** Canonical class string for a sidebar nav link — shared by every app's shell so
    the active / hover treatment never drifts between apps. */
export function sidebarLinkClass(active: boolean, collapsed = false): string {
  return cn(
    'flex items-center gap-3 py-2 text-sm font-medium transition-colors',
    collapsed
      ? 'justify-center px-2 rounded-lg'
      : active
        ? 'sb-active -mx-2 pl-5 pr-3'
        : 'px-3 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]',
  )
}

/** Icon + label inner content for a sidebar nav link. */
export function SidebarItemContent({ icon, label, collapsed }: { icon?: ReactNode; label: string; collapsed?: boolean }) {
  return (
    <>
      {icon && <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </>
  )
}

export function Sidebar({
  sections,
  permissions = [],
  currentPath,
  header,
  footer,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  renderLink,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = controlledCollapsed ?? internalCollapsed

  function toggleCollapse() {
    const next = !collapsed
    setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)]">
      {/* Header slot */}
      {header && (
        <div className={cn(
          'flex items-center border-b border-[var(--sidebar-border)] shrink-0',
          collapsed ? 'justify-center py-3 px-2' : 'px-4 py-3',
        )}>
          {header}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 min-h-0">
        {sections.map((section) => {
          const visible = section.items.filter((i) => hasPermission(i, permissions))
          if (visible.length === 0) return null
          return (
            <div key={section.label} className="mb-5">
              {!collapsed && (
                <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-text)]">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {visible.map((item) => {
                  const active = currentPath === item.href || (item.href !== '/app' && currentPath.startsWith(item.href))
                  if (renderLink) return renderLink(item, active, collapsed)
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={sidebarLinkClass(active, collapsed)}
                    >
                      <SidebarItemContent icon={item.icon} label={item.label} collapsed={collapsed} />
                    </a>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer slot */}
      {footer && (
        <div className={cn(
          'border-t border-[var(--sidebar-border)] shrink-0',
          collapsed ? 'py-3 flex justify-center' : 'px-4 py-3',
        )}>
          {footer}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'flex items-center justify-center h-9 border-t border-[var(--sidebar-border)] text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-hover)] transition-colors shrink-0',
        )}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}
