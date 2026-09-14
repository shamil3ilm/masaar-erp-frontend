import axios from 'axios'
import type { PortalInvoice } from '@masaar/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '/api/v1'

/** Load one invoice for the customer whose portal session `token` is. */
export async function fetchPortalInvoice(invoiceId: string, token: string): Promise<PortalInvoice> {
  const { data } = await axios.get<{ data: PortalInvoice }>(
    `${BASE_URL}/portal/invoices/${encodeURIComponent(invoiceId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  )
  return data.data
}
