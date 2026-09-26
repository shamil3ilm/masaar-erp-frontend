import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Contact,
  ContactStatement,
  ContactType,
  Quotation,
  SalesOrder,
  CreditCheckResult,
  Invoice,
  InvoiceSummary,
  InvoiceType,
  PaymentReceived,
  PaymentAllocation,
  PaymentMethod,
  PaymentSummary,
  OpenItem,
  CreditNote,
  CreditNoteType,
  ApiResponse,
  PaginatedResponse,
} from '@masaar/types'
import { getApiClient } from './axios'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const salesKeys = {
  contacts: {
    all: ['sales', 'contacts'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'contacts', 'list', p] as const,
    detail: (id: number) => ['sales', 'contacts', id] as const,
    statement: (id: number) => ['sales', 'contacts', id, 'statement'] as const,
    balance: (id: number) => ['sales', 'contacts', id, 'balance'] as const,
  },
  quotations: {
    all: ['sales', 'quotations'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'quotations', 'list', p] as const,
    detail: (id: number) => ['sales', 'quotations', id] as const,
  },
  orders: {
    all: ['sales', 'orders'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'orders', 'list', p] as const,
    detail: (id: number) => ['sales', 'orders', id] as const,
    creditCheck: (id: number) => ['sales', 'orders', id, 'credit-check'] as const,
  },
  invoices: {
    all: ['sales', 'invoices'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'invoices', 'list', p] as const,
    detail: (id: number) => ['sales', 'invoices', id] as const,
    summary: ['sales', 'invoices', 'summary'] as const,
  },
  payments: {
    all: ['sales', 'payments'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'payments', 'list', p] as const,
    detail: (id: number) => ['sales', 'payments', id] as const,
    summary: ['sales', 'payments', 'summary'] as const,
    openItems: (customerId: number) => ['sales', 'payments', 'open-items', customerId] as const,
  },
  creditNotes: {
    all: ['sales', 'credit-notes'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'credit-notes', 'list', p] as const,
    detail: (id: number) => ['sales', 'credit-notes', id] as const,
  },
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface LineInput {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

export interface ContactInput {
  contact_type: ContactType
  company_name?: string
  contact_name?: string
  email?: string
  phone?: string
  tax_number?: string
  payment_terms?: number
  credit_limit?: number
  currency_code?: string
}

export interface QuotationInput {
  customer_id: number
  quotation_date: string
  valid_until: string
  currency_code?: string
  discount_type?: 'percentage' | 'fixed' | null
  discount_value?: number
  notes?: string
  lines: LineInput[]
}

export interface InvoiceInput {
  customer_id: number
  invoice_type?: InvoiceType
  invoice_date: string
  due_date?: string
  currency_code?: string
  lines: LineInput[]
}

export interface PaymentInput {
  customer_id: number
  payment_date: string
  amount: number
  currency_code?: string
  payment_method: PaymentMethod
  reference?: string
  allocations?: PaymentAllocation[]
}

export interface CreditNoteInput {
  credit_note_type: CreditNoteType
  contact_id: number
  invoice_id?: number
  credit_note_date: string
  currency_code: string
  reason?: string
  lines: LineInput[]
}

export interface ClearOpenItemsInput {
  customer_id: number
  invoice_ids: number[]
  clearing_date?: string
}

/** Date filters use `from_date` / `to_date` on every sales list endpoint. */
interface ListFilters {
  page?: number
  per_page?: number
  status?: string
  customer_id?: number
  from_date?: string
  to_date?: string
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export interface ContactFilters {
  page?: number
  per_page?: number
  contact_type?: string
  search?: string
  is_active?: boolean
}

export function useContacts(filters: ContactFilters = {}) {
  return useQuery({
    queryKey: salesKeys.contacts.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<Contact>>(
        '/sales/contacts',
        { params: filters },
      )
      return data
    },
  })
}

export function useContact(id: number) {
  return useQuery({
    queryKey: salesKeys.contacts.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<Contact>>(`/sales/contacts/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useContactStatement(id: number) {
  return useQuery({
    queryKey: salesKeys.contacts.statement(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<ContactStatement>>(
        `/sales/contacts/${id}/statement`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ContactInput) => {
      const { data } = await getApiClient().post<ApiResponse<Contact>>('/sales/contacts', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.all }),
  })
}

export function useUpdateContact(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<ContactInput>) => {
      const { data } = await getApiClient().put<ApiResponse<Contact>>(
        `/sales/contacts/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.all }),
  })
}

export function useDeleteContact(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await getApiClient().delete(`/sales/contacts/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.all }),
  })
}

export interface PaymentBlockPayload {
  payment_block: boolean
  payment_block_reason?: string | null
}

export function useSetPaymentBlock(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentBlockPayload) => {
      const { data } = await getApiClient().patch<ApiResponse<Contact>>(
        `/sales/contacts/${id}/payment-block`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.all }),
  })
}

// ─── Quotations ───────────────────────────────────────────────────────────────

export type QuotationFilters = ListFilters

export function useQuotations(filters: QuotationFilters = {}) {
  return useQuery({
    queryKey: salesKeys.quotations.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<Quotation>>(
        '/sales/quotations',
        { params: filters },
      )
      return data
    },
  })
}

export function useQuotation(id: number) {
  return useQuery({
    queryKey: salesKeys.quotations.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<Quotation>>(`/sales/quotations/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateQuotation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: QuotationInput) => {
      const { data } = await getApiClient().post<ApiResponse<Quotation>>('/sales/quotations', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

export function useUpdateQuotation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<QuotationInput>) => {
      const { data } = await getApiClient().put<ApiResponse<Quotation>>(
        `/sales/quotations/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

export function useSendQuotation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Quotation>>(
        `/sales/quotations/${id}/send`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

export interface QuotationConversion {
  type: 'invoice' | 'sales_order'
  id: number
  number: string
}

/** The backend requires `convert_to`; the row action converts to a sales order. */
export function useConvertQuotation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (convertTo: 'invoice' | 'sales_order' = 'sales_order') => {
      const { data } = await getApiClient().post<ApiResponse<QuotationConversion>>(
        `/sales/quotations/${id}/convert`,
        { convert_to: convertTo },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.quotations.all })
      qc.invalidateQueries({ queryKey: salesKeys.orders.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

// ─── Sales Orders ─────────────────────────────────────────────────────────────

export type SalesOrderFilters = ListFilters

export function useSalesOrders(filters: SalesOrderFilters = {}) {
  return useQuery({
    queryKey: salesKeys.orders.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<SalesOrder>>(
        '/sales/sales-orders',
        { params: filters },
      )
      return data
    },
  })
}

export function useSalesOrder(id: number) {
  return useQuery({
    queryKey: salesKeys.orders.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<SalesOrder>>(
        `/sales/sales-orders/${id}`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useSalesOrderCreditCheck(id: number) {
  return useQuery({
    queryKey: salesKeys.orders.creditCheck(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<CreditCheckResult>>(
        `/sales/sales-orders/${id}/credit-check`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateSalesOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        '/sales/sales-orders',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.all }),
  })
}

export function useConfirmSalesOrder(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        `/sales/sales-orders/${id}/confirm`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.all }),
  })
}

export function useCancelSalesOrder(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        `/sales/sales-orders/${id}/cancel`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.all }),
  })
}

export interface OrderInvoiceConversion {
  invoice_id: number
  invoice_number: string
  sales_order_id: number
  order_number: string
}

export function useConvertOrderToInvoice(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<OrderInvoiceConversion>>(
        `/sales/sales-orders/${id}/convert-to-invoice`,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.orders.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceFilters = ListFilters

export function useInvoices(filters: InvoiceFilters = {}) {
  return useQuery({
    queryKey: salesKeys.invoices.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<Invoice>>(
        '/sales/invoices',
        { params: filters },
      )
      return data
    },
  })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: salesKeys.invoices.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<Invoice>>(`/sales/invoices/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useInvoiceSummary() {
  return useQuery({
    queryKey: salesKeys.invoices.summary,
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<InvoiceSummary>>(
        '/sales/invoices/summary',
      )
      return data.data
    },
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: InvoiceInput) => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>('/sales/invoices', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.all }),
  })
}

export function useUpdateInvoice(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<InvoiceInput>) => {
      const { data } = await getApiClient().put<ApiResponse<Invoice>>(
        `/sales/invoices/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.all }),
  })
}

export function useSendInvoice(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>(
        `/sales/invoices/${id}/send`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.all }),
  })
}

export function useVoidInvoice(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>(
        `/sales/invoices/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.all }),
  })
}

// ─── Payments Received ────────────────────────────────────────────────────────

export interface PaymentFilters extends ListFilters {
  payment_method?: PaymentMethod
}

export function usePaymentsReceived(filters: PaymentFilters = {}) {
  return useQuery({
    queryKey: salesKeys.payments.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<PaymentReceived>>(
        '/sales/payments-received',
        { params: filters },
      )
      return data
    },
  })
}

export function usePaymentReceived(id: number) {
  return useQuery({
    queryKey: salesKeys.payments.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function usePaymentSummary() {
  return useQuery({
    queryKey: salesKeys.payments.summary,
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<PaymentSummary>>(
        '/sales/payments-received/summary',
      )
      return data.data
    },
  })
}

/** Open invoices for one customer; the backend requires `customer_id`. */
export function useOpenItems(customerId: number | null | undefined) {
  return useQuery({
    queryKey: salesKeys.payments.openItems(customerId ?? 0),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<OpenItem[]>>(
        '/sales/payments-received/open-items',
        { params: { customer_id: customerId } },
      )
      return data.data
    },
    enabled: !!customerId,
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentInput) => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        '/sales/payments-received',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.payments.all }),
  })
}

export function useCompletePayment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}/complete`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.payments.all }),
  })
}

export function useVoidPayment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.payments.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

export interface AllocationResult {
  allocations: unknown[]
  unallocated_amount: number
}

export function useAllocatePayment(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (allocations: PaymentAllocation[]) => {
      const { data } = await getApiClient().post<ApiResponse<AllocationResult>>(
        `/sales/payments-received/${id}/allocate`,
        { allocations },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.payments.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
      // An allocation moves what the customer owes, so their outstanding
      // balance and their statement are stale until they are read again.
      qc.invalidateQueries({ queryKey: salesKeys.contacts.all })
    },
  })
}

export function useClearOpenItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ClearOpenItemsInput) => {
      const { data } = await getApiClient().post<ApiResponse<Record<string, unknown>>>(
        '/sales/payments-received/clear-open-items',
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.payments.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

// ─── Credit Notes ─────────────────────────────────────────────────────────────

export interface CreditNoteFilters {
  page?: number
  per_page?: number
  status?: string
  contact_id?: number
  type?: CreditNoteType
  from_date?: string
  to_date?: string
}

export function useCreditNotes(filters: CreditNoteFilters = {}) {
  return useQuery({
    queryKey: salesKeys.creditNotes.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const { data } = await getApiClient().get<PaginatedResponse<CreditNote>>(
        '/sales/credit-notes',
        { params: filters },
      )
      return data
    },
  })
}

export function useCreditNote(id: number) {
  return useQuery({
    queryKey: salesKeys.creditNotes.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}`,
      )
      return data.data
    },
    enabled: !!id,
  })
}

export function useCreateCreditNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreditNoteInput) => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        '/sales/credit-notes',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.all }),
  })
}

export function useApproveCreditNote(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}/approve`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.all }),
  })
}

export function useApplyCreditNote(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { invoice_id: number; amount: number }) => {
      const { data } = await getApiClient().post<ApiResponse<unknown>>(
        `/sales/credit-notes/${id}/apply`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.creditNotes.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

export function useVoidCreditNote(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.all }),
  })
}
