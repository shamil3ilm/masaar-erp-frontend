import { describe, it, expect } from 'vitest'
import { computeTotals, CREDIT_NOTE_TOTALS, INVOICE_TOTALS, QUOTATION_TOTALS } from './line-totals'

const line = (quantity: number, unit_price: number, tax_rate: number) => ({ quantity, unit_price, tax_rate })

describe('computeTotals', () => {
  it('computes VAT per line and document totals in the currency decimals', () => {
    const t = computeTotals([line(2, 50, 15), line(1, 19.99, 5)], INVOICE_TOTALS, 2)

    expect(t.lines[0]).toEqual({ subtotal: '100.00', tax: '15.00', total: '115.00' })
    expect(t.lines[1]).toEqual({ subtotal: '19.99', tax: '1.00', total: '20.99' })
    expect(t).toMatchObject({ subtotal: '119.99', tax: '16.00', discount: '0.00', total: '135.99' })
  })

  it('uses three decimals for dinar currencies', () => {
    const t = computeTotals([line(3, 1.255, 5)], INVOICE_TOTALS, 3)

    expect(t.lines[0]).toEqual({ subtotal: '3.765', tax: '0.188', total: '3.953' })
    expect(t.total).toBe('3.953')
  })

  it('rounds the document from unrounded line amounts, not from rounded lines', () => {
    // Each line's VAT is 0.005: 0.01 once rounded, but the three sum to 0.015.
    const t = computeTotals([line(1, 0.1, 5), line(1, 0.1, 5), line(1, 0.1, 5)], INVOICE_TOTALS, 2)

    expect(t.lines.map((l) => l.tax)).toEqual(['0.01', '0.01', '0.01'])
    expect(t.tax).toBe('0.02')
  })

  it('applies the decimal:4 cast to invoice inputs before multiplying', () => {
    // 1.00005 is stored as 1.0001, so 10,000 units come to 10,001.
    expect(computeTotals([line(10000, 1.00005, 0)], INVOICE_TOTALS, 2).subtotal).toBe('10001.00')
  })

  it('truncates credit note lines to two decimals, as CreditNoteService does', () => {
    const t = computeTotals([line(1, 10.999, 15)], CREDIT_NOTE_TOTALS, 2)

    // bcmul(1, 10.999, 2) = 10.99; bcmul(10.99, 0.15, 2) = 1.64
    expect(t.lines[0]).toEqual({ subtotal: '10.99', tax: '1.64', total: '12.63' })
    expect(computeTotals([line(1, 10.999, 15)], INVOICE_TOTALS, 2).total).toBe('12.65')
  })

  it('truncates the credit note rate to four decimals', () => {
    // bcdiv(12.345, 100, 4) = 0.1234
    expect(computeTotals([line(1, 100, 12.345)], CREDIT_NOTE_TOTALS, 2).tax).toBe('12.34')
  })

  /*
   * OPEN QUESTION, not settled by the backend: should a document-level discount
   * reduce the VAT it is taken off? Today it does not — Quotation::recalculateTotals
   * taxes the full subtotal and subtracts the discount afterwards, and these
   * numbers describe that. If the decision goes the other way, the expectations
   * below are the ones to change: a 10% discount would tax 90.00 instead of
   * 100.00, giving tax '13.50' and total '103.50'; the 5.00 fixed discount would
   * tax 95.00, giving tax '14.25' and total '109.25'. Only the discounted cases
   * move; 'discount' and 'subtotal' stay as they are.
   */
  it('takes a quotation discount off the subtotal after tax', () => {
    const lines = [line(1, 100, 15)]

    expect(computeTotals(lines, QUOTATION_TOTALS, 2, { type: 'percentage', value: 10 }))
      .toMatchObject({ subtotal: '100.00', tax: '15.00', discount: '10.00', total: '105.00' })
    expect(computeTotals(lines, QUOTATION_TOTALS, 2, { type: 'fixed', value: 5 }))
      .toMatchObject({ subtotal: '100.00', tax: '15.00', discount: '5.00', total: '110.00' })
    expect(computeTotals(lines, QUOTATION_TOTALS, 2, { type: '', value: 5 }))
      .toMatchObject({ discount: '0.00', total: '115.00' })
  })

  it('ignores a discount value of zero or less, whichever type is chosen', () => {
    const lines = [line(1, 100, 15)]

    expect(computeTotals(lines, QUOTATION_TOTALS, 2, { type: 'percentage', value: 0 }).total).toBe('115.00')
    expect(computeTotals(lines, QUOTATION_TOTALS, 2, { type: 'fixed', value: -20 }))
      .toMatchObject({ discount: '0.00', total: '115.00' })
  })

  it('treats empty and invalid inputs as zero', () => {
    const t = computeTotals([line(Number.NaN, Number.NaN, Number.NaN)], INVOICE_TOTALS, 2)

    expect(t).toMatchObject({ subtotal: '0.00', tax: '0.00', total: '0.00' })
    expect(computeTotals([], INVOICE_TOTALS, 3).total).toBe('0.000')
  })
})
