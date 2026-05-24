import { type ComponentType, type ReactNode } from 'react'
import { cn } from '../lib/utils'

// ── Card primitives ───────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const padCls = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }[padding]
  return (
    <div className={cn('rounded-[var(--radius)] border border-border bg-surface shadow-card', padCls, className)}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title?: string
  description?: string
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function CardHeader({ title, description, actions, children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="min-w-0">
        {title && <h3 className="text-base font-semibold text-text truncate">{title}</h3>}
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('text-sm text-text', className)}>{children}</div>
}

// ── StatCard (KPI tile) ───────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: ComponentType<{ size?: number | string; className?: string }>
  iconColor?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ label, value, subtitle, icon: Icon, iconColor, trend, className }: StatCardProps) {
  const trendPositive = trend && trend.value >= 0

  return (
    <div className={cn('rounded-[var(--radius)] border border-border bg-surface p-4 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        {Icon ? (
          <span className={cn('inline-flex w-8 h-8 rounded-md items-center justify-center shrink-0', iconColor ?? 'bg-brand-subtle')}>
            <Icon size={16} className={iconColor ? 'text-current' : 'text-brand-dark dark:text-brand'} />
          </span>
        ) : (
          <span />
        )}
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-0.5 text-[11px] font-semibold',
              trendPositive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger',
            )}
          >
            {trendPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-text tabular-nums">{value}</div>
      {(subtitle || trend?.label) && (
        <div className="text-xs text-muted">{subtitle ?? trend?.label}</div>
      )}
    </div>
  )
}
