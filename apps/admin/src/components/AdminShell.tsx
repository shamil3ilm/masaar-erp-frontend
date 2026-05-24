import { useState } from 'react'
import {
  AppShell, Sidebar, TopBar, Logo, ThemeToggle, DirectionToggle, EmptyState, PageHeader,
  ProfilePage, SupportPage, sidebarLinkClass, SidebarItemContent,
  type NavSection,
  LayoutDashboard, Building2, Users, Boxes, Shield, Settings, User, LifeBuoy,
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
  {
    label: 'Account',
    items: [
      { label: 'Profile',        href: 'profile', icon: <User size={15} /> },
      { label: 'Help & support', href: 'support', icon: <LifeBuoy size={15} /> },
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
              className={sidebarLinkClass(active, collapsed)}
            >
              <SidebarItemContent icon={item.icon} label={item.label} collapsed={collapsed} />
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
      {view === 'dashboard' && <AdminDashboard />}

      {view === 'profile' && (
        <ProfilePage name="Administrator" role="Super Admin" onSignOut={onLogout} />
      )}

      {view === 'support' && <SupportPage />}

      {PLACEHOLDER[view] && (
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
          <PageHeader
            title={PLACEHOLDER[view].title}
            breadcrumbs={[{ label: 'Admin', href: '#' }, { label: PLACEHOLDER[view].title }]}
          />
          <div className="rounded-[var(--radius)] border border-border bg-surface shadow-card">
            <EmptyState
              icon={Boxes}
              title={`${PLACEHOLDER[view].title} — coming soon`}
              description={PLACEHOLDER[view].description}
            />
          </div>
        </div>
      )}
    </AppShell>
  )
}
