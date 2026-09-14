import type { Decimal } from './core'

// Contacts
export type ContactType = 'customer' | 'supplier' | 'both'

export interface Contact {
  id: number
  uuid: string
  contact_type: ContactType
  company_name: string | null
  contact_name: string | null
  display_name: string
  email: string | null
  phone: string | null
  tax_number: string | null
  payment_terms: number | null
  credit_limit: Decimal | null
  currency_code: string | null
  is_active: boolean
  // Only sent for customers (ContactResource).
  outstanding_balance?: number
}

export interface ContactStatement {
  contact: Contact
  transactions: ContactTransaction[]
  closing_balance: number
}

export interface ContactTransaction {
  date: string
  type: string
  reference: string
  debit: number
  credit: number
  balance: number
}

/** The customer summary resources nest when the relation is loaded. */
export interface CustomerRef {
  id: number
  name: string
  email: string | null
}

// Quotations
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted'

export interface QuotationLine {
  id: number
  product_id: number | null
  description: string
  quantity: Decimal
  unit_price: Decimal
  tax_rate: Decimal
  subtotal: Decimal
  tax_amount: Decimal
  total: Decimal
}

export interface Quotation {
  id: number
  quotation_number: string
  customer_id: number
  customer?: CustomerRef
  customer_name: string | null
  quotation_date: string
  valid_until: string
  currency_code: string
  exchange_rate: Decimal
  subtotal: Decimal
  discount_type: 'percentage' | 'fixed' | null
  discount_value: Decimal | null
  discount_amount: Decimal | null
  tax_amount: Decimal
  total: Decimal
  status: QuotationStatus
  notes: string | null
  lines?: QuotationLine[]
}

// Sales Orders
export type SalesOrderStatus =
  | 'draft'
  | 'confirmed'
  | 'processing'
  | 'partially_delivered'
  | 'delivered'
  | 'invoiced'
  | 'cancelled'

/** SalesOrderController returns the raw model, so dates are full ISO timestamps. */
export interface SalesOrder {
  id: number
  order_number: string
  quotation_id: number | null
  customer_id: number
  customer_name: string | null
  order_date: string
  expected_delivery_date: string | null
  currency_code: string
  total: Decimal
  status: SalesOrderStatus
  warehouse_id: number | null
}

export interface CreditCheckResult {
  approved: boolean
  available_credit: number
  required_amount: number
  reason: string | null
}

// Invoices
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'voided'
export type InvoiceComplianceStatus =
  | 'not_applicable'
  | 'pending'
  | 'submitted'
  | 'cleared'
  | 'reported'
  | 'rejected'
export type InvoiceType = 'standard' | 'simplified' | 'credit_note' | 'debit_note'

export interface InvoiceLine {
  id: number
  product_id: number | null
  description: string
  quantity: Decimal
  unit_price: Decimal
  tax: {
    rate: Decimal
    amount: Decimal
  }
  subtotal: Decimal
  total: Decimal
}

export interface InvoiceCompliance {
  status: InvoiceComplianceStatus | null
  uuid: string | null
  hash: string | null
  qr_code: string | null
  submitted_at: string | null
}

export interface Invoice {
  id: number
  uuid: string
  invoice_number: string
  invoice_type: InvoiceType
  customer_id: number
  customer?: CustomerRef
  customer_name: string | null
  customer_tax_number: string | null
  invoice_date: string
  due_date: string | null
  currency_code: string
  exchange_rate: Decimal
  subtotal: Decimal
  tax_amount: Decimal
  total: Decimal
  amount_paid: Decimal
  amount_due: Decimal
  status: InvoiceStatus
  compliance: InvoiceCompliance
  sales_order_id: number | null
  quotation_id: number | null
  lines?: InvoiceLine[]
}

export interface InvoiceStatusTotal {
  status: InvoiceStatus
  count: number
  total: Decimal
}

// Aggregates come back as whatever the database driver returns for SUM.
export interface InvoiceSummary {
  total_invoices: number
  total_amount: Decimal | number
  total_paid: Decimal | number
  total_outstanding: Decimal | number
  by_status: Record<string, InvoiceStatusTotal>
  overdue_count: number
  overdue_amount: Decimal | number
}

// Payments Received
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'online' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'bounced' | 'voided'

export interface PaymentAllocation {
  invoice_id: number
  amount: number
}

export interface PaymentReceived {
  id: number
  uuid: string
  payment_number: string
  payment_date: string
  customer_id: number
  customer?: CustomerRef
  amount: Decimal
  currency_code: string
  payment_method: PaymentMethod
  payment_method_label: string
  status: PaymentStatus
  allocated_amount: number
  unallocated_amount: number
  reference: string | null
}

export interface PaymentMethodTotal {
  payment_method: PaymentMethod
  count: number
  total: Decimal
}

export interface PaymentSummary {
  total_payments: number
  total_amount: Decimal | number
  by_method: Record<string, PaymentMethodTotal>
}

/** An unpaid invoice as `/payments-received/open-items` selects it. */
export interface OpenItem {
  id: number
  uuid: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  total: Decimal
  amount_paid: Decimal
  amount_due: Decimal
  status: InvoiceStatus
  currency_code: string
}

// Credit Notes
export type CreditNoteType = 'sales' | 'purchase'
export type CreditNoteStatus = 'draft' | 'approved' | 'applied' | 'refunded' | 'voided'

/** The contact relation CreditNoteController loads on the raw model. */
export interface CreditNoteContact {
  id: number
  company_name: string | null
  contact_name: string | null
}

export interface CreditNote {
  id: number
  credit_note_number: string
  credit_note_type: CreditNoteType
  invoice_id: number | null
  contact_id: number
  contact?: CreditNoteContact | null
  credit_note_date: string
  currency_code: string
  total: Decimal
  applied_amount: Decimal
  available_amount: Decimal
  reason: string | null
  status: CreditNoteStatus
}
