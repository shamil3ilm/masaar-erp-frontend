import { Outlet, Link, useLocation, useNavigate } from '@tanstack/react-router'
import { AppShell, TopBar, Logo } from '@erp/ui'
import { useAuthStore } from '../store/auth'

interface NavSection {
  label: string
  items: { label: string; href: string; icon: string }[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Sales',
    items: [
      { label: 'Contacts', href: '/app/sales/contacts', icon: '👥' },
      { label: 'Quotations', href: '/app/sales/quotations', icon: '📋' },
      { label: 'Sales Orders', href: '/app/sales/sales-orders', icon: '🛒' },
      { label: 'Invoices', href: '/app/sales/invoices', icon: '🧾' },
      { label: 'Payments', href: '/app/sales/payments', icon: '💰' },
      { label: 'Credit Notes', href: '/app/sales/credit-notes', icon: '↩️' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'ZATCA Onboarding', href: '/app/compliance/zatca/onboarding', icon: '🔏' },
    ],
  },
]

function AppSidebar({ collapsed }: { collapsed?: boolean }) {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Brand header */}
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <Logo size={28} showName={!collapsed} className="text-white [&_span]:text-white" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const active = currentPath.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={[
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-[#14b8a6]/20 text-[#5eead4]'
                        : 'text-gray-400 hover:bg-white/8 hover:text-white',
                    ].join(' ')}
                  >
                    <span className="flex-shrink-0 w-5 text-center text-base">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

export function AppLayout() {
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
      sidebarClassName="bg-[#1a1f36]"
      sidebar={<AppSidebar />}
      topbar={
        <TopBar
          organizationName={organization?.name ?? ''}
          organizations={organizations}
          onSwitchOrg={handleSwitchOrg}
          userName={user?.name ?? ''}
          onLogout={handleLogout}
        />
      }
    >
      <Outlet />
    </AppShell>
  )
}
