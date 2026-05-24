import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Contact,
  ContactStatement,
  Quotation,
  SalesOrder,
  CreditCheckResult,
  Invoice,
  InvoiceSummary,
  PaymentReceived,
  PaymentAllocation,
  PaymentSummary,
  OpenItem,
  CreditNote,
  ApiResponse,
  PaginatedResponse,
} from '@erp/types'
import { getApiClient } from './axios'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const salesKeys = {
  contacts: {
    all: ['sales', 'contacts'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'contacts', 'list', p] as const,
    detail: (id: string) => ['sales', 'contacts', id] as const,
    statement: (id: string) => ['sales', 'contacts', id, 'statement'] as const,
    balance: (id: string) => ['sales', 'contacts', id, 'balance'] as const,
  },
  quotations: {
    all: ['sales', 'quotations'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'quotations', 'list', p] as const,
    detail: (id: string) => ['sales', 'quotations', id] as const,
  },
  orders: {
    all: ['sales', 'orders'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'orders', 'list', p] as const,
    detail: (id: string) => ['sales', 'orders', id] as const,
    creditCheck: (id: string) => ['sales', 'orders', id, 'credit-check'] as const,
  },
  invoices: {
    all: ['sales', 'invoices'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'invoices', 'list', p] as const,
    detail: (id: string) => ['sales', 'invoices', id] as const,
    summary: ['sales', 'invoices', 'summary'] as const,
  },
  payments: {
    all: ['sales', 'payments'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'payments', 'list', p] as const,
    detail: (id: string) => ['sales', 'payments', id] as const,
    summary: ['sales', 'payments', 'summary'] as const,
    openItems: ['sales', 'payments', 'open-items'] as const,
  },
  creditNotes: {
    all: ['sales', 'credit-notes'] as const,
    list: (p: Record<string, unknown>) => ['sales', 'credit-notes', 'list', p] as const,
    detail: (id: string) => ['sales', 'credit-notes', id] as const,
  },
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

export function useContact(id: string) {
  return useQuery({
    queryKey: salesKeys.contacts.detail(id),
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<Contact>>(`/sales/contacts/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export function useContactStatement(id: string) {
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
    mutationFn: async (payload: Partial<Contact>) => {
      const { data } = await getApiClient().post<ApiResponse<Contact>>('/sales/contacts', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.all }),
  })
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Contact>) => {
      const { data } = await getApiClient().put<ApiResponse<Contact>>(
        `/sales/contacts/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.contacts.all })
      qc.invalidateQueries({ queryKey: salesKeys.contacts.detail(id) })
    },
  })
}

export function useDeleteContact(id: string) {
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

export function useSetPaymentBlock(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PaymentBlockPayload) => {
      const { data } = await getApiClient().patch<ApiResponse<Contact>>(
        `/sales/contacts/${id}/payment-block`,
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.contacts.detail(id) }),
  })
}

// ─── Quotations ───────────────────────────────────────────────────────────────

export interface QuotationFilters {
  page?: number
  per_page?: number
  status?: string
  customer_id?: string
  date_from?: string
  date_to?: string
}

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

export function useQuotation(id: string) {
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
    mutationFn: async (payload: Partial<Quotation>) => {
      const { data } = await getApiClient().post<ApiResponse<Quotation>>('/sales/quotations', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.all }),
  })
}

export function useUpdateQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Quotation>) => {
      const { data } = await getApiClient().put<ApiResponse<Quotation>>(
        `/sales/quotations/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.quotations.all })
      qc.invalidateQueries({ queryKey: salesKeys.quotations.detail(id) })
    },
  })
}

export function useSendQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Quotation>>(
        `/sales/quotations/${id}/send`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.quotations.detail(id) }),
  })
}

export function useConvertQuotation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        `/sales/quotations/${id}/convert`,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.quotations.detail(id) })
      qc.invalidateQueries({ queryKey: salesKeys.orders.all })
    },
  })
}

// ─── Sales Orders ─────────────────────────────────────────────────────────────

export interface SalesOrderFilters {
  page?: number
  per_page?: number
  status?: string
  customer_id?: string
  date_from?: string
  date_to?: string
}

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

export function useSalesOrder(id: string) {
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

export function useSalesOrderCreditCheck(id: string) {
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
    mutationFn: async (payload: Partial<SalesOrder>) => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        '/sales/sales-orders',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.all }),
  })
}

export function useConfirmSalesOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        `/sales/sales-orders/${id}/confirm`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.detail(id) }),
  })
}

export function useCancelSalesOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<SalesOrder>>(
        `/sales/sales-orders/${id}/cancel`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.orders.detail(id) }),
  })
}

export function useConvertOrderToInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>(
        `/sales/sales-orders/${id}/convert-to-invoice`,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.orders.detail(id) })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceFilters {
  page?: number
  per_page?: number
  status?: string
  customer_id?: string
  date_from?: string
  date_to?: string
}

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

export function useInvoice(id: string) {
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
    mutationFn: async (payload: Partial<Invoice>) => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>('/sales/invoices', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.all }),
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Invoice>) => {
      const { data } = await getApiClient().put<ApiResponse<Invoice>>(
        `/sales/invoices/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.detail(id) })
    },
  })
}

export function useSendInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>(
        `/sales/invoices/${id}/send`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.detail(id) }),
  })
}

export function useVoidInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<Invoice>>(
        `/sales/invoices/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.invoices.detail(id) }),
  })
}

// ─── Payments Received ────────────────────────────────────────────────────────

export interface PaymentFilters {
  page?: number
  per_page?: number
  status?: string
  customer_id?: string
  date_from?: string
  date_to?: string
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

export function usePaymentReceived(id: string) {
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

export function useOpenItems() {
  return useQuery({
    queryKey: salesKeys.payments.openItems,
    queryFn: async () => {
      const { data } = await getApiClient().get<ApiResponse<OpenItem[]>>(
        '/sales/payments-received/open-items',
      )
      return data.data
    },
  })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<PaymentReceived>) => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        '/sales/payments-received',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.payments.all }),
  })
}

export function useCompletePayment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}/complete`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.payments.detail(id) }),
  })
}

export function useVoidPayment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.payments.detail(id) }),
  })
}

export function useAllocatePayment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (allocations: PaymentAllocation[]) => {
      const { data } = await getApiClient().post<ApiResponse<PaymentReceived>>(
        `/sales/payments-received/${id}/allocate`,
        { allocations },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.payments.detail(id) })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

export function useClearOpenItems() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (allocations: PaymentAllocation[]) => {
      const { data } = await getApiClient().post<ApiResponse<{ cleared: number }>>(
        '/sales/payments-received/clear-open-items',
        { allocations },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.payments.openItems })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

// ─── Credit Notes ─────────────────────────────────────────────────────────────

export interface CreditNoteFilters {
  page?: number
  per_page?: number
  status?: string
  contact_id?: string
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

export function useCreditNote(id: string) {
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
    mutationFn: async (payload: Partial<CreditNote>) => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        '/sales/credit-notes',
        payload,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.all }),
  })
}

export function useApproveCreditNote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}/approve`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.detail(id) }),
  })
}

export function useApplyCreditNote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { invoice_id: string; amount: number }) => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}/apply`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: salesKeys.creditNotes.detail(id) })
      qc.invalidateQueries({ queryKey: salesKeys.invoices.all })
    },
  })
}

export function useVoidCreditNote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await getApiClient().post<ApiResponse<CreditNote>>(
        `/sales/credit-notes/${id}/void`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: salesKeys.creditNotes.detail(id) }),
  })
}
