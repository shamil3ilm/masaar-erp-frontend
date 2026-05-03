import { cn } from '../../lib/utils'
import type { ZatcaInvoiceStatus } from '@erp/types'

const statusConfig: Record<ZatcaInvoiceStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700' },
  cleared: { label: 'Cleared', className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
}

interface ZatcaStatusBadgeProps {
  status: ZatcaInvoiceStatus
  className?: string
}

export function ZatcaStatusBadge({ status, className }: ZatcaStatusBadgeProps) {
  const { label, className: statusClass } = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  )
}
