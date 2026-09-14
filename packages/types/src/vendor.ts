import type { Decimal } from './core'
import type { InvoiceStatus, InvoiceType } from './sales'

export interface PortalInvoiceLine {
  id: number
  description: string
  quantity: Decimal
  unit_price: Decimal
  tax_rate: Decimal
  tax_amount: Decimal
  total: Decimal
}

/** The raw invoice `GET /portal/invoices/{id}` returns (CustomerPortalController::showInvoice). */
export interface PortalInvoice {
  id: number
  invoice_number: string
  invoice_type: InvoiceType
  customer_name: string | null
  customer_email: string | null
  customer_tax_number: string | null
  invoice_date: string
  due_date: string | null
  currency_code: string
  subtotal: Decimal
  tax_amount: Decimal
  total: Decimal
  amount_paid: Decimal
  amount_due: Decimal
  status: InvoiceStatus
  compliance_uuid: string | null
  lines: PortalInvoiceLine[]
}
