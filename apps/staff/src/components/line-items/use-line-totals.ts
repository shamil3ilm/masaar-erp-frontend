import { useWatch } from 'react-hook-form'
import type { LineItemsValues } from '../../lib/line-items'
import { computeTotals, type DocumentDiscount, type DocumentTotals, type TotalsRule } from '../../lib/line-totals'
import { currencyDecimals } from '../../lib/money'

/** Live totals for the `lines` of the surrounding form, in `currency`'s decimals. */
export function useLineTotals(rule: TotalsRule, currency: string, discount?: DocumentDiscount): DocumentTotals {
  const lines = useWatch<LineItemsValues, 'lines'>({ name: 'lines' })
  return computeTotals(lines ?? [], rule, currencyDecimals(currency), discount)
}
