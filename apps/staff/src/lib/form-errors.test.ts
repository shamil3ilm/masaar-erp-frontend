import { describe, it, expect, vi } from 'vitest'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { applyApiErrors } from './form-errors'

function validationError(details: Record<string, string[]>) {
  return new AxiosError('Request failed', undefined, undefined, null, {
    status: 422,
    statusText: '',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    data: { success: false, error: { code: 'VALIDATION_ERROR', message: 'The given data was invalid.', details } },
  })
}

describe('applyApiErrors', () => {
  it('maps backend fields onto the form, renaming prefixes, and puts the rest on root', () => {
    const setError = vi.fn()
    const err = validationError({
      'items.0.quantity': ['The quantity must be at least 0.01.'],
      contact_id: ['The selected contact id is invalid.'],
      organization_id: ['Unexpected.'],
    })

    applyApiErrors(err, setError, ['lines', 'contact_id'], { items: 'lines' })

    expect(setError).toHaveBeenCalledWith('lines.0.quantity', { type: 'server', message: 'The quantity must be at least 0.01.' })
    expect(setError).toHaveBeenCalledWith('contact_id', { type: 'server', message: 'The selected contact id is invalid.' })
    expect(setError).toHaveBeenCalledWith('root.server', { type: 'server', message: 'Unexpected.' })
  })

  it('shows the backend message when there are no field errors', () => {
    const setError = vi.fn()
    const err = new AxiosError('Request failed', undefined, undefined, null, {
      status: 422,
      statusText: '',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
      data: { success: false, error: { code: 'VALIDATION_ERROR', message: 'Credit note total exceeds invoice total.' } },
    })

    applyApiErrors(err, setError, ['lines'])

    expect(setError).toHaveBeenCalledTimes(1)
    expect(setError).toHaveBeenCalledWith('root.server', { type: 'server', message: 'Credit note total exceeds invoice total.' })
  })
})
