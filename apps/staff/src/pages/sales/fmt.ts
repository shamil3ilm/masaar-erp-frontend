export function fmtCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency }).format(amount)
}

export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('en-SA', { dateStyle: 'medium' }).format(new Date(iso))
}
