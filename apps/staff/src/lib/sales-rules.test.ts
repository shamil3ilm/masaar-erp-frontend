import { describe, it, expect } from 'vitest'
import {
  canCancelOrder, canConvertQuotation, canInvoiceOrder, canVoidCreditNote, canVoidInvoice,
} from './sales-rules'

describe('canVoidCreditNote', () => {
  it('allows voiding while nothing has been applied', () => {
    expect(canVoidCreditNote({ status: 'draft', applied_amount: '0.00' })).toBe(true)
    expect(canVoidCreditNote({ status: 'approved', applied_amount: '0.00' })).toBe(true)
  })

  it('blocks voiding once any amount is applied, whatever the status', () => {
    expect(canVoidCreditNote({ status: 'approved', applied_amount: '0.01' })).toBe(false)
    expect(canVoidCreditNote({ status: 'draft', applied_amount: '25.00' })).toBe(false)
  })

  it('does not offer voiding an already voided note', () => {
    expect(canVoidCreditNote({ status: 'voided', applied_amount: '0.00' })).toBe(false)
  })
})

describe('order and quotation rules', () => {
  it('converts only accepted quotations', () => {
    expect(canConvertQuotation('accepted')).toBe(true)
    expect(canConvertQuotation('sent')).toBe(false)
  })

  it('invoices only delivered or partially delivered orders', () => {
    expect(canInvoiceOrder('partially_delivered')).toBe(true)
    expect(canInvoiceOrder('delivered')).toBe(true)
    expect(canInvoiceOrder('confirmed')).toBe(false)
  })

  it('cancels up to partial delivery', () => {
    expect(canCancelOrder('processing')).toBe(true)
    expect(canCancelOrder('partially_delivered')).toBe(true)
    expect(canCancelOrder('delivered')).toBe(false)
  })

  it('voids overdue invoices but not paid or partially paid ones', () => {
    expect(canVoidInvoice('overdue')).toBe(true)
    expect(canVoidInvoice('partial')).toBe(false)
    expect(canVoidInvoice('paid')).toBe(false)
  })
})
