/*
 * The portal has no error boundary, so a formatter that throws blanks the page
 * for the customer. These tests pin that none of them can, and that amounts go
 * to Intl as the decimal strings the API sent rather than as floats.
 */
import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatNumber } from './format'

/** Intl separates the currency from the amount with a non-breaking space. */
const SAR = 'SAR '
const KWD = 'KWD '

describe('formatCurrency', () => {
  it('shows the amount with the decimals its own currency uses', () => {
    expect(formatCurrency('1150.0000', 'SAR')).toBe(`${SAR}1,150.00`)
    // The dinar currencies carry three decimals, and Intl knows it.
    expect(formatCurrency('1150.1234', 'KWD')).toBe(`${KWD}1,150.123`)
  })

  it('formats the decimal string itself, never a float of it', () => {
    // Beyond 2^53 minor units a float can no longer hold the amount; the
    // string reaches Intl intact.
    expect(formatCurrency('90071992547409.93', 'SAR')).toBe(`${SAR}90,071,992,547,409.93`)
  })

  it('shows a plain amount rather than throwing on a code Intl rejects', () => {
    expect(formatCurrency('1150.0000', '')).toBe('1,150.00')
    expect(formatCurrency('1150.0000', 'RIYAL')).toBe('1,150.00')
  })

  it('shows an unreadable amount as absent, not as zero', () => {
    // A zero total on a customer's invoice is a claim; "—" is not.
    expect(formatCurrency('n/a', 'SAR')).toBe('—')
    expect(formatCurrency('', 'SAR')).toBe('—')
  })
})

describe('formatNumber', () => {
  it('drops the trailing zeros the decimal cast adds', () => {
    expect(formatNumber('2.0000')).toBe('2')
    expect(formatNumber('15.0000')).toBe('15')
    expect(formatNumber('2.5000')).toBe('2.5')
  })

  it('keeps every digit the cast can carry', () => {
    expect(formatNumber('0.1234')).toBe('0.1234')
  })

  it('shows an unreadable quantity as absent', () => {
    expect(formatNumber('lots')).toBe('—')
  })
})

describe('formatDate', () => {
  it('spells the date out', () => {
    expect(formatDate('2026-02-10')).toBe('February 10, 2026')
  })

  it('shows an unparseable date as absent instead of throwing', () => {
    expect(formatDate('0000-00-00')).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})
