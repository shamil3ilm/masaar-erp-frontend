import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { parseApiError } from '@masaar/api-client'

/**
 * Show a failed request on a react-hook-form form. Field errors whose top-level
 * name is in `fields` go on that field (`lines.0.quantity` included); the rest,
 * or the backend's message when there are no field errors, go on `root.server`.
 * `rename` maps a backend name to the form's, e.g. `{ items: 'lines' }`.
 */
export function applyApiErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
  rename: Record<string, string> = {},
): void {
  const { message, fields: errors } = parseApiError(err)
  const unmatched: string[] = []

  for (const [key, msg] of Object.entries(errors)) {
    const [head, ...rest] = key.split('.')
    const name = rename[head] ?? head
    if (fields.includes(name)) {
      setError([name, ...rest].join('.') as Path<T>, { type: 'server', message: msg })
    } else {
      unmatched.push(msg)
    }
  }

  if (unmatched.length > 0 || Object.keys(errors).length === 0) {
    setError('root.server', {
      type: 'server',
      message: unmatched.length > 0 ? unmatched.join(' ') : message,
    })
  }
}
