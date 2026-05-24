// Contacts
export type ContactType = 'customer' | 'supplier' | 'both'

export interface Contact {
  id: string
  contact_type: ContactType
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  tax_number: string | null
  payment_terms: number
  credit_limit: number
  currency_code: string
  is_active: boolean
  payment_block: boolean
  payment_block_reason: string | null
  outstanding_balance: number
  available_credit: number
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

// Quotations
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired' | 'converted'

export interface QuotationLine {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
}

export interface Quotation {
  id: string
  quotation_number: string
  customer_id: string
  customer_name: string
  quotation_date: string
  valid_until: string
  currency_code: string
  exchange_rate: number
  subtotal: number
  discount_type: 'percentage' | 'fixed' | null
  discount_value: number
  discount_amount: number
  tax_amount: number
  total: number
  status: QuotationStatus
  salesperson_id: string | null
  notes: string | null
  lines: QuotationLine[]
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

export interface SalesOrderFulfillment {
  total_quantity: number
  delivered_quantity: number
  invoiced_quantity: number
  delivery_percentage: number
  invoice_percentage: number
}

export interface SalesOrder {
  id: string
  order_number: string
  quotation_id: string | null
  customer_id: string
  customer_name: string
  order_date: string
  expected_delivery_date: string | null
  currency_code: string
  total: number
  status: SalesOrderStatus
  warehouse_id: string | null
  fulfillment: SalesOrderFulfillment
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
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  subtotal: number
  tax_amount: number
  total: number
}

export interface Invoice {
  id: string
  invoice_number: string
  invoice_type: InvoiceType
  customer_id: string
  customer_name: string
  customer_tax_number: string | null
  invoice_date: string
  due_date: string | null
  currency_code: string
  exchange_rate: number
  subtotal: number
  tax_amount: number
  total: number
  amount_paid: number
  amount_due: number
  status: InvoiceStatus
  compliance_status: InvoiceComplianceStatus
  compliance_uuid: string | null
  compliance_qr_code: string | null
  sales_order_id: string | null
  quotation_id: string | null
  lines: InvoiceLine[]
}

export interface InvoiceSummary {
  total_invoiced: number
  total_paid: number
  total_outstanding: number
  overdue_count: number
  overdue_amount: number
}

// Payments Received
export type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'online' | 'other'
export type PaymentStatus = 'pending' | 'completed' | 'bounced' | 'voided'

export interface PaymentAllocation {
  invoice_id: string
  amount: number
}

export interface PaymentReceived {
  id: string
  payment_number: string
  payment_date: string
  customer_id: string
  customer_name: string
  amount: number
  currency_code: string
  payment_method: PaymentMethod
  status: PaymentStatus
  allocated_amount: number
  unallocated_amount: number
  reference: string | null
  bank_account_id: string | null
}

export interface PaymentSummary {
  total_received: number
  total_allocated: number
  total_unallocated: number
}

export interface OpenItem {
  invoice_id: string
  invoice_number: string
  customer_name: string
  due_date: string
  amount_due: number
  currency_code: string
}

// Credit Notes
export type CreditNoteStatus = 'draft' | 'approved' | 'applied' | 'refunded' | 'voided'

export interface CreditNote {
  id: string
  credit_note_number: string
  invoice_id: string | null
  contact_id: string
  contact_name: string
  credit_note_date: string
  total: number
  applied_amount: number
  available_amount: number
  reason: string
  status: CreditNoteStatus
}
