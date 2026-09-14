import { cn } from '@masaar/ui'
import type { DocumentTotals } from '../../lib/line-totals'
import { formatCurrency } from '../../lib/format'

interface LineTotalsProps {
  totals: DocumentTotals
  currency: string
}

/** The document summary under the lines, in the order the backend adds it up. */
export function LineTotals({ totals, currency }: LineTotalsProps) {
  const money = (amount: string) => formatCurrency(amount, currency)

  return (
    <dl className="mt-4 ms-auto w-full max-w-xs space-y-1 text-sm">
      <Row label="Subtotal" value={money(totals.subtotal)} />
      <Row label="VAT" value={money(totals.tax)} />
      {Number(totals.discount) > 0 && <Row label="Discount" value={`− ${money(totals.discount)}`} />}
      <Row label="Total" value={money(totals.total)} className="border-t border-border pt-1 font-semibold" />
    </dl>
  )
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex justify-between gap-4', className)}>
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}
