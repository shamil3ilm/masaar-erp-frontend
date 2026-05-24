import { Link } from '@tanstack/react-router'
import { PageHeader } from '@erp/ui'
import { useAuthStore } from '../store/auth'

const MODULE_CARDS = [
  {
    icon: '🧾',
    name: 'ZATCA Compliance',
    description: 'Manage e-invoicing, onboarding, and compliance reports for Saudi Arabia.',
    href: '/app/compliance/zatca/onboarding',
  },
] as const

const GETTING_STARTED_STEPS = [
  {
    label: 'Complete ZATCA Onboarding',
    href: '/app/compliance/zatca/onboarding',
  },
  {
    label: 'Create your first invoice',
    href: '/app/compliance/zatca/invoices/create',
  },
  {
    label: 'View compliance reports',
    href: '/app/compliance/zatca/reports',
  },
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

      {/* Module cards */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_CARDS.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="text-3xl" aria-hidden="true">
                {card.icon}
              </span>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {card.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </div>
              <span className="mt-auto text-xs font-medium text-blue-500 group-hover:underline">
                Open &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Getting started checklist */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Getting started</h2>
        <ul className="flex flex-col gap-2">
          {GETTING_STARTED_STEPS.map((step) => (
            <li key={step.href}>
              <Link
                to={step.href}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {/* Checkbox icon */}
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2.5" />
                </svg>
                <span>{step.label}</span>
                <svg
                  className="ml-auto h-4 w-4 shrink-0 text-gray-400"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
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
