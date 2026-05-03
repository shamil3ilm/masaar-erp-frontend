import { useState } from 'react'
import { useComplianceReport } from '@erp/api-client'
import { ComplianceStatsCard, LoadingSpinner, PageHeader } from '@erp/ui'

export function ReportsPage() {
  const [dateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  })

  const { data: report, isLoading, isError } = useComplianceReport(dateRange)

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
  if (isError || !report) return <div className="p-6 text-red-600">Failed to load compliance report.</div>

  return (
    <div className="p-6">
      <PageHeader
        title="Compliance Report"
        breadcrumbs={[{ label: 'Compliance' }, { label: 'ZATCA' }, { label: 'Reports' }]}
      />
      <p className="text-sm text-gray-500 mb-6">
        {dateRange.start} to {dateRange.end}
        {report.last_submission_at && (
          <> · Last submission: {new Date(report.last_submission_at).toLocaleString()}</>
        )}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <ComplianceStatsCard title="Total Submitted" value={report.total_submitted} />
        <ComplianceStatsCard title="Cleared" value={report.total_cleared} variant="success" />
        <ComplianceStatsCard title="Rejected" value={report.total_rejected} variant="danger" />
        <ComplianceStatsCard title="Pending" value={report.total_pending} variant="warning" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ComplianceStatsCard
          title="Clearance Rate"
          value={`${report.clearance_rate.toFixed(1)}%`}
          subtitle="% of submitted invoices cleared"
          variant={report.clearance_rate >= 90 ? 'success' : 'warning'}
        />
        <ComplianceStatsCard
          title="Rejection Rate"
          value={`${report.rejection_rate.toFixed(1)}%`}
          subtitle="% of submitted invoices rejected"
          variant={report.rejection_rate > 5 ? 'danger' : 'default'}
        />
      </div>
    </div>
  )
}
