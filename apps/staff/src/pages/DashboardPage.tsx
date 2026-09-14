import { Link } from '@tanstack/react-router'
import {
  PageHeader, StatCard, Card, CardHeader, CardBody, Button,
  Users, FileText, ShoppingCart, Receipt, CreditCard, RotateCcw, Shield,
  LayoutDashboard, Plus, ArrowRight,
} from '@masaar/ui'
import { useAuthStore } from '../store/auth'
// permitted() only accepts entries whose `permission` is a known Permission slug.
import { permitted } from '../lib/permissions'
import { useCan } from '../lib/use-can'

const MODULE_CARDS = [
  { label: 'Contacts',     href: '/app/sales/contacts',              icon: Users,        desc: 'Manage customers and suppliers.',      permission: 'sales.contacts.view' },
  { label: 'Quotations',   href: '/app/sales/quotations',            icon: FileText,     desc: 'Create and send price quotations.',     permission: 'sales.quotations.view' },
  { label: 'Sales Orders', href: '/app/sales/sales-orders',          icon: ShoppingCart, desc: 'Track confirmed orders.',               permission: 'sales.orders.view' },
  { label: 'Invoices',     href: '/app/sales/invoices',              icon: Receipt,      desc: 'Issue invoices, track payments.',       permission: 'sales.invoices.view' },
  { label: 'Payments',     href: '/app/sales/payments',              icon: CreditCard,   desc: 'Record and allocate receipts.',         permission: 'sales.payments.view' },
  { label: 'Credit Notes', href: '/app/sales/credit-notes',          icon: RotateCcw,    desc: 'Issue credit notes against invoices.',  permission: 'sales.credit-notes.view' },
  { label: 'ZATCA',        href: '/app/compliance/zatca/onboarding', icon: Shield,       desc: 'Register with ZATCA e-invoicing.',      permission: 'compliance.onboarding.view' },
] as const

const QUICK_ACTIONS = [
  { label: 'New invoice',   href: '/app/sales/invoices/new',   permission: 'sales.invoices.create' },
  { label: 'New quotation', href: '/app/sales/quotations/new', permission: 'sales.quotations.create' },
  { label: 'New contact',   href: '/app/sales/contacts/new',   permission: 'sales.contacts.create' },
] as const

const STEPS = [
  { label: 'Add first customer', href: '/app/sales/contacts/new',           done: false, permission: 'sales.contacts.create' },
  { label: 'Create a quotation', href: '/app/sales/quotations/new',         done: false, permission: 'sales.quotations.create' },
  { label: 'Issue an invoice',   href: '/app/sales/invoices/new',           done: false, permission: 'sales.invoices.create' },
  { label: 'ZATCA onboarding',   href: '/app/compliance/zatca/onboarding',  done: false, permission: 'compliance.onboarding.view' },
] as const

export function DashboardPage() {
  const { organization } = useAuthStore()
  const can = useCan()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: 'Home', href: '/app/dashboard' },
          { label: 'Overview' },
        ]}
        actions={can('sales.invoices.create') ? (
          <Link to="/app/sales/invoices/new">
            <Button size="sm" iconLeft={<Plus size={14} />}>New invoice</Button>
          </Link>
        ) : null}
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open invoices"
          value="—"
          icon={Receipt}
          subtitle="Awaiting payment"
        />
        <StatCard
          label="Collected (MTD)"
          value="—"
          icon={CreditCard}
          iconColor="bg-success-subtle"
          subtitle={organization?.base_currency}
        />
        <StatCard
          label="Active contacts"
          value="—"
          icon={Users}
          iconColor="bg-info-subtle"
        />
        <StatCard
          label="Overdue"
          value="—"
          icon={Receipt}
          iconColor="bg-danger-subtle"
          subtitle="Need attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module quick-access */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <LayoutDashboard size={14} className="text-muted" />
            Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {permitted(MODULE_CARDS, can).map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                to={href}
                className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm hover:border-brand hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-subtle group-hover:bg-brand/20 transition-colors">
                  <Icon size={16} className="text-brand" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text group-hover:text-brand transition-colors">{label}</p>
                  <p className="mt-0.5 text-xs text-muted leading-snug">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-faint group-hover:text-brand shrink-0 mt-0.5 ms-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick actions" />
            <CardBody>
              <div className="flex flex-col gap-2">
                {permitted(QUICK_ACTIONS, can).map(({ label, href }) => (
                  <Link key={href} to={href}>
                    <Button variant="outline" size="sm" fullWidth className="justify-start">
                      <Plus size={13} />
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Getting started */}
          <Card>
            <CardHeader title="Getting started" />
            <CardBody>
              <div className="space-y-2 text-sm">
                {permitted(STEPS, can).map((step) => (
                  <Link
                    key={step.href}
                    to={step.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors"
                  >
                    <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${step.done ? 'bg-success border-success' : 'border-border'}`} />
                    <span className={step.done ? 'line-through text-muted' : 'text-text'}>{step.label}</span>
                    <ArrowRight size={12} className="text-faint ms-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
