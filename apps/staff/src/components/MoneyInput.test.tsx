import { createRef } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MoneyInput } from './MoneyInput'

describe('MoneyInput', () => {
  it('steps by the currency smallest unit', () => {
    const { rerender } = render(<MoneyInput currency="KWD" aria-label="Amount" />)
    const input = screen.getByLabelText('Amount')

    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('step', '0.001')

    rerender(<MoneyInput currency="SAR" aria-label="Amount" />)
    expect(input).toHaveAttribute('step', '0.01')
  })

  it('forwards the ref react-hook-form registers', () => {
    const ref = createRef<HTMLInputElement>()
    render(<MoneyInput currency="SAR" aria-label="Amount" ref={ref} />)

    expect(ref.current).toBe(screen.getByLabelText('Amount'))
  })
})
