import { describe, it, expect } from 'vitest'
import { CURRENCIES, currencyDecimals, currencyStep, moneyInputProps, quantityInputProps } from './money'
import { formatCurrency } from './format'

describe('currency decimals', () => {
  it('uses three decimals for the dinar and rial currencies', () => {
    for (const code of ['BHD', 'KWD', 'OMR']) {
      expect(currencyDecimals(code)).toBe(3)
      expect(currencyStep(code)).toBe('0.001')
    }
  })

  it('uses two decimals for the others and for unknown or missing codes', () => {
    expect(currencyStep('SAR')).toBe('0.01')
    expect(currencyStep('AED')).toBe('0.01')
    expect(currencyStep('XYZ')).toBe('0.01')
    expect(currencyStep(null)).toBe('0.01')
  })

  it('offers every GCC currency', () => {
    const codes = CURRENCIES.map((c) => c.code)
    expect(codes).toEqual(expect.arrayContaining(['SAR', 'AED', 'QAR', 'OMR', 'BHD', 'KWD']))
  })

  it('gives amount inputs the currency step and quantities any decimal', () => {
    expect(moneyInputProps('KWD').step).toBe('0.001')
    expect(moneyInputProps('SAR').step).toBe('0.01')
    expect(quantityInputProps.step).toBe('any')
  })
})

describe('formatCurrency', () => {
  it('formats decimal strings in the given currency with its decimals', () => {
    expect(formatCurrency('12.3456', 'BHD')).toContain('12.346')
    expect(formatCurrency('12.3456', 'SAR')).toContain('12.35')
  })

  it('does not invent a currency when none is given', () => {
    expect(formatCurrency(5, null)).toBe('5.00')
  })
})
