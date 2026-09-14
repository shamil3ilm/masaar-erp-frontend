import type { ZatcaComplianceStatus } from '@masaar/types'
import { StatusPill } from '../StatusPill'

const statusConfig: Record<ZatcaComplianceStatus, { label: string; tone: string }> = {
  pending: { label: 'Pending', tone: 'bg-gray-100 text-gray-700' },
  submitted: { label: 'Submitted', tone: 'bg-blue-100 text-blue-700' },
  cleared: { label: 'Cleared', tone: 'bg-green-100 text-green-700' },
  reported: { label: 'Reported', tone: 'bg-purple-100 text-purple-700' },
  rejected: { label: 'Rejected', tone: 'bg-red-100 text-red-700' },
}

interface ZatcaStatusBadgeProps {
  status: ZatcaComplianceStatus
  className?: string
}

export function ZatcaStatusBadge({ status, className }: ZatcaStatusBadgeProps) {
  const { label, tone } = statusConfig[status]
  return <StatusPill tone={tone} className={className}>{label}</StatusPill>
}
