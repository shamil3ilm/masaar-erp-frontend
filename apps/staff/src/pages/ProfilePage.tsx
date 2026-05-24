import { useNavigate } from '@tanstack/react-router'
import { ProfilePage as UIProfilePage } from '@erp/ui'
import { useAuthStore } from '../store/auth'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, organization, logout } = useAuthStore()

  const role = user?.is_super_admin
    ? 'Super Admin'
    : (user?.roles?.map((r) => r.name).join(', ') || 'Member')

  return (
    <UIProfilePage
      name={user?.name}
      email={user?.email}
      role={role}
      organization={
        organization
          ? {
              name: organization.name,
              country: organization.country,
              currency: organization.currency,
              taxNumber: organization.tax_number,
            }
          : null
      }
      homeHref="/app/dashboard"
      onSignOut={() => {
        logout()
        void navigate({ to: '/login' })
      }}
    />
  )
}
