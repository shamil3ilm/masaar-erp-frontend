import {
  add,
  cmp,
  dec,
  div,
  mul,
  mulExact,
  overHundred,
  rescale,
  sub,
  toFixed,
  type Dec,
} from './decimal'

/**
 * How the backend turns lines into amounts for one document type.
 *
 * - `inputScale`: the `decimal:N` cast (half-up) applied to quantity, price and
 *   rate before the math runs; `null` when the service uses the raw request.
 * - `amountScale`: the scale every stored amount is held at.
 */
export interface TotalsRule {
  readonly inputScale: number | null
  readonly amountScale: number
}

/** InvoiceLine::calculateTotals (saving hook) and Invoice::recalculateTotals. */
export const INVOICE_TOTALS: TotalsRule = { inputScale: 4, amountScale: 4 }

/** QuotationLine::calculateTotals (saving hook) and Quotation::recalculateTotals. */
export const QUOTATION_TOTALS: TotalsRule = { inputScale: 4, amountScale: 4 }

/** CreditNoteService::create and ::recalculateTotals work at two decimals on the raw request. */
export const CREDIT_NOTE_TOTALS: TotalsRule = { inputScale: null, amountScale: 2 }

/**
 * Digits kept past the scale while a share is worked out, matching
 * TaxMath::GUARD, so the figure that reaches the rounding is the exact one.
 */
const GUARD = 8

export interface LineAmounts {
  quantity: number | string
  unit_price: number | string
  tax_rate: number | string
  /** A line discount, taken off before the line is taxed. */
  discount_type?: 'percentage' | 'fixed' | '' | null
  discount_value?: number | string | null
  /** India GST. An IGST rate makes the line inter-state. */
  cgst_rate?: number | string | null
  sgst_rate?: number | string | null
  igst_rate?: number | string | null
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

function input(value: number | string | null | undefined, rule: TotalsRule): Dec {
  const d = dec(value)
  return rule.inputScale === null ? d : rescale(d, rule.inputScale, 'halfUp')
}

/**
 * `TaxMath::percentOf` - a per cent of an amount, truncated.
 *
 * Allowances truncate. Only tax rounds: an allowance a fraction of a halalah
 * short is conservative, an understated VAT is not.
 */
function percentOf(amount: Dec, rate: Dec, scale: number): Dec {
  return rescale(overHundred(mulExact(amount, rate)), scale, 'trunc')
}

/**
 * `TaxMath::tax` - tax on a tax-exclusive amount, rounded half away from zero,
 * and nothing at all when the rate is not positive.
 *
 * The backend truncated this. Truncating tax understates what is owed, and on
 * a credit note it has to round away from zero the other way, which is why
 * `rescale(..., 'halfUp')` is the same call for both signs.
 */
function taxOn(taxable: Dec, rate: Dec, scale: number): Dec {
  if (rate.units <= 0n) return dec(0)

  return rescale(overHundred(mulExact(taxable, rate)), scale, 'halfUp')
}

/**
 * The rate a line was actually taxed at: IGST if it carries one, else CGST and
 * SGST together, else its own tax rate. This is the key the document groups by,
 * so it has to be the backend's `CalculatesLineTotals::appliedTaxRate`.
 */
function appliedRate(line: LineAmounts, rule: TotalsRule): Dec {
  const igst = input(line.igst_rate, rule)
  if (igst.units > 0n) return igst

  const cgst = input(line.cgst_rate, rule)
  const sgst = input(line.sgst_rate, rule)
  if (cgst.units > 0n || sgst.units > 0n) return add(cgst, sgst)

  return input(line.tax_rate, rule)
}

/** `TaxMath::line` - the discount off the gross, then tax on what is left. */
function lineAmounts(line: LineAmounts, rule: TotalsRule): { subtotal: Dec; tax: Dec } {
  const scale = rule.amountScale
  const gross = mul(input(line.quantity, rule), input(line.unit_price, rule), scale)
  const value = input(line.discount_value ?? 0, rule)

  const discount =
    line.discount_type === 'percentage' && value.units > 0n
      ? percentOf(gross, value, scale)
      : line.discount_type === 'fixed'
        ? value
        : dec(0)

  const subtotal = rescale(sub(gross, discount), scale, 'trunc')

  return { subtotal, tax: taxOn(subtotal, appliedRate(line, rule), scale) }
}

/**
 * The net charged at each rate the lines were taxed at, lowest rate first.
 *
 * The order decides which rate takes the ten-thousandth the rounded shares
 * leave, so the backend fixes it by the rate rather than by the order the
 * lines arrive in - and so must this, or the preview and the stored figure
 * differ by a ten-thousandth depending on how the rows were sorted.
 */
function netByTaxRate(
  lines: readonly LineAmounts[],
  amounts: readonly { subtotal: Dec }[],
  rule: TotalsRule,
): { rate: Dec; net: Dec }[] {
  const groups = new Map<string, { rate: Dec; net: Dec }>()

  lines.forEach((line, index) => {
    const rate = appliedRate(line, rule)
    const key = toFixed(rescale(rate, rule.amountScale, 'trunc'))
    const found = groups.get(key)
    const net = amounts[index].subtotal

    groups.set(key, found ? { rate: found.rate, net: add(found.net, net) } : { rate, net })
  })

  return [...groups.values()].sort((a, b) => cmp(a.rate, b.rate))
}

/**
 * `TaxMath::documentDiscount` - a per cent of the subtotal or a fixed amount,
 * never more than the subtotal and never less than nothing, so no base and no
 * tax can go negative.
 */
function documentDiscount(subtotal: Dec, discount: DocumentDiscount | undefined, rule: TotalsRule): Dec {
  const scale = rule.amountScale
  const value = input(discount?.value ?? 0, rule)
  const zero = dec(0)

  if (value.units <= 0n) return zero

  const off =
    discount?.type === 'percentage'
      ? percentOf(subtotal, value, scale)
      : discount?.type === 'fixed'
        ? rescale(value, scale, 'trunc')
        : zero

  const ceiling = subtotal.units > 0n ? subtotal : zero

  return cmp(off, ceiling) > 0 ? ceiling : off
}

/**
 * `TaxMath::apportion` - each rate's share of the discount, in proportion to
 * its net. The last share takes what the rounded ones leave, so the shares add
 * up to the discount exactly however the proportions fall.
 */
function apportion(nets: readonly Dec[], discount: Dec, scale: number): Dec[] {
  const total = nets.reduce((sum, net) => add(sum, net), dec(0))

  if (discount.units <= 0n || total.units <= 0n) return nets.map(() => dec(0))

  const shares: Dec[] = []
  let assigned = dec(0)
  const last = nets.length - 1

  nets.forEach((net, index) => {
    if (index === last) {
      shares.push(rescale(sub(discount, assigned), scale, 'trunc'))
      return
    }

    const share = rescale(div(mulExact(discount, net), total, scale + GUARD), scale, 'halfUp')
    shares.push(share)
    assigned = add(assigned, share)
  })

  return shares
}

/**
 * Line and document totals exactly as the backend stores them, then rounded
 * half-up to the currency's decimals for display.
 *
 * **The document's tax is not the sum of the lines' tax once a document
 * discount applies.** The discount is an allowance over the whole document:
 * it is shared across the tax rates the lines carry, in proportion to the net
 * charged at each, and each rate is then taxed on its reduced base - the way
 * EN 16931 and ZATCA (BR-CO-14) read a document-level allowance. The lines
 * keep their own undiscounted tax, and the document breakdown is the
 * authoritative one. The API returns the same two figures.
 */
export function computeTotals(
  lines: readonly LineAmounts[],
  rule: TotalsRule,
  decimals: number,
  discount?: DocumentDiscount,
): DocumentTotals {
  const round = (d: Dec) => toFixed(rescale(d, decimals, 'halfUp'))
  const scale = rule.amountScale

  const exact = lines.map((line) => lineAmounts(line, rule))
  const bases = netByTaxRate(lines, exact, rule)
  const subtotal = bases.reduce((sum, base) => add(sum, base.net), dec(0))
  const off = documentDiscount(subtotal, discount, rule)

  const tax = apportion(
    bases.map((base) => base.net),
    off,
    scale,
  ).reduce((sum, share, index) => add(sum, taxOn(sub(bases[index].net, share), bases[index].rate, scale)), dec(0))

  const taxable = rescale(sub(subtotal, off), scale, 'trunc')

  return {
    lines: exact.map((l) => ({
      subtotal: round(l.subtotal),
      tax: round(l.tax),
      total: round(add(l.subtotal, l.tax)),
    })),
    subtotal: round(subtotal),
    tax: round(tax),
    discount: round(off),
    total: round(add(taxable, tax)),
  }
}
