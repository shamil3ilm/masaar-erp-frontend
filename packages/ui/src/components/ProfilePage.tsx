import { type ReactNode } from 'react'
import { Mail, LogOut } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { Card, CardHeader, CardBody } from './Card'
import { Badge } from './Badge'
import { Button } from './Button'

export interface ProfileOrganization {
  name?: string
  country?: string
  currency?: string
  taxNumber?: string
}

export interface ProfilePageProps {
  name?: string
  email?: string
  role?: string
  organization?: ProfileOrganization | null
  onSignOut?: () => void
  /** First breadcrumb link (e.g. the app's dashboard). Omit for a single-level crumb. */
  homeHref?: string
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '—'
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-text text-end">{value}</span>
    </div>
  )
}

export function ProfilePage({ name, email, role = 'Member', organization, onSignOut, homeHref }: ProfilePageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Profile"
        breadcrumbs={homeHref ? [{ label: 'Workspace', href: homeHref }, { label: 'Profile' }] : [{ label: 'Profile' }]}
      />

      <Card className="mb-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-semibold text-brand-fg">
            {initials(name ?? '')}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold tracking-tight text-text truncate">{name ?? '—'}</div>
            {email && (
              <div className="text-sm text-muted truncate flex items-center gap-1.5">
                <Mail size={14} /> {email}
              </div>
            )}
          </div>
          <Badge variant="brand">{role}</Badge>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Account" description="Your personal details." />
          <CardBody>
            <Row label="Full name" value={name ?? '—'} />
            <Row label="Email" value={email ?? '—'} />
            <Row label="Role" value={role} />
          </CardBody>
        </Card>

        {organization && (
          <Card>
            <CardHeader title="Organization" description="The workspace you're signed in to." />
            <CardBody>
              <Row label="Name" value={organization.name ?? '—'} />
              <Row label="Country" value={organization.country ?? '—'} />
              <Row label="Currency" value={organization.currency ?? '—'} />
              <Row label="Tax number" value={organization.taxNumber ?? '—'} />
            </CardBody>
          </Card>
        )}
      </div>

      {onSignOut && (
        <div className="mt-6 flex justify-end">
          <Button variant="danger-outline" iconLeft={<LogOut size={14} />} onClick={onSignOut}>
            Sign out
          </Button>
        </div>
      )}
    </div>
  )
}
