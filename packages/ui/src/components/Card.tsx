import { type ReactNode } from 'react'
import { cn } from '../lib/utils'
import type { LucideIcon } from 'lucide-react'

// ── Card primitives ───────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const padCls = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }[padding]
  return (
    <div className={cn('rounded-xl border border-border bg-surface shadow-sm', padCls, className)}>
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
  icon?: LucideIcon
  iconColor?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ label, value, subtitle, icon: Icon, iconColor, trend, className }: StatCardProps) {
  const trendPositive = trend && trend.value >= 0

  return (
    <div className={cn('rounded-xl border border-border bg-surface p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-text tabular-nums">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-2 text-xs font-medium', trendPositive ? 'text-success' : 'text-danger')}>
              {trendPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
              <span className="text-muted font-normal">{trend.label}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg shrink-0', iconColor ?? 'bg-brand-subtle')}>
            <Icon size={20} className={iconColor ? 'text-current' : 'text-brand'} />
          </div>
        )}
      </div>
    </div>
  )
}
