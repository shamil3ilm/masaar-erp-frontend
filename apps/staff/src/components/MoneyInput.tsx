import type { ComponentProps } from 'react'
import { Input } from '@masaar/ui'
import { moneyInputProps } from '../lib/money'

export interface MoneyInputProps
  extends Omit<ComponentProps<typeof Input>, 'type' | 'inputMode' | 'min' | 'step'> {
  currency: string | null | undefined
}

/** An amount field whose step is the smallest unit of `currency`. */
export function MoneyInput({ currency, ...props }: MoneyInputProps) {
  return <Input {...moneyInputProps(currency)} {...props} />
}
