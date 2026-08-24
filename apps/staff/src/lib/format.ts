/** Formatting helpers for values rendered in staff-facing tables and cards. */

const LOCALE = 'en-SA'

/** Format an amount as currency, falling back to zero for missing values. */
export function formatCurrency(amount: number | null | undefined, currency = 'SAR'): string {
  const value = Number(amount)

  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(
    Number.isFinite(value) ? value : 0,
  )
}

/** Format an ISO date string, showing an em dash when absent or unparseable. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'

  const date = new Date(iso)

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' }).format(date)
}
