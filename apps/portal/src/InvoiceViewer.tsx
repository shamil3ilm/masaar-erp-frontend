import type { VendorInvoice, VendorLineItem } from '@erp/types'

interface Props {
  invoice: VendorInvoice
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

function StatusBadge({ status }: { status: VendorInvoice['status'] }) {
  const labelMap: Record<VendorInvoice['status'], string> = {
    pending: 'Pending',
    submitted: 'Submitted',
    cleared: 'Cleared',
    rejected: 'Rejected',
  }
  return (
    <span className={`badge badge-${status}`}>
      {labelMap[status]}
    </span>
  )
}

function LineItemRow({ item, currency }: { item: VendorLineItem; currency: string }) {
  return (
    <tr>
      <td className="col-desc">{item.description}</td>
      <td className="col-num text-right">{item.quantity}</td>
      <td className="col-num text-right">{formatCurrency(item.unit_price, currency)}</td>
      <td className="col-num text-right">{item.vat_rate}%</td>
      <td className="col-num text-right">{formatCurrency(item.vat_amount, currency)}</td>
      <td className="col-num text-right">{formatCurrency(item.total, currency)}</td>
    </tr>
  )
}

export function InvoiceViewer({ invoice }: Props) {
  return (
    <div className="portal-wrap">
      {/* Sticky header */}
      <header className="portal-header no-print">
        <div className="portal-header-inner">
          <div>
            {invoice.seller.logo_url ? (
              <img
                src={invoice.seller.logo_url}
                alt={invoice.seller.name}
                className="seller-logo"
              />
            ) : (
              <span className="seller-name-header">{invoice.seller.name}</span>
            )}
          </div>
          <div className="header-actions">
            {invoice.pdf_url && (
              <a
                href={invoice.pdf_url}
                download
                className="btn-download"
              >
                ↓ Download PDF
              </a>
            )}
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
          {/* Top: seller info + invoice meta */}
          <div className="invoice-top">
            <div className="seller-block">
              {invoice.seller.logo_url && (
                <img
                  src={invoice.seller.logo_url}
                  alt={invoice.seller.name}
                  className="seller-logo-print"
                />
              )}
              <div className="seller-name">{invoice.seller.name}</div>
              {invoice.seller.vat_number && (
                <div className="meta-text">VAT: {invoice.seller.vat_number}</div>
              )}
              {invoice.seller.address && (
                <div className="meta-text">{invoice.seller.address}</div>
              )}
            </div>

            <div className="invoice-meta">
              <div className="invoice-title">INVOICE</div>
              <table className="meta-table">
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
                    <td>{formatDate(invoice.issued_at)}</td>
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
            <h3>Bill To</h3>
            <div className="buyer-name">{invoice.buyer_name}</div>
            {invoice.buyer_vat && (
              <div className="meta-text">VAT: {invoice.buyer_vat}</div>
            )}
            {invoice.buyer_email && (
              <div className="meta-text">{invoice.buyer_email}</div>
            )}
          </div>

          {/* Line items */}
          <table className="line-items">
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
              {invoice.line_items.map((item, index) => (
                <LineItemRow
                  key={index}
                  item={item}
                  currency={invoice.currency}
                />
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals-wrap">
            <table className="totals-table">
              <tbody>
                <tr>
                  <th>Subtotal</th>
                  <td>{formatCurrency(invoice.subtotal, invoice.currency)}</td>
                </tr>
                <tr>
                  <th>VAT</th>
                  <td>{formatCurrency(invoice.vat_amount, invoice.currency)}</td>
                </tr>
                <tr className="total-row">
                  <th>Total</th>
                  <td>{formatCurrency(invoice.total_amount, invoice.currency)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            {invoice.zatca_uuid && (
              <p className="mono">ZATCA UUID: {invoice.zatca_uuid}</p>
            )}
            {invoice.pdf_url && (
              <p>
                <a href={invoice.pdf_url} download className="mono">
                  Download PDF
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
