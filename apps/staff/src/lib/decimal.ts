/**
 * Exact decimal arithmetic on BigInt, shaped after the PHP calls the backend
 * uses for money: `bcmul`/`bcdiv` truncate to their scale, and Laravel's
 * `decimal:N` cast rounds half-up. Floats cannot reproduce either.
 */
export interface Dec {
  readonly units: bigint
  readonly scale: number
}

const ZERO: Dec = { units: 0n, scale: 0 }
const PLAIN = /^-?\d+(\.\d+)?$/

const pow10 = (n: number): bigint => 10n ** BigInt(n)

/** Parse a form or API value. Anything that is not a finite number is zero. */
export function dec(value: number | string | null | undefined): Dec {
  if (value === null || value === undefined || value === '') return ZERO
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return ZERO

  let text = typeof value === 'string' && PLAIN.test(value.trim()) ? value.trim() : String(n)
  if (!PLAIN.test(text)) text = n.toFixed(20)
  if (!PLAIN.test(text)) return ZERO

  const [whole, fraction = ''] = text.split('.')
  return { units: BigInt(whole + fraction), scale: fraction.length }
}

/** Change scale; going down either truncates toward zero or rounds half away from zero. */
export function rescale(d: Dec, scale: number, mode: 'trunc' | 'halfUp'): Dec {
  if (scale >= d.scale) return { units: d.units * pow10(scale - d.scale), scale }

  const divisor = pow10(d.scale - scale)
  if (mode === 'trunc') return { units: d.units / divisor, scale }

  const half = divisor / 2n
  const units = d.units < 0n ? (d.units - half) / divisor : (d.units + half) / divisor
  return { units, scale }
}

/** `bcmul(a, b, scale)` */
export function mul(a: Dec, b: Dec, scale: number): Dec {
  return rescale({ units: a.units * b.units, scale: a.scale + b.scale }, scale, 'trunc')
}

/** `bcdiv(a, '100', scale)` — the only division the backend's line math uses. */
export function percent(a: Dec, scale: number): Dec {
  return rescale({ units: a.units, scale: a.scale + 2 }, scale, 'trunc')
}

export function add(a: Dec, b: Dec): Dec {
  const scale = Math.max(a.scale, b.scale)
  return { units: rescale(a, scale, 'trunc').units + rescale(b, scale, 'trunc').units, scale }
}

export function sub(a: Dec, b: Dec): Dec {
  return add(a, { units: -b.units, scale: b.scale })
}

export function toFixed(d: Dec): string {
  const negative = d.units < 0n
  const digits = (negative ? -d.units : d.units).toString().padStart(d.scale + 1, '0')
  const whole = digits.slice(0, digits.length - d.scale)
  const fraction = d.scale > 0 ? `.${digits.slice(-d.scale)}` : ''
  return `${negative ? '-' : ''}${whole}${fraction}`
}
