import { useEffect, useState } from 'react'
import type { VendorInvoice } from '@erp/types'
import { fetchVendorInvoice } from '../api'

interface InvoicePageProps {
  invoiceId: string
  token: string
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: VendorInvoice['status'] }) {
  const map: Record<VendorInvoice['status'], { label: string; cls: string }> = {
    pending:   { label: 'Pending',   cls: 'badge-pending' },
    submitted: { label: 'Submitted', cls: 'badge-submitted' },
    cleared:   { label: 'Cleared',   cls: 'badge-cleared' },
    rejected:  { label: 'Rejected',  cls: 'badge-rejected' },
  }
  const { label, cls } = map[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

export function InvoicePage({ invoiceId, token }: InvoicePageProps) {
  const [invoice, setInvoice] = useState<VendorInvoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorInvoice(invoiceId, token)
      .then(setInvoice)
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          setError('This link has expired or is no longer valid.')
        } else if (err?.response?.status === 404) {
          setError('Invoice not found.')
        } else {
          setError('Unable to load invoice. Please try again later.')
        }
      })
      .finally(() => setLoading(false))
  }, [invoiceId, token])

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <p>Loading invoice…</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="error-page">
        <div className="error-box">
          <div className="error-icon">⚠</div>
          <h1>Unable to Load Invoice</h1>
          <p>{error ?? 'An unexpected error occurred.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="portal-wrap">
      <header className="portal-header no-print">
        <div className="portal-header-inner">
          {invoice.seller.logo_url ? (
            <img src={invoice.seller.logo_url} alt={invoice.seller.name} className="seller-logo" />
          ) : (
            <span className="seller-name-header">{invoice.seller.name}</span>
          )}
          <div className="header-actions">
            <StatusBadge status={invoice.status} />
            {invoice.pdf_url && (
              <a href={invoice.pdf_url} className="btn-download" download>
                ↓ Download PDF
              </a>
            )}
            <button className="btn-print" onClick={() => window.print()}>
              Print
            </button>
          </div>
        </div>
      </header>

      <main className="invoice-doc">
        {/* Invoice header */}
        <div className="invoice-top">
          <div className="seller-block">
            {invoice.seller.logo_url && (
              <img src={invoice.seller.logo_url} alt={invoice.seller.name} className="seller-logo-print" />
            )}
            <h2 className="seller-name">{invoice.seller.name}</h2>
            {invoice.seller.vat_number && (
              <p className="meta-text">VAT: {invoice.seller.vat_number}</p>
            )}
            {invoice.seller.address && (
              <p className="meta-text">{invoice.seller.address}</p>
            )}
          </div>

          <div className="invoice-meta">
            <h1 className="invoice-title">TAX INVOICE</h1>
            <table className="meta-table">
              <tbody>
                <tr>
                  <th>Invoice #</th>
                  <td>{invoice.invoice_number}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>{fmtDate(invoice.issued_at)}</td>
                </tr>
                {invoice.due_date && (
                  <tr>
                    <th>Due Date</th>
                    <td>{fmtDate(invoice.due_date)}</td>
                  </tr>
                )}
                <tr>
                  <th>Status</th>
                  <td><StatusBadge status={invoice.status} /></td>
                </tr>
                {invoice.zatca_uuid && (
                  <tr>
                    <th>ZATCA UUID</th>
                    <td className="mono">{invoice.zatca_uuid}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill to */}
        <div className="bill-to">
          <h3>Bill To</h3>
          <p className="buyer-name">{invoice.buyer_name}</p>
          {invoice.buyer_vat && <p className="meta-text">VAT: {invoice.buyer_vat}</p>}
          {invoice.buyer_email && <p className="meta-text">{invoice.buyer_email}</p>}
        </div>

        {/* Line items */}
        <table className="line-items">
          <thead>
            <tr>
              <th className="col-desc">Description</th>
              <th className="col-num">Qty</th>
              <th className="col-num">Unit Price</th>
              <th className="col-num">VAT %</th>
              <th className="col-num">VAT</th>
              <th className="col-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{fmt(item.unit_price, invoice.currency)}</td>
                <td className="text-right">{item.vat_rate}%</td>
                <td className="text-right">{fmt(item.vat_amount, invoice.currency)}</td>
                <td className="text-right">{fmt(item.total, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals-wrap">
          <table className="totals-table">
            <tbody>
              <tr>
                <th>Subtotal</th>
                <td>{fmt(invoice.subtotal, invoice.currency)}</td>
              </tr>
              <tr>
                <th>VAT</th>
                <td>{fmt(invoice.vat_amount, invoice.currency)}</td>
              </tr>
              <tr className="total-row">
                <th>Total</th>
                <td>{fmt(invoice.total_amount, invoice.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer className="invoice-footer">
          <p>Generated by {invoice.seller.name} · {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  )
}
