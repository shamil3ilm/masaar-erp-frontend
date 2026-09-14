import { add, dec, mul, percent, rescale, sub, toFixed, type Dec } from './decimal'

/**
 * How the backend turns lines into amounts for one document type.
 *
 * - `inputScale`: the `decimal:N` cast (half-up) applied to quantity, price and
 *   rate before the math runs; `null` when the service uses the raw request.
 * - `amountScale`: the `bcmul` scale for line subtotal and tax (truncates).
 * - `rateScale`: the `bcdiv(rate, '100', N)` scale (truncates).
 */
export interface TotalsRule {
  readonly inputScale: number | null
  readonly amountScale: number
  readonly rateScale: number
}

/** InvoiceLine::calculateTotals (saving hook) and Invoice::recalculateTotals. */
export const INVOICE_TOTALS: TotalsRule = { inputScale: 4, amountScale: 4, rateScale: 6 }

/** QuotationLine::calculateTotals (saving hook) and Quotation::recalculateTotals. */
export const QUOTATION_TOTALS: TotalsRule = { inputScale: 4, amountScale: 4, rateScale: 6 }

/** CreditNoteService::create and ::recalculateTotals work at two decimals on the raw request. */
export const CREDIT_NOTE_TOTALS: TotalsRule = { inputScale: null, amountScale: 2, rateScale: 4 }

export interface LineAmounts {
  quantity: number | string
  unit_price: number | string
  tax_rate: number | string
}

export interface DocumentDiscount {
  type: 'percentage' | 'fixed' | '' | null | undefined
  value: number | string
}

export interface LineTotal {
  subtotal: string
  tax: string
  total: string
}

export interface DocumentTotals {
  lines: LineTotal[]
  subtotal: string
  tax: string
  discount: string
  total: string
}

function input(value: number | string, rule: TotalsRule): Dec {
  const d = dec(value)
  return rule.inputScale === null ? d : rescale(d, rule.inputScale, 'halfUp')
}

function lineAmounts(line: LineAmounts, rule: TotalsRule): { subtotal: Dec; tax: Dec } {
  const subtotal = mul(input(line.quantity, rule), input(line.unit_price, rule), rule.amountScale)
  const tax = mul(subtotal, percent(input(line.tax_rate, rule), rule.rateScale), rule.amountScale)
  return { subtotal, tax }
}

// Quotation::recalculateTotals: a percentage applies to the subtotal, and the
// discount comes off after tax — it does not reduce the taxable amount.
function discountAmount(subtotal: Dec, discount: DocumentDiscount | undefined, rule: TotalsRule): Dec {
  const value = input(discount?.value ?? 0, rule)
  if (value.units <= 0n) return dec(0)
  if (discount?.type === 'percentage') return mul(subtotal, percent(value, rule.rateScale), rule.amountScale)
  if (discount?.type === 'fixed') return value
  return dec(0)
}

/**
 * Line and document totals exactly as the backend stores them, then rounded
 * half-up to the currency's decimals for display.
 *
 * Each line is computed at the backend's scale; the document sums those
 * unrounded line amounts and rounds once. So the document VAT is not always
 * the sum of the rounded line VATs — the same is true of what the API returns.
 */
export function computeTotals(
  lines: readonly LineAmounts[],
  rule: TotalsRule,
  decimals: number,
  discount?: DocumentDiscount,
): DocumentTotals {
  const round = (d: Dec) => toFixed(rescale(d, decimals, 'halfUp'))

  const exact = lines.map((line) => lineAmounts(line, rule))
  const subtotal = exact.reduce((sum, l) => add(sum, l.subtotal), dec(0))
  const tax = exact.reduce((sum, l) => add(sum, l.tax), dec(0))
  const off = discountAmount(subtotal, discount, rule)

  return {
    lines: exact.map((l) => ({ subtotal: round(l.subtotal), tax: round(l.tax), total: round(add(l.subtotal, l.tax)) })),
    subtotal: round(subtotal),
    tax: round(tax),
    discount: round(off),
    total: round(sub(add(subtotal, tax), off)),
  }
}
