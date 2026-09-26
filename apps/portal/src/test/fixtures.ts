import type { PortalInvoice, PortalInvoiceLine } from '@masaar/types'

/*
 * The invoice `GET /portal/invoices/{id}` answers with: integer ids and every
 * decimal column as the string Laravel's `decimal:4` cast emits. Typed against
 * @masaar/types so the suite fails the typecheck the moment the contract moves.
 */

export const LINK_TOKEN = 'portal-link-token'

export function line(overrides: Partial<PortalInvoiceLine> = {}): PortalInvoiceLine {
  return {
    id: 1,
    description: 'Structural steel fabrication',
    quantity: '2.0000',
    unit_price: '500.0000',
    tax_rate: '15.0000',
    tax_amount: '150.0000',
    total: '1150.0000',
    ...overrides,
  }
}

export function invoice(overrides: Partial<PortalInvoice> = {}): PortalInvoice {
  return {
    id: 101,
    invoice_number: 'INV-2026-0001',
    invoice_type: 'standard',
    customer_name: 'Gulf Steel Works',
    customer_email: 'ap@gulfsteel.test',
    customer_tax_number: '311111111111113',
    invoice_date: '2026-02-10',
    due_date: '2026-03-12',
    currency_code: 'SAR',
    subtotal: '1000.0000',
    tax_amount: '150.0000',
    total: '1150.0000',
    amount_paid: '0.0000',
    amount_due: '1150.0000',
    status: 'sent',
    compliance_uuid: '018f3c2a-9b41-7c55-8d3e-b1b2b3b4b5b6',
    lines: [line()],
    ...overrides,
  }
}
