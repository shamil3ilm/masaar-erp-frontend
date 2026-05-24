import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-normal',
  {
    variants: {
      variant: {
        default:  'bg-surface-2 text-text border-border',
        brand:    'bg-brand-subtle text-brand-dark dark:text-brand border-transparent',
        success:  'bg-success-subtle text-success border-transparent',
        danger:   'bg-danger-subtle text-danger border-transparent',
        warning:  'bg-warning-subtle text-warning border-transparent',
        info:     'bg-info-subtle text-info border-transparent',
        muted:    'bg-surface-2 text-muted border-border',
        outline:  'bg-transparent text-muted border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const dotColors: Record<string, string> = {
  default: 'bg-text',
  brand:   'bg-brand',
  success: 'bg-success',
  danger:  'bg-danger',
  warning: 'bg-warning',
  info:    'bg-info',
  muted:   'bg-muted',
  outline: 'bg-muted',
}

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant ?? 'default'])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// ── Semantic status badge ─────────────────────────────────────────────────────

type StatusColor = 'success' | 'danger' | 'warning' | 'info' | 'brand' | 'muted' | 'default'

const STATUS_MAP: Record<string, StatusColor> = {
  // generic
  active:    'success',
  inactive:  'muted',
  enabled:   'success',
  disabled:  'muted',
  pending:   'warning',
  draft:     'muted',
  completed: 'success',
  cancelled: 'danger',
  failed:    'danger',
  error:     'danger',
  blocked:   'danger',
  review:    'info',
  in_review: 'info',
  processing: 'info',
  // sales
  paid:      'success',
  partial:   'warning',
  overdue:   'danger',
  sent:      'info',
  void:      'muted',
  refunded:  'muted',
  // compliance
  submitted:  'brand',
  cleared:    'success',
  rejected:   'danger',
  registered: 'success',
}

interface StatusBadgeProps {
  status: string
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, label, dot = true, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/[^a-z]/g, '_')
  const variant: StatusColor = STATUS_MAP[key] ?? 'default'
  return (
    <Badge variant={variant} dot={dot} className={className}>
      {label ?? status}
    </Badge>
  )
}

export { badgeVariants }
