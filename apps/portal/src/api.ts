import { fetchPortalInvoice } from '@masaar/api-client'
import type { PortalInvoice } from '@masaar/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '/api/v1'

/** Load one invoice for the customer whose portal session `token` is. */
export function loadInvoice(invoiceId: string, token: string): Promise<PortalInvoice> {
  return fetchPortalInvoice(BASE_URL, invoiceId, token)
}
