import { Link } from '@tanstack/react-router'
import { PageHeader } from '@erp/ui'
import { useAuthStore } from '../store/auth'

const MODULE_CARDS = [
  {
    icon: '👥',
    name: 'Contacts',
    description: 'Manage customers and suppliers.',
    href: '/app/sales/contacts',
  },
  {
    icon: '📋',
    name: 'Quotations',
    description: 'Create and send price quotations.',
    href: '/app/sales/quotations',
  },
  {
    icon: '🛒',
    name: 'Sales Orders',
    description: 'Track confirmed orders and fulfillment.',
    href: '/app/sales/sales-orders',
  },
  {
    icon: '🧾',
    name: 'Invoices',
    description: 'Issue invoices and track payments.',
    href: '/app/sales/invoices',
  },
  {
    icon: '💰',
    name: 'Payments',
    description: 'Record and allocate customer payments.',
    href: '/app/sales/payments',
  },
  {
    icon: '↩️',
    name: 'Credit Notes',
    description: 'Issue credit notes against invoices.',
    href: '/app/sales/credit-notes',
  },
  {
    icon: '🔏',
    name: 'ZATCA Onboarding',
    description: 'Register this branch with ZATCA e-invoicing.',
    href: '/app/compliance/zatca/onboarding',
  },
] as const

const GETTING_STARTED_STEPS = [
  { label: 'Add your first customer', href: '/app/sales/contacts/new' },
  { label: 'Create a quotation', href: '/app/sales/quotations/new' },
  { label: 'Issue an invoice', href: '/app/sales/invoices/new' },
  { label: 'Complete ZATCA onboarding', href: '/app/compliance/zatca/onboarding' },
] as const

export function DashboardPage() {
  const { organization } = useAuthStore()
  const orgName = organization?.name ?? 'your organization'

  return (
    <div className="max-w-5xl mx-auto p-6">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Home' }, { label: 'Dashboard' }]}
      />

      <p className="text-gray-500 mb-8">
        Welcome back to <span className="font-semibold text-gray-700">{orgName}</span>. Use the
        cards below to navigate to your modules.
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-3xl" aria-hidden="true">{card.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600">{card.name}</p>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </div>
              <span className="mt-auto text-xs font-medium text-blue-500 group-hover:underline">
                Open &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Getting started</h2>
        <ul className="flex flex-col gap-2">
          {GETTING_STARTED_STEPS.map((step) => (
            <li key={step.href}>
              <Link
                to={step.href}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" />
                </svg>
                <span>{step.label}</span>
                <svg className="ml-auto h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
