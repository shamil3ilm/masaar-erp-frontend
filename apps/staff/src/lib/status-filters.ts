import type {
  ContactType, CreditNoteStatus, InvoiceStatus, PaymentStatus, QuotationStatus, SalesOrderStatus,
} from '@masaar/types'

/* The values each list endpoint accepts for its `status` (or type) filter, in menu order. */

export const INVOICE_STATUSES: readonly InvoiceStatus[] = ['draft', 'sent', 'partial', 'paid', 'overdue', 'voided']

export const QUOTATION_STATUSES: readonly QuotationStatus[] = ['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']

export const ORDER_STATUSES: readonly SalesOrderStatus[] = [
  'draft', 'confirmed', 'processing', 'partially_delivered', 'delivered', 'invoiced', 'cancelled',
]

export const PAYMENT_STATUSES: readonly PaymentStatus[] = ['pending', 'completed', 'bounced', 'voided']

export const CREDIT_NOTE_STATUSES: readonly CreditNoteStatus[] = ['draft', 'approved', 'applied', 'refunded', 'voided']

export const CONTACT_TYPES: readonly ContactType[] = ['customer', 'supplier', 'both']
