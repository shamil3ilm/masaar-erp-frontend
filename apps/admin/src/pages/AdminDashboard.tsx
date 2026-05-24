import { Logo, PageHeader } from '@erp/ui'

interface AdminDashboardProps {
  onLogout: () => void
}

interface CapabilityCard {
  title: string
  description: string
}

const CAPABILITY_CARDS: CapabilityCard[] = [
  { title: 'Organizations', description: 'Manage tenant organizations' },
  { title: 'Users', description: 'Manage system users' },
  { title: 'Modules', description: 'Configure module access' },
  { title: 'Audit Log', description: 'View system activity' },
]

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Masaar Admin Console</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors"
        >
          Sign out
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader
          title="Admin Dashboard"
          breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITY_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3"
            >
              <div>
                <h2 className="text-base font-semibold text-gray-900">{card.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </div>
              <div className="mt-auto">
                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
