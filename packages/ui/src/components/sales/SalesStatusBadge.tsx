import { statusLabel } from '../../lib/status-label'
import { StatusPill } from '../StatusPill'

const STATUS_COLORS: Record<string, string> = {
  // Contact type
  customer: 'bg-blue-100 text-blue-700',
  supplier: 'bg-purple-100 text-purple-700',
  both: 'bg-indigo-100 text-indigo-700',
  // Common
  draft: 'bg-gray-100 text-gray-700',
  voided: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-700',
  // Quotation
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  converted: 'bg-purple-100 text-purple-700',
  // Sales Order
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  partially_delivered: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced: 'bg-teal-100 text-teal-700',
  // Invoice
  partial: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  // Invoice compliance
  not_applicable: 'bg-gray-100 text-gray-500',
  submitted: 'bg-blue-100 text-blue-700',
  cleared: 'bg-green-100 text-green-700',
  reported: 'bg-purple-100 text-purple-700',
  rejected: 'bg-red-100 text-red-700',
  // Payment
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  bounced: 'bg-red-100 text-red-700',
  // Credit Note
  approved: 'bg-blue-100 text-blue-700',
  applied: 'bg-teal-100 text-teal-700',
  refunded: 'bg-purple-100 text-purple-700',
}

interface SalesStatusBadgeProps {
  /** Missing when the payload omits it, e.g. an unset compliance status. */
  status: string | null | undefined
  className?: string
}

export function SalesStatusBadge({ status, className }: SalesStatusBadgeProps) {
  if (!status) return null
  return (
    <StatusPill tone={STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'} className={className}>
      {statusLabel(status)}
    </StatusPill>
  )
}
