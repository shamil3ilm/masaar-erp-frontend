import { useState } from 'react'
import {
  AppShell, Sidebar, TopBar, Logo, ThemeToggle, DirectionToggle, EmptyState, PageHeader,
  type NavSection,
  LayoutDashboard, Building2, Users, Boxes, Shield, Settings,
} from '@erp/ui'
import { AdminDashboard } from '../pages/AdminDashboard'

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: 'dashboard', icon: <LayoutDashboard size={15} /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Organizations', href: 'organizations', icon: <Building2 size={15} /> },
      { label: 'Users',         href: 'users',         icon: <Users size={15} /> },
      { label: 'Modules',       href: 'modules',       icon: <Boxes size={15} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Log', href: 'audit',    icon: <Shield size={15} /> },
      { label: 'Settings',  href: 'settings', icon: <Settings size={15} /> },
    ],
  },
]

const PLACEHOLDER: Record<string, { title: string; description: string }> = {
  organizations: { title: 'Organizations', description: 'Manage tenant organizations across the platform.' },
  users:         { title: 'Users',         description: 'Manage system users and their access.' },
  modules:       { title: 'Modules',       description: 'Configure which modules each organization can access.' },
  audit:         { title: 'Audit Log',     description: 'Review platform-wide activity and changes.' },
  settings:      { title: 'Settings',      description: 'Configure global platform settings.' },
}

export function AdminShell({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState('dashboard')

  return (
    <AppShell
      sidebarClassName="bg-[var(--sidebar-bg)]"
      sidebar={
        <Sidebar
          sections={NAV_SECTIONS}
          currentPath={view}
          header={<Logo size={28} showName nameClassName="font-semibold text-white tracking-tight" />}
          renderLink={(item, active, collapsed) => (
            <button
              key={item.href}
              type="button"
              onClick={() => setView(item.href)}
              title={collapsed ? item.label : undefined}
              className={[
                'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2' : '',
                active
                  ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                  : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]',
              ].filter(Boolean).join(' ')}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              {!collapsed && <span className="truncate text-start flex-1">{item.label}</span>}
            </button>
          )}
        />
      }
      topbar={
        <TopBar
          user={{ name: 'Administrator', role: 'Super Admin' }}
          organizationName="Masaar Admin Console"
          onLogout={onLogout}
          controls={
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <DirectionToggle />
            </div>
          }
        />
      }
    >
      {view === 'dashboard' ? (
        <AdminDashboard />
      ) : (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
          <PageHeader
            title={PLACEHOLDER[view]?.title ?? 'Admin'}
            breadcrumbs={[{ label: 'Admin', href: '#' }, { label: PLACEHOLDER[view]?.title ?? '' }]}
          />
          <div className="rounded-[var(--radius)] border border-border bg-surface shadow-card">
            <EmptyState
              icon={Boxes}
              title={`${PLACEHOLDER[view]?.title ?? 'This section'} — coming soon`}
              description={PLACEHOLDER[view]?.description}
            />
          </div>
        </div>
      )}
    </AppShell>
  )
}
