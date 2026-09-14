import type {
  CreditNote,
  CreditNoteStatus,
  InvoiceStatus,
  PaymentStatus,
  QuotationStatus,
  SalesOrderStatus,
} from '@masaar/types'

/*
 * Which row actions the backend will accept. Each rule mirrors the guard named
 * beside it, so a button is only offered when the request can succeed.
 */

/** QuotationController::send */
export function canSendQuotation(status: QuotationStatus): boolean {
  return status === 'draft' || status === 'expired'
}

/** Quotation::canBeConverted */
export function canConvertQuotation(status: QuotationStatus): boolean {
  return status === 'accepted'
}

/** SalesOrderController::confirm */
export function canConfirmOrder(status: SalesOrderStatus): boolean {
  return status === 'draft'
}

/** SalesOrder::canBeInvoiced */
export function canInvoiceOrder(status: SalesOrderStatus): boolean {
  return status === 'partially_delivered' || status === 'delivered'
}

const CANCELLABLE_ORDER: readonly SalesOrderStatus[] = ['draft', 'confirmed', 'processing', 'partially_delivered']

/** SalesOrderController::cancel */
export function canCancelOrder(status: SalesOrderStatus): boolean {
  return CANCELLABLE_ORDER.includes(status)
}

/** InvoiceService::send */
export function canSendInvoice(status: InvoiceStatus): boolean {
  return status === 'draft'
}

/** InvoiceService::void refuses paid, partially paid and already voided invoices. */
export function canVoidInvoice(status: InvoiceStatus): boolean {
  return status === 'draft' || status === 'sent' || status === 'overdue'
}

/** PaymentService::complete */
export function canCompletePayment(status: PaymentStatus): boolean {
  return status === 'pending'
}

/** PaymentService::void only refuses a payment that is already voided. */
export function canVoidPayment(status: PaymentStatus): boolean {
  return status !== 'voided'
}

/** CreditNoteService::approve */
export function canApproveCreditNote(status: CreditNoteStatus): boolean {
  return status === 'draft'
}

/**
 * CreditNoteService::void blocks on any applied amount, whatever the status.
 * A voided note is left out too: voiding it again changes nothing.
 */
export function canVoidCreditNote(note: Pick<CreditNote, 'status' | 'applied_amount'>): boolean {
  return !(Number(note.applied_amount) > 0) && note.status !== 'voided'
}
