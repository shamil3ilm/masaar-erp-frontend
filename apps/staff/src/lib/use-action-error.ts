import { useCallback, useState } from 'react'
import { parseApiError } from '@masaar/api-client'

/** Callbacks a table row passes to its mutations. */
export interface RowActionHandlers {
  onSuccess: () => void
  onError: (err: unknown) => void
}

/** The message of the last failed row action on a list page. */
export function useActionError() {
  const [message, setMessage] = useState<string | null>(null)
  const report = useCallback((err: unknown) => setMessage(parseApiError(err).message), [])
  const clear = useCallback(() => setMessage(null), [])
  return { message, report, clear }
}
