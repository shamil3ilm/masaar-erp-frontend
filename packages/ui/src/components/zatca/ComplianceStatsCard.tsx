import { cn } from '../../lib/utils'

interface ComplianceStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const variants = {
  default: 'bg-white border-gray-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
}

export function ComplianceStatsCard({
  title,
  value,
  subtitle,
  variant = 'default',
  className,
}: ComplianceStatsCardProps) {
  return (
    <div className={cn('rounded-lg border p-5', variants[variant], className)}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  )
}
