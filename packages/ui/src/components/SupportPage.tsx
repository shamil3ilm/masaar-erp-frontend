import { FileText, Mail, Globe, ExternalLink, ArrowRight, type LucideIcon } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { Card } from './Card'
import { Alert } from './Alert'
import { buttonVariants } from './Button'

export interface SupportResource {
  icon: LucideIcon
  title: string
  description: string
  href: string
  cta: string
  external?: boolean
}

const DEFAULT_RESOURCES: SupportResource[] = [
  { icon: FileText, title: 'Documentation', description: 'Guides for invoicing, VAT, ZATCA e-invoicing, and payroll.', href: 'https://docs.masaar.app', cta: 'Open docs', external: true },
  { icon: Mail,     title: 'Email support',  description: 'Reach our team for account or billing questions.',        href: 'mailto:support@masaar.app', cta: 'support@masaar.app' },
  { icon: Globe,    title: 'System status',  description: 'Check live uptime and incident history.',                  href: 'https://status.masaar.app', cta: 'View status', external: true },
]

export interface SupportPageProps {
  resources?: SupportResource[]
  responseNote?: string
  /** First breadcrumb link (e.g. the app's dashboard). Omit for a single-level crumb. */
  homeHref?: string
}

export function SupportPage({
  resources = DEFAULT_RESOURCES,
  responseNote = 'Our team typically responds within one business day.',
  homeHref,
}: SupportPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Help & support"
        breadcrumbs={homeHref ? [{ label: 'Workspace', href: homeHref }, { label: 'Help & support' }] : [{ label: 'Help & support' }]}
      />

      <Alert variant="info" title="We're here to help" className="mb-5">
        {responseNote}
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map((r) => (
          <Card key={r.title}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand-dark dark:text-brand">
                <r.icon size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-text">{r.title}</h3>
                <p className="mt-0.5 text-xs text-muted leading-snug">{r.description}</p>
              </div>
            </div>
            <a
              href={r.href}
              target={r.external ? '_blank' : undefined}
              rel={r.external ? 'noreferrer' : undefined}
              className={`${buttonVariants({ variant: 'outline', size: 'sm' })} mt-4 w-full`}
            >
              {r.cta}
              {r.external ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
