import type { Decimal } from '@masaar/types'

/*
 * Formatting for the public invoice document.
 *
 * Nothing here may throw. The portal mounts no error boundary, so a RangeError
 * out of Intl — an unparseable date, a currency code that is not ISO 4217 —
 * takes the whole page down and leaves the customer a blank screen. Anything
 * that cannot be rendered shows as an em dash instead, which reads as "not
 * available" rather than as a value.
 */

const LOCALE = 'en-US'
const ABSENT = '—'

/** The scale Laravel's `decimal:4` cast emits, so no digit the API sent is dropped. */
const MAX_DECIMALS = 4

/** The ISO 4217 shape, which is all `Intl.NumberFormat` accepts as a currency. */
const CURRENCY_CODE = /^[A-Za-z]{3}$/

const DECIMAL = /^-?\d+(\.\d+)?$/

/**
 * A plain decimal string. Intl formats one exactly; parsing it to a float
 * first would round the amount before the currency's own decimals do.
 */
function isDecimal(value: string): value is `${number}` {
  return DECIMAL.test(value)
}

function options(currency: string): Intl.NumberFormatOptions {
  // Without a code Intl accepts, show the amount plainly rather than throw.
  return CURRENCY_CODE.test(currency)
    ? { style: 'currency', currency }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
}

/** An amount in its own currency, which decides how many decimals it shows. */
export function formatCurrency(amount: Decimal, currency: string): string {
  const value = String(amount).trim()
  return isDecimal(value) ? new Intl.NumberFormat(LOCALE, options(currency)).format(value) : ABSENT
}

/** A quantity or a rate, without the trailing zeros the decimal cast adds. */
export function formatNumber(value: Decimal): string {
  const text = String(value).trim()
  return isDecimal(text)
    ? new Intl.NumberFormat(LOCALE, { maximumFractionDigits: MAX_DECIMALS }).format(text)
    : ABSENT
}

/** A date the backend sent as an ISO string. */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ABSENT
    : new Intl.DateTimeFormat(LOCALE, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}
