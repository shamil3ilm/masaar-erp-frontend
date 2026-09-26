import type { InvoiceStatus, PortalInvoice, PortalInvoiceLine } from '@masaar/types'
import { formatCurrency, formatDate, formatNumber } from './format'

interface Props {
  invoice: PortalInvoice
}

// Invoice statuses mapped onto the badge styles index.css defines.
const STATUS: Record<InvoiceStatus, { label: string; tone: string }> = {
  draft: { label: 'Draft', tone: 'pending' },
  sent: { label: 'Issued', tone: 'submitted' },
  partial: { label: 'Partially paid', tone: 'submitted' },
  paid: { label: 'Paid', tone: 'cleared' },
  overdue: { label: 'Overdue', tone: 'rejected' },
  voided: { label: 'Voided', tone: 'rejected' },
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, tone } = STATUS[status] ?? { label: status, tone: 'pending' }
  return <span className={`badge badge-${tone}`}>{label}</span>
}

function LineItemRow({ item, currency }: { item: PortalInvoiceLine; currency: string }) {
  return (
    <tr>
      <td className="col-desc">{item.description}</td>
      <td className="col-num text-right">{formatNumber(item.quantity)}</td>
      <td className="col-num text-right">{formatCurrency(item.unit_price, currency)}</td>
      <td className="col-num text-right">{formatNumber(item.tax_rate)}%</td>
      <td className="col-num text-right">{formatCurrency(item.tax_amount, currency)}</td>
      <td className="col-num text-right">{formatCurrency(item.total, currency)}</td>
    </tr>
  )
}

export function InvoiceViewer({ invoice }: Props) {
  const currency = invoice.currency_code

  return (
    <div className="portal-wrap">
      {/* Sticky header */}
      <header className="portal-header no-print">
        <div className="portal-header-inner">
          <div>
            <span className="seller-name-header">Invoice {invoice.invoice_number}</span>
          </div>
          <div className="header-actions">
            <StatusBadge status={invoice.status} />
            <button
              type="button"
              className="btn-print"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Invoice document */}
      <main>
        <div className="invoice-doc">
          <div className="invoice-top">
            <div className="invoice-meta">
              <h1 className="invoice-title">INVOICE</h1>
              {/* Named, because a screen reader announces a table by its name
                  and this document holds three of them. */}
              <table className="meta-table" aria-label="Invoice details">
                <tbody>
                  <tr>
                    <th>Invoice #</th>
                    <td>{invoice.invoice_number}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td><StatusBadge status={invoice.status} /></td>
                  </tr>
                  <tr>
                    <th>Issued</th>
                    <td>{formatDate(invoice.invoice_date)}</td>
                  </tr>
                  {invoice.due_date && (
                    <tr>
                      <th>Due</th>
                      <td>{formatDate(invoice.due_date)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill to */}
          <div className="bill-to">
            <h2>Bill To</h2>
            <div className="buyer-name">{invoice.customer_name ?? '—'}</div>
            {invoice.customer_tax_number && (
              <div className="meta-text">VAT: {invoice.customer_tax_number}</div>
            )}
            {invoice.customer_email && (
              <div className="meta-text">{invoice.customer_email}</div>
            )}
          </div>

          {/* Line items */}
          <table className="line-items" aria-label="Invoice line items">
            <thead>
              <tr>
                <th className="col-desc">Description</th>
                <th className="col-num text-right">Qty</th>
                <th className="col-num text-right">Unit Price</th>
                <th className="col-num text-right">VAT %</th>
                <th className="col-num text-right">VAT Amt</th>
                <th className="col-num text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((item) => (
                <LineItemRow key={item.id} item={item} currency={currency} />
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-wrap">
            <table className="totals-table" aria-label="Invoice totals">
              <tbody>
                <tr>
                  <th>Subtotal</th>
                  <td>{formatCurrency(invoice.subtotal, currency)}</td>
                </tr>
                <tr>
                  <th>VAT</th>
                  <td>{formatCurrency(invoice.tax_amount, currency)}</td>
                </tr>
                <tr className="total-row">
                  <th>Total</th>
                  <td>{formatCurrency(invoice.total, currency)}</td>
                </tr>
                <tr>
                  <th>Amount due</th>
                  <td>{formatCurrency(invoice.amount_due, currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {invoice.compliance_uuid && (
            <div className="invoice-footer">
              <p className="mono">ZATCA UUID: {invoice.compliance_uuid}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
