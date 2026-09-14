/** Formatting helpers for values rendered in staff-facing tables and cards. */

import { currencyDecimals } from './money'

const LOCALE = 'en-SA'

/**
 * Format an amount in the document's or organization's currency. Amounts may be
 * decimal strings; missing values show as zero. Without a currency the number
 * is shown bare rather than guessed.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
): string {
  const value = Number(amount)
  const n = Number.isFinite(value) ? value : 0
  const digits = currencyDecimals(currency)
  const options: Intl.NumberFormatOptions = { minimumFractionDigits: digits, maximumFractionDigits: digits }

  return new Intl.NumberFormat(LOCALE, currency ? { ...options, style: 'currency', currency } : options).format(n)
}

/** Format an ISO date string, showing an em dash when absent or unparseable. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'

  const date = new Date(iso)

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' }).format(date)
}
