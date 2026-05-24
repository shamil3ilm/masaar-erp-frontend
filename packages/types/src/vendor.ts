export interface VendorLineItem {
  description: string
  quantity: number
  unit_price: number
  vat_rate: number
  vat_amount: number
  total: number
}

export interface VendorInvoice {
  id: string
  invoice_number: string
  invoice_type: 'standard' | 'simplified'
  buyer_name: string
  buyer_vat: string | null
  buyer_email: string | null
  total_amount: number
  vat_amount: number
  subtotal: number
  currency: string
  status: 'pending' | 'submitted' | 'cleared' | 'rejected'
  issued_at: string
  due_date: string | null
  line_items: VendorLineItem[]
  seller: {
    name: string
    vat_number: string | null
    address: string | null
    logo_url: string | null
  }
  pdf_url: string | null
  zatca_uuid: string | null
  expires_at: string
}
