import { Link } from '@tanstack/react-router'
import {
  PageHeader, StatCard, Card, CardHeader, CardBody, Button,
  Users, FileText, ShoppingCart, Receipt, CreditCard, RotateCcw, Shield,
  LayoutDashboard, Plus, ArrowRight,
} from '@erp/ui'
import { useAuthStore } from '../store/auth'

const MODULE_CARDS = [
  { label: 'Contacts',     href: '/app/sales/contacts',                   icon: Users,      desc: 'Manage customers and suppliers.' },
  { label: 'Quotations',   href: '/app/sales/quotations',                  icon: FileText,   desc: 'Create and send price quotations.' },
  { label: 'Sales Orders', href: '/app/sales/sales-orders',                icon: ShoppingCart, desc: 'Track confirmed orders.' },
  { label: 'Invoices',     href: '/app/sales/invoices',                    icon: Receipt,    desc: 'Issue invoices, track payments.' },
  { label: 'Payments',     href: '/app/sales/payments',                    icon: CreditCard, desc: 'Record and allocate receipts.' },
  { label: 'Credit Notes', href: '/app/sales/credit-notes',                icon: RotateCcw,  desc: 'Issue credit notes against invoices.' },
  { label: 'ZATCA',        href: '/app/compliance/zatca/onboarding',       icon: Shield,     desc: 'Register with ZATCA e-invoicing.' },
] as const

const QUICK_ACTIONS = [
  { label: 'New invoice',   href: '/app/sales/invoices/new' },
  { label: 'New quotation', href: '/app/sales/quotations/new' },
  { label: 'New contact',   href: '/app/sales/contacts/new' },
] as const

export function DashboardPage() {
  const { organization } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[
          { label: 'Home', href: '/app/dashboard' },
          { label: 'Overview' },
        ]}
        actions={
          <Link to="/app/sales/invoices/new">
            <Button size="sm" iconLeft={<Plus size={14} />}>New invoice</Button>
          </Link>
        }
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
          subtitle={organization?.currency ?? 'SAR'}
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
            {MODULE_CARDS.map(({ label, href, icon: Icon, desc }) => (
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
                {QUICK_ACTIONS.map(({ label, href }) => (
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
                {[
                  { label: 'Add first customer', href: '/app/sales/contacts/new', done: false },
                  { label: 'Create a quotation', href: '/app/sales/quotations/new', done: false },
                  { label: 'Issue an invoice', href: '/app/sales/invoices/new', done: false },
                  { label: 'ZATCA onboarding', href: '/app/compliance/zatca/onboarding', done: false },
                ].map((step) => (
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
