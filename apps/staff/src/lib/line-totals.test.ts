import { describe, it, expect } from 'vitest'
import { computeTotals, CREDIT_NOTE_TOTALS, INVOICE_TOTALS, QUOTATION_TOTALS } from './line-totals'

const line = (quantity: number, unit_price: number, tax_rate: number) => ({ quantity, unit_price, tax_rate })

/**
 * Every figure below was produced by running the backend's own
 * `App\Support\TaxMath` over the same inputs, not worked out here. The point
 * of this module is to agree with what the server will store, so disagreeing
 * with hand arithmetic is the lesser risk.
 */
describe('computeTotals', () => {
  it('computes VAT per line and document totals in the currency decimals', () => {
    const t = computeTotals([line(2, 50, 15), line(1, 19.99, 5)], INVOICE_TOTALS, 2)

    expect(t.lines[0]).toEqual({ subtotal: '100.00', tax: '15.00', total: '115.00' })
    expect(t.lines[1]).toEqual({ subtotal: '19.99', tax: '1.00', total: '20.99' })
    expect(t).toMatchObject({ subtotal: '119.99', tax: '16.00', discount: '0.00', total: '135.99' })
  })

  it('uses three decimals for dinar currencies', () => {
    const t = computeTotals([line(3, 1.255, 5)], INVOICE_TOTALS, 3)

    // 3.765 at 5% is exactly 0.18825, which rounds to 0.1883 at the stored
    // scale and shows as 0.188.
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

  /**
   * Tax rounds half away from zero at the stored scale. It used to truncate,
   * which understated what the taxpayer owes on every figure that did not land
   * exactly on the scale.
   */
  it('rounds tax half up rather than truncating it', () => {
    // bcmul(1, 10.999, 2) = 10.99; 10.99 at 15% is exactly 1.6485.
    const t = computeTotals([line(1, 10.999, 15)], CREDIT_NOTE_TOTALS, 2)

    expect(t.lines[0]).toEqual({ subtotal: '10.99', tax: '1.65', total: '12.64' })
    expect(computeTotals([line(1, 10.999, 15)], INVOICE_TOTALS, 2).total).toBe('12.65')
  })

  /**
   * And the rate keeps all four of its decimals. The rate used to be divided
   * by 100 and truncated first, so 12.345% was charged as 12.34%.
   */
  it('charges a four decimal rate in full', () => {
    expect(computeTotals([line(1, 100, 12.345)], CREDIT_NOTE_TOTALS, 2).tax).toBe('12.35')
    expect(computeTotals([line(1, 100, 12.345)], INVOICE_TOTALS, 2).tax).toBe('12.35')
  })

  /**
   * A document discount is an allowance over the whole document: it reduces
   * the taxable amount rather than coming off after tax. Charging VAT on the
   * amount before the discount overstates the tax owed, which is what
   * EN 16931 and ZATCA's BR-CO-14 check.
   */
  it('takes a document discount off the taxable amount', () => {
    const t = computeTotals([line(1, 1000, 15)], INVOICE_TOTALS, 2, { type: 'percentage', value: 10 })

    // 100 off 1000 leaves 900 taxable, and 900 at 15% is 135 - not the 150
    // the line itself carries.
    expect(t.lines[0].tax).toBe('150.00')
    expect(t).toMatchObject({ subtotal: '1000.00', discount: '100.00', tax: '135.00', total: '1035.00' })
  })

  /**
   * With more than one rate the allowance is shared between them in
   * proportion to the net charged at each, and each is taxed on what is left
   * of its own net. One category absorbing all of it would leave both bases
   * wrong.
   */
  it('shares a percentage discount across the tax rates', () => {
    const t = computeTotals([line(7, 1.2345, 5), line(2, 100, 15)], INVOICE_TOTALS, 2, {
      type: 'percentage',
      value: 10,
    })

    // 20.8641 off 208.6415, shared 0.8641 to the 5% net and 20.0000 to the
    // 15% one: 7.7774 at 5% plus 180.0000 at 15% is 27.3889.
    expect(t).toMatchObject({ subtotal: '208.64', discount: '20.86', tax: '27.39', total: '215.17' })
  })

  it('shares a fixed discount the same way', () => {
    const t = computeTotals([line(7, 1.2345, 5), line(2, 100, 15)], INVOICE_TOTALS, 2, {
      type: 'fixed',
      value: 5,
    })

    expect(t).toMatchObject({ subtotal: '208.64', discount: '5.00', tax: '29.70', total: '233.34' })
  })

  /**
   * A zero-rated line takes its share of the allowance and contributes no tax,
   * so the share that lands on it is not taxed at the standard rate. Taxing
   * the whole reduced subtotal at 15% would give 22.50 instead of 11.25.
   */
  it('gives a zero rated line its share of the discount', () => {
    const t = computeTotals([line(1, 100, 15), line(1, 100, 0)], INVOICE_TOTALS, 2, {
      type: 'fixed',
      value: 50,
    })

    expect(t).toMatchObject({ subtotal: '200.00', discount: '50.00', tax: '11.25', total: '161.25' })
  })

  it('holds a discount larger than the subtotal at the subtotal', () => {
    const t = computeTotals([line(1, 100, 15)], INVOICE_TOTALS, 2, { type: 'fixed', value: 250 })

    expect(t).toMatchObject({ subtotal: '100.00', discount: '100.00', tax: '0.00', total: '0.00' })
  })

  /**
   * The rates are grouped lowest first, and the last one takes whatever the
   * rounded shares leave. Reading the same lines in another order has to reach
   * the same document, or the preview and the stored figure differ by a
   * ten-thousandth depending on how the rows happened to be sorted.
   */
  it('reaches the same document whatever order the lines are in', () => {
    const lines = [line(1, 3.3333, 5), line(1, 3.3333, 15), line(1, 3.3334, 20)]
    const discount = { type: 'percentage' as const, value: 33.3333 }

    const forwards = computeTotals(lines, INVOICE_TOTALS, 4, discount)
    const backwards = computeTotals([...lines].reverse(), INVOICE_TOTALS, 4, discount)

    expect(backwards.tax).toBe(forwards.tax)
    expect(backwards.total).toBe(forwards.total)
    expect(backwards.discount).toBe(forwards.discount)
  })

  /** A line discount comes off that line before it is taxed. */
  it('taxes a line after its own discount', () => {
    const t = computeTotals(
      [{ quantity: 2, unit_price: 100, tax_rate: 15, discount_type: 'percentage', discount_value: 10 }],
      INVOICE_TOTALS,
      2,
    )

    expect(t.lines[0]).toEqual({ subtotal: '180.00', tax: '27.00', total: '207.00' })
    expect(t).toMatchObject({ subtotal: '180.00', tax: '27.00', total: '207.00' })
  })

  /**
   * An Indian line is taxed at IGST, or at CGST and SGST together, and that
   * is the rate the document groups it by - not the line's own tax_rate.
   */
  it('groups an indian line by the gst it bore', () => {
    const interState = computeTotals(
      [{ quantity: 1, unit_price: 100, tax_rate: 0, igst_rate: 18 }],
      INVOICE_TOTALS,
      2,
    )
    const intraState = computeTotals(
      [{ quantity: 1, unit_price: 100, tax_rate: 0, cgst_rate: 9, sgst_rate: 9 }],
      INVOICE_TOTALS,
      2,
    )

    expect(interState.tax).toBe('18.00')
    expect(intraState.tax).toBe('18.00')
  })

  it('ignores a discount value of zero or less, whichever type is chosen', () => {
    const lines = [line(1, 100, 15)]

    for (const value of [0, -5]) {
      for (const type of ['percentage', 'fixed'] as const) {
        const t = computeTotals(lines, QUOTATION_TOTALS, 2, { type, value })
        expect(t).toMatchObject({ discount: '0.00', tax: '15.00', total: '115.00' })
      }
    }
  })

  it('treats empty and invalid inputs as zero', () => {
    const t = computeTotals(
      [{ quantity: '', unit_price: 'abc', tax_rate: null as unknown as number }],
      INVOICE_TOTALS,
      2,
    )

    expect(t).toMatchObject({ subtotal: '0.00', tax: '0.00', total: '0.00' })
  })
})
