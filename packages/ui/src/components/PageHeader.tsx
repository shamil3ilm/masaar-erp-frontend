import { type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../lib/utils'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  back?: { label?: string; href?: string; onClick?: () => void }
  description?: string
  className?: string
}

export function PageHeader({ title, breadcrumbs, actions, back, description, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Back button */}
      {back && (
        <div className="mb-3">
          {back.href ? (
            <a
              href={back.href}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-text transition-colors"
            >
              <ChevronLeft size={16} />
              {back.label ?? 'Back'}
            </a>
          ) : (
            <button
              type="button"
              onClick={back.onClick}
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-text transition-colors"
            >
              <ChevronLeft size={16} />
              {back.label ?? 'Back'}
            </button>
          )}
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-muted mb-1.5" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-faint" aria-hidden="true">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-text hover:underline transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-text font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
