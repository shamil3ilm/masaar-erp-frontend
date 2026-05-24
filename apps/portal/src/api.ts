import axios from 'axios'
import type { VendorInvoice } from '@erp/types'

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '/api/v1'

export async function fetchVendorInvoice(invoiceId: string, token: string): Promise<VendorInvoice> {
  const { data } = await axios.get<{ data: VendorInvoice }>(
    `${BASE_URL}/vendor/invoices/${invoiceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  )
  return data.data
}
