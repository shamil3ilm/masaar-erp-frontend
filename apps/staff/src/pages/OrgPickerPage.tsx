import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/auth'

export function OrgPickerPage() {
  const { organizations, organization, switchOrg } = useAuthStore()
  const navigate = useNavigate()

  function handleSelect(orgId: string) {
    const org = organizations.find((o) => o.id === orgId)
    if (org) {
      switchOrg(org)
      navigate({ to: '/app/dashboard' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="max-w-md w-full bg-surface rounded-[var(--radius)] border border-border shadow-card p-8">
        <h1 className="text-xl font-semibold tracking-tight text-text mb-4">Select organization</h1>
        <div className="space-y-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className={`w-full text-start px-4 py-3 rounded-[var(--radius)] border text-sm font-medium transition-colors ${
                organization?.id === org.id
                  ? 'border-brand bg-brand-subtle text-brand-dark dark:text-brand'
                  : 'border-border hover:bg-surface-2 text-text'
              }`}
            >
              {org.name}
              <span className="block text-xs text-muted font-normal">{org.country} · {org.currency}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
