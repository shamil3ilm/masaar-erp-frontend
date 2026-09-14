import type { ApiResponse, PortalInvoice } from '@masaar/types'
import { createApiClient } from './axios'

/**
 * Load one invoice for the customer whose portal session `token` is. The portal
 * holds a single link token and never refreshes it, so it gets a plain client
 * rather than the shared one.
 */
export async function fetchPortalInvoice(baseURL: string, invoiceId: string, token: string): Promise<PortalInvoice> {
  const { data } = await createApiClient(baseURL, () => token).get<ApiResponse<PortalInvoice>>(
    `/portal/invoices/${encodeURIComponent(invoiceId)}`,
  )
  return data.data
}
