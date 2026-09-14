import { z } from 'zod'

/** One document line as the invoice, quotation and credit note forms edit it. */
export const lineSchema = z.object({
  description: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
  unit_price: z.number().min(0, 'Must be non-negative'),
  tax_rate: z.number().min(0).max(100),
})

export const linesSchema = z.array(lineSchema).min(1, 'At least one line item required')

export type LineValues = z.infer<typeof lineSchema>

/** The form shape the line-items editor reads through react-hook-form's context. */
export interface LineItemsValues {
  lines: LineValues[]
}

/** A fresh blank line; the 15% default matches what the forms offered before. */
export function emptyLine(): LineValues {
  return { description: '', quantity: 1, unit_price: 0, tax_rate: 15 }
}
