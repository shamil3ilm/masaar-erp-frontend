import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button, Card, CardHeader, Input, Plus, Trash2 } from '@masaar/ui'
import { emptyLine, type LineItemsValues } from '../../lib/line-items'
import type { DocumentDiscount, TotalsRule } from '../../lib/line-totals'
import { quantityInputProps } from '../../lib/money'
import { formatCurrency } from '../../lib/format'
import { MoneyInput } from '../MoneyInput'
import { LineTotals } from './LineTotals'
import { useLineTotals } from './use-line-totals'

interface LineItemsEditorProps {
  currency: string
  /** How the backend totals this document type (INVOICE_TOTALS, QUOTATION_TOTALS, CREDIT_NOTE_TOTALS). */
  rule: TotalsRule
  discount?: DocumentDiscount
}

const LABEL = 'block text-xs font-medium text-muted mb-1'

/**
 * Edits the `lines` of the surrounding react-hook-form form (it must be inside
 * a FormProvider) and shows VAT per line and the document totals.
 */
export function LineItemsEditor({ currency, rule, discount }: LineItemsEditorProps) {
  const { register, control, formState: { errors } } = useFormContext<LineItemsValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })
  const totals = useLineTotals(rule, currency, discount)

  return (
    <Card>
      <CardHeader
        title="Line Items"
        actions={
          <Button type="button" variant="outline" size="sm" iconLeft={<Plus size={14} />} onClick={() => append(emptyLine())}>
            Add Line
          </Button>
        }
      />
      <div className="space-y-3">
        {fields.map((field, index) => {
          const lineErrors = errors.lines?.[index]
          const lineMessage = lineErrors?.description?.message ?? lineErrors?.quantity?.message
            ?? lineErrors?.unit_price?.message ?? lineErrors?.tax_rate?.message
          const n = index + 1

          return (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-12 sm:col-span-4">
                {index === 0 && <label className={LABEL}>Description</label>}
                <Input
                  {...register(`lines.${index}.description`)}
                  placeholder="Description"
                  aria-label={`Line ${n} description`}
                  error={!!lineErrors?.description}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                {index === 0 && <label className={LABEL}>Qty</label>}
                <Input
                  {...quantityInputProps}
                  {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                  aria-label={`Line ${n} quantity`}
                  error={!!lineErrors?.quantity}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                {index === 0 && <label className={LABEL}>Unit Price</label>}
                <MoneyInput
                  currency={currency}
                  {...register(`lines.${index}.unit_price`, { valueAsNumber: true })}
                  aria-label={`Line ${n} unit price`}
                  error={!!lineErrors?.unit_price}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                {index === 0 && <label className={LABEL}>VAT %</label>}
                <Input
                  {...quantityInputProps}
                  {...register(`lines.${index}.tax_rate`, { valueAsNumber: true })}
                  aria-label={`Line ${n} VAT rate`}
                  error={!!lineErrors?.tax_rate}
                />
              </div>
              <div className="col-span-3 sm:col-span-2">
                {index === 0 && <span className={LABEL}>VAT</span>}
                <p className="h-9 flex items-center justify-end font-mono text-sm" aria-label={`Line ${n} VAT`}>
                  {formatCurrency(totals.lines[index]?.tax, currency)}
                </p>
              </div>
              <div className="col-span-1 flex items-start">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove line"
                    className={index === 0 ? 'mt-6' : ''}
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={14} className="text-danger" />
                  </Button>
                )}
              </div>
              {lineMessage && <p className="col-span-12 text-xs text-danger">{lineMessage}</p>}
            </div>
          )
        })}
      </div>
      {errors.lines?.message && <p className="text-xs text-danger mt-2">{errors.lines.message}</p>}
      <LineTotals totals={totals} currency={currency} />
    </Card>
  )
}
