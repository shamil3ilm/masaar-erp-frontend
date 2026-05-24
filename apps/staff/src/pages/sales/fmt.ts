export function fmtCurrency(amount: number | null | undefined, currency = 'SAR'): string {
  const n = Number(amount)
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency }).format(Number.isFinite(n) ? n : 0)
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-SA', { dateStyle: 'medium' }).format(d)
}
