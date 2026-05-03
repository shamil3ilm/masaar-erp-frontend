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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Select Organization</h1>
        <div className="space-y-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                organization?.id === org.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-900'
              }`}
            >
              {org.name}
              <span className="block text-xs text-gray-500 font-normal">{org.country} · {org.currency}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
