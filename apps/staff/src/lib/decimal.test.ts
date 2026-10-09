import { describe, it, expect } from 'vitest'
import { add, cmp, dec, div, mul, mulExact, overHundred, rescale, sub, toFixed } from './decimal'

describe('decimal', () => {
  it('parses numbers and decimal strings exactly', () => {
    expect(dec('1.50')).toEqual({ units: 150n, scale: 2 })
    expect(dec(0.1)).toEqual({ units: 1n, scale: 1 })
    expect(toFixed(dec(1e-7))).toMatch(/^0\.0000001/)
  })

  it('reads missing and non-finite values as zero', () => {
    for (const value of [null, undefined, '', 'abc', Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(dec(value).units).toBe(0n)
    }
  })

  it('truncates toward zero like bcmath', () => {
    expect(toFixed(rescale(dec('1.23459'), 4, 'trunc'))).toBe('1.2345')
    expect(toFixed(rescale(dec('-1.23459'), 4, 'trunc'))).toBe('-1.2345')
    expect(toFixed(mul(dec('10.999'), dec('1'), 2))).toBe('10.99')
    expect(toFixed(div(dec('10'), dec('3'), 4))).toBe('3.3333')
    expect(toFixed(div(dec('-10'), dec('3'), 4))).toBe('-3.3333')
  })

  it('divides by a hundred without losing a digit', () => {
    // The rate used to be truncated at six decimals before it was charged, so
    // a four-decimal rate lost its tail. Moving the point keeps all of it.
    expect(toFixed(overHundred(dec('12.345')))).toBe('0.12345')
    expect(toFixed(mulExact(dec('1.5'), dec('2.25')))).toBe('3.375')
  })

  it('divides exactly rather than at the narrower scale', () => {
    // 0.0001 / 3 at four decimals is zero if the numerator is truncated to the
    // scale first, and 0.0000 only after the division if it is not - the
    // apportionment asks for twelve decimals of a figure held at four.
    expect(toFixed(div(dec('0.0001'), dec('3'), 12))).toBe('0.000033333333')
    expect(toFixed(div(dec('1'), dec('0'), 4))).toBe('0.0000')
  })

  it('compares like bccomp', () => {
    expect(cmp(dec('1.50'), dec('1.5'))).toBe(0)
    expect(cmp(dec('1.4999'), dec('1.5'))).toBe(-1)
    expect(cmp(dec('-1'), dec('-2'))).toBe(1)
  })

  it('rounds half away from zero like the decimal cast', () => {
    expect(toFixed(rescale(dec('0.005'), 2, 'halfUp'))).toBe('0.01')
    expect(toFixed(rescale(dec('0.0049'), 2, 'halfUp'))).toBe('0.00')
    expect(toFixed(rescale(dec('-0.005'), 2, 'halfUp'))).toBe('-0.01')
  })

  it('adds, subtracts and formats across scales', () => {
    expect(toFixed(add(dec('1.5'), dec('0.25')))).toBe('1.75')
    expect(toFixed(sub(dec('0.1'), dec('0.15')))).toBe('-0.05')
    expect(toFixed(rescale(dec(3), 3, 'trunc'))).toBe('3.000')
  })
})
