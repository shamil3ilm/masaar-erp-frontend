import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Info, CheckCircle2, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'

const alertVariants = cva(
  'flex items-start gap-3 rounded-[var(--radius)] border p-3 text-sm',
  {
    variants: {
      variant: {
        info:    'bg-info-subtle text-info border-transparent',
        success: 'bg-success-subtle text-success border-transparent',
        warning: 'bg-warning-subtle text-warning border-transparent',
        danger:  'bg-danger-subtle text-danger border-transparent',
      },
    },
    defaultVariants: { variant: 'info' },
  },
)

const ICONS: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
}

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string
  children?: ReactNode
  /** Set false to hide the leading status icon. */
  icon?: boolean
  className?: string
}

export function Alert({ variant = 'info', title, children, icon = true, className }: AlertProps) {
  const Icon = ICONS[variant ?? 'info']
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)}>
      {icon && <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={cn(title && 'opacity-90', 'leading-relaxed')}>{children}</div>}
      </div>
    </div>
  )
}

export { alertVariants }
