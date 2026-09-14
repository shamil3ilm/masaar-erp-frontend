/** Currencies the backend supports and their decimal places (config/erp.php `currencies`). */
export const CURRENCIES = [
  { code: 'SAR', name: 'Saudi Riyal', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', decimals: 2 },
  { code: 'QAR', name: 'Qatari Riyal', decimals: 2 },
  { code: 'OMR', name: 'Omani Rial', decimals: 3 },
  { code: 'BHD', name: 'Bahraini Dinar', decimals: 3 },
  { code: 'KWD', name: 'Kuwaiti Dinar', decimals: 3 },
  { code: 'INR', name: 'Indian Rupee', decimals: 2 },
  { code: 'USD', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', name: 'Euro', decimals: 2 },
] as const

export const DEFAULT_CURRENCY = 'SAR'

export function currencyDecimals(code: string | null | undefined): number {
  return CURRENCIES.find((c) => c.code === code)?.decimals ?? 2
}

/** The smallest amount the currency can express, as an input `step` ("0.01", "0.001"). */
export function currencyStep(code: string | null | undefined): string {
  const decimals = currencyDecimals(code)
  return (1 / 10 ** decimals).toFixed(decimals)
}

/** Props for an amount input in the given currency. */
export function moneyInputProps(code: string | null | undefined) {
  return { type: 'number', inputMode: 'decimal', min: 0, step: currencyStep(code) } as const
}

/** Quantities are any positive decimal (the backend validates `numeric|gt:0`). */
export const quantityInputProps = { type: 'number', inputMode: 'decimal', min: 0, step: 'any' } as const
