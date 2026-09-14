import type { ReactNode } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { emptyLine, type LineItemsValues } from '../../lib/line-items'
import { CREDIT_NOTE_TOTALS, INVOICE_TOTALS, type DocumentDiscount, type TotalsRule } from '../../lib/line-totals'
import { LineItemsEditor } from './LineItemsEditor'

function Form({ children, lines }: { children: ReactNode; lines: LineItemsValues['lines'] }) {
  const form = useForm<LineItemsValues>({ defaultValues: { lines } })
  return <FormProvider {...form}>{children}</FormProvider>
}

function renderEditor(
  lines: LineItemsValues['lines'],
  { currency = 'SAR', rule = INVOICE_TOTALS, discount }: { currency?: string; rule?: TotalsRule; discount?: DocumentDiscount } = {},
) {
  return render(
    <Form lines={lines}>
      <LineItemsEditor currency={currency} rule={rule} discount={discount} />
    </Form>,
  )
}

const row = (label: string) => screen.getByText(label, { selector: 'dt' }).parentElement!

describe('LineItemsEditor', () => {
  it('shows VAT per line and the document totals', () => {
    renderEditor([{ description: 'Service', quantity: 2, unit_price: 50, tax_rate: 15 }])

    expect(screen.getByLabelText('Line 1 VAT')).toHaveTextContent('15.00')
    expect(row('Subtotal')).toHaveTextContent('100.00')
    expect(row('VAT')).toHaveTextContent('15.00')
    expect(row('Total')).toHaveTextContent('115.00')
  })

  it('recomputes as a line is edited', async () => {
    const user = userEvent.setup()
    renderEditor([{ description: 'Service', quantity: 2, unit_price: 50, tax_rate: 15 }])

    const price = screen.getByLabelText('Line 1 unit price')
    await user.clear(price)
    await user.type(price, '100')

    expect(screen.getByLabelText('Line 1 VAT')).toHaveTextContent('30.00')
    expect(row('Total')).toHaveTextContent('230.00')
  })

  it('adds and removes lines', async () => {
    const user = userEvent.setup()
    renderEditor([emptyLine()])

    expect(screen.queryByRole('button', { name: 'Remove line' })).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Add Line' }))
    expect(screen.getAllByRole('button', { name: 'Remove line' })).toHaveLength(2)

    await user.click(screen.getAllByRole('button', { name: 'Remove line' })[1])
    expect(screen.queryByLabelText('Line 2 description')).toBeNull()
  })

  it('uses the currency decimals, step and the document rule', () => {
    renderEditor([{ description: 'Part', quantity: 1, unit_price: 10.999, tax_rate: 15 }], { currency: 'KWD', rule: CREDIT_NOTE_TOTALS })

    expect(screen.getByLabelText('Line 1 unit price')).toHaveAttribute('step', '0.001')
    expect(row('Subtotal')).toHaveTextContent('10.990')
    expect(row('Total')).toHaveTextContent('12.630')
  })

  it('lists a quotation discount before the total', () => {
    renderEditor([{ description: 'Service', quantity: 1, unit_price: 100, tax_rate: 15 }], { discount: { type: 'fixed', value: 5 } })

    expect(row('Discount')).toHaveTextContent('5.00')
    expect(row('Total')).toHaveTextContent('110.00')
  })
})
