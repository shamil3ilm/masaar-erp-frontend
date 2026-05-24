import { Outlet, Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  AppShell, Sidebar, TopBar, Logo, ThemeToggle, DirectionToggle,
  sidebarLinkClass, SidebarItemContent,
  type NavSection,
  Users, FileText, ShoppingCart, Receipt, CreditCard, RotateCcw,
  Shield, User, LifeBuoy,
} from '@erp/ui'
import { useAuthStore } from '../store/auth'

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Sales',
    items: [
      { label: 'Contacts',     href: '/app/sales/contacts',     icon: <Users size={15} /> },
      { label: 'Quotations',   href: '/app/sales/quotations',   icon: <FileText size={15} /> },
      { label: 'Sales Orders', href: '/app/sales/sales-orders', icon: <ShoppingCart size={15} /> },
      { label: 'Invoices',     href: '/app/sales/invoices',     icon: <Receipt size={15} /> },
      { label: 'Payments',     href: '/app/sales/payments',     icon: <CreditCard size={15} /> },
      { label: 'Credit Notes', href: '/app/sales/credit-notes', icon: <RotateCcw size={15} /> },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'ZATCA', href: '/app/compliance/zatca/onboarding', icon: <Shield size={15} /> },
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
  const { user, organization, organizations, switchOrg, logout } = useAuthStore()

  function handleSwitchOrg(orgId: string) {
    const org = organizations.find((o) => o.id === orgId)
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
