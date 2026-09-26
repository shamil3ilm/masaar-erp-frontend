import { useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  AppShell, Sidebar, TopBar, Logo, ThemeToggle, DirectionToggle,
  sidebarLinkClass, SidebarItemContent,
  type NavItem,
  Users, FileText, ShoppingCart, Receipt, CreditCard, RotateCcw,
  Shield, User, LifeBuoy,
} from '@masaar/ui'
import { useAuthStore } from '../store/auth'
import type { Permission } from '../lib/permissions'
import { usePermissionSync } from '../lib/use-can'

type GuardedNavItem = NavItem & { permission?: Permission }

// The Sidebar hides an item whose `permission` the user lacks, and a section left empty.
const NAV_SECTIONS: { label: string; items: GuardedNavItem[] }[] = [
  {
    label: 'Sales',
    items: [
      { label: 'Contacts',     href: '/app/sales/contacts',     icon: <Users size={15} />,        permission: 'sales.contacts.view' },
      { label: 'Quotations',   href: '/app/sales/quotations',   icon: <FileText size={15} />,     permission: 'sales.quotations.view' },
      { label: 'Sales Orders', href: '/app/sales/sales-orders', icon: <ShoppingCart size={15} />, permission: 'sales.orders.view' },
      { label: 'Invoices',     href: '/app/sales/invoices',     icon: <Receipt size={15} />,      permission: 'sales.invoices.view' },
      { label: 'Payments',     href: '/app/sales/payments',     icon: <CreditCard size={15} />,   permission: 'sales.payments.view' },
      { label: 'Credit Notes', href: '/app/sales/credit-notes', icon: <RotateCcw size={15} />,    permission: 'sales.credit-notes.view' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'ZATCA', href: '/app/compliance/zatca/onboarding', icon: <Shield size={15} />, permission: 'compliance.onboarding.view' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile',        href: '/app/profile', icon: <User size={15} /> },
      { label: 'Help & support', href: '/app/support', icon: <LifeBuoy size={15} /> },
    ],
  },
]

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, organization, organizations, permissions, switchOrg, logout } = useAuthStore()
  const token = useAuthStore((state) => state.token)
  usePermissionSync()

  // The session can end without anyone pressing anything: a refresh the server
  // refuses clears it from inside the API client. The route guard only runs on
  // a navigation, so without this the visitor stays on a page that has no
  // session behind it and every request it makes is refused.
  useEffect(() => {
    if (!token) void navigate({ to: '/login' })
  }, [token, navigate])

  function handleSwitchOrg(orgId: string) {
    const org = organizations.find((o) => String(o.id) === orgId)
    if (org) switchOrg(org)
  }

  function handleLogout() {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <AppShell
      sidebarClassName="bg-[var(--sidebar-bg)]"
      sidebar={
        <Sidebar
          sections={NAV_SECTIONS}
          permissions={[...(permissions ?? [])]}
          currentPath={location.pathname}
          header={<Logo size={28} showName nameClassName="font-semibold text-white tracking-tight" />}
          renderLink={(item, active, collapsed) => (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={sidebarLinkClass(active, collapsed)}
            >
              <SidebarItemContent icon={item.icon} label={item.label} collapsed={collapsed} />
            </Link>
          )}
        />
      }
      topbar={
        <TopBar
          user={{ name: user?.name ?? '', email: user?.email }}
          organizationId={organization?.id}
          organizationName={organization?.name}
          organizations={organizations}
          onSwitchOrg={handleSwitchOrg}
          onLogout={handleLogout}
          controls={
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <DirectionToggle />
            </div>
          }
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
