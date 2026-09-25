import type { AuthTokenResponse, MeResponse } from '@masaar/api-client'
import type {
  BranchSummary,
  Contact,
  Invoice,
  InvoiceSummary,
  Organization,
  User,
  ZatcaDeviceOnboarding,
  ZatcaOnboardingStatus,
} from '@masaar/types'
import type { Permission } from '../../src/lib/permissions'

/*
 * The payloads the backend actually sends: integer ids, decimal columns as
 * strings, and the nested resources the API composes. They are typed against
 * @masaar/types so the e2e typecheck fails the moment a contract moves.
 */

export const TOKEN = 'e2e-access-token'
export const PASSWORD = 'correct-horse-battery-staple'

export const ORGANIZATION: Organization = {
  id: 7,
  uuid: '018f3c2a-9b41-7c55-8d3e-0a1b2c3d4e5f',
  name: 'Masaar Trading',
  legal_name: 'Masaar Trading Company',
  tax_number: '300000000000003',
  country_code: 'SA',
  base_currency: 'SAR',
  is_active: true,
}

/** The ZATCA routes look a branch up by uuid, so the uuid is what the page must send. */
export const DEFAULT_BRANCH: BranchSummary = {
  id: 3,
  uuid: '018f3c2a-9b41-7c55-8d3e-1122334455aa',
  name: 'Riyadh Head Office',
  code: 'RUH-01',
}

export const USER: User = {
  id: 42,
  uuid: '018f3c2a-9b41-7c55-8d3e-99887766554f',
  name: 'Sara Al-Amri',
  email: 'sara.alamri@masaar.test',
  is_super_admin: false,
  two_factor_enabled: false,
  organization: ORGANIZATION,
  default_branch: DEFAULT_BRANCH,
  roles: [{ id: 2, name: 'Accountant', slug: 'accountant' }],
}

/** Every slug the staff app checks, so nothing under test is hidden by default. */
export const ALL_PERMISSIONS: readonly Permission[] = [
  'sales.contacts.view',
  'sales.contacts.create',
  'sales.quotations.view',
  'sales.quotations.create',
  'sales.quotations.send',
  'sales.quotations.convert',
  'sales.orders.view',
  'sales.orders.confirm',
  'sales.orders.cancel',
  'sales.orders.convert',
  'sales.invoices.view',
  'sales.invoices.create',
  'sales.invoices.send',
  'sales.invoices.void',
  'sales.payments.view',
  'sales.payments.create',
  'sales.payments.complete',
  'sales.payments.void',
  'sales.credit-notes.view',
  'sales.credit-notes.create',
  'sales.credit-notes.approve',
  'sales.credit-notes.void',
  'compliance.onboarding.view',
]

/** `/auth/login` answers with the token and the user; it sends no organization list. */
export const LOGIN: AuthTokenResponse = {
  token: TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  user: USER,
}

/** `/auth/me` is where branches and permissions come from. */
export function me(overrides: Partial<MeResponse> = {}): MeResponse {
  return {
    user: USER,
    permissions: [...ALL_PERMISSIONS],
    default_branch: DEFAULT_BRANCH,
    ...overrides,
  }
}

/** The user with every permission except the listed ones. */
export function permissionsWithout(...denied: Permission[]): string[] {
  return ALL_PERMISSIONS.filter((slug) => !denied.includes(slug))
}

export function onboarding(status: ZatcaOnboardingStatus | null): ZatcaDeviceOnboarding {
  return {
    zatca_branch_id: DEFAULT_BRANCH.uuid,
    zatca_onboarding_status: status,
    zatca_certificate_expires_at: status === null ? null : '2027-02-10T00:00:00Z',
  }
}

export const CUSTOMER: Contact = {
  id: 5,
  uuid: '018f3c2a-9b41-7c55-8d3e-5566778899cd',
  contact_type: 'customer',
  company_name: 'Gulf Steel Works',
  contact_name: 'Faisal Nasser',
  display_name: 'Gulf Steel Works',
  email: 'ap@gulfsteel.test',
  phone: '+966500000000',
  tax_number: '311111111111113',
  payment_terms: 30,
  credit_limit: '250000.0000',
  currency_code: 'SAR',
  is_active: true,
  outstanding_balance: 1150,
}

export function invoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: 101,
    uuid: '018f3c2a-9b41-7c55-8d3e-a1a2a3a4a5a6',
    invoice_number: 'INV-2026-0001',
    invoice_type: 'standard',
    customer_id: CUSTOMER.id,
    customer: { id: CUSTOMER.id, name: CUSTOMER.display_name, email: CUSTOMER.email },
    customer_name: CUSTOMER.display_name,
    customer_tax_number: CUSTOMER.tax_number,
    invoice_date: '2026-02-10',
    due_date: '2026-03-12',
    currency_code: 'SAR',
    exchange_rate: '1.000000',
    subtotal: '1000.0000',
    tax_amount: '150.0000',
    total: '1150.0000',
    amount_paid: '0.0000',
    amount_due: '1150.0000',
    status: 'sent',
    compliance: {
      status: 'cleared',
      uuid: '018f3c2a-9b41-7c55-8d3e-b1b2b3b4b5b6',
      hash: 'NWZlNTM3ZTk1ZjA4',
      qr_code: null,
      submitted_at: '2026-02-10T09:15:00Z',
    },
    sales_order_id: null,
    quotation_id: null,
    ...overrides,
  }
}

export const SENT_INVOICE = invoice()

export const PAID_INVOICE = invoice({
  id: 102,
  uuid: '018f3c2a-9b41-7c55-8d3e-c1c2c3c4c5c6',
  invoice_number: 'INV-2026-0002',
  invoice_date: '2026-01-20',
  due_date: '2026-02-19',
  subtotal: '2000.0000',
  tax_amount: '300.0000',
  total: '2300.0000',
  amount_paid: '2300.0000',
  amount_due: '0.0000',
  status: 'paid',
})

/** The aggregates come back from SUM(), which the driver may render as a string. */
export const INVOICE_SUMMARY: InvoiceSummary = {
  total_invoices: 2,
  total_amount: '3450.0000',
  total_paid: '2300.0000',
  total_outstanding: '1150.0000',
  by_status: {
    sent: { status: 'sent', count: 1, total: '1150.0000' },
    paid: { status: 'paid', count: 1, total: '2300.0000' },
  },
  overdue_count: 0,
  overdue_amount: '0.0000',
}
