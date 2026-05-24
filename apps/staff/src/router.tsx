import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@erp/api-client'
import { useAuthStore } from './store/auth'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { OrgPickerPage } from './pages/OrgPickerPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { SupportPage } from './pages/SupportPage'
// ZATCA
import { OnboardingPage } from './pages/zatca/OnboardingPage'
// Sales
import { ContactsPage } from './pages/sales/ContactsPage'
import { CreateContactPage } from './pages/sales/CreateContactPage'
import { QuotationsPage } from './pages/sales/QuotationsPage'
import { CreateQuotationPage } from './pages/sales/CreateQuotationPage'
import { SalesOrdersPage } from './pages/sales/SalesOrdersPage'
import { InvoicesPage } from './pages/sales/InvoicesPage'
import { CreateInvoicePage } from './pages/sales/CreateInvoicePage'
import { PaymentsPage } from './pages/sales/PaymentsPage'
import { CreatePaymentPage } from './pages/sales/CreatePaymentPage'
import { CreditNotesPage } from './pages/sales/CreditNotesPage'
import { CreateCreditNotePage } from './pages/sales/CreateCreditNotePage'

const queryClient = createQueryClient()

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  ),
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
})

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: VerifyEmailPage,
})

const orgPickerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/org-picker',
  component: OrgPickerPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: () => {
    const { token } = useAuthStore.getState()
    if (!token) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/profile',
  component: ProfilePage,
})

const supportRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/support',
  component: SupportPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' })
  },
})

// ─── ZATCA ────────────────────────────────────────────────────────────────────

const zatcaOnboardingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/onboarding',
  component: OnboardingPage,
})

// ─── Sales: Contacts ──────────────────────────────────────────────────────────

const contactsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/contacts',
  component: ContactsPage,
})

const createContactRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/contacts/new',
  component: CreateContactPage,
})

// ─── Sales: Quotations ────────────────────────────────────────────────────────

const quotationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/quotations',
  component: QuotationsPage,
})

const createQuotationRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/quotations/new',
  component: CreateQuotationPage,
})

// ─── Sales: Sales Orders ──────────────────────────────────────────────────────

const salesOrdersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/sales-orders',
  component: SalesOrdersPage,
})

// ─── Sales: Invoices ──────────────────────────────────────────────────────────

const salesInvoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/invoices',
  component: InvoicesPage,
})

const createSalesInvoiceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/invoices/new',
  component: CreateInvoicePage,
})

// ─── Sales: Payments ──────────────────────────────────────────────────────────

const paymentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/payments',
  component: PaymentsPage,
})

const createPaymentRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/payments/new',
  component: CreatePaymentPage,
})

// ─── Sales: Credit Notes ──────────────────────────────────────────────────────

const creditNotesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/credit-notes',
  component: CreditNotesPage,
})

const createCreditNoteRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sales/credit-notes/new',
  component: CreateCreditNotePage,
})

// ─── Route Tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  verifyEmailRoute,
  orgPickerRoute,
  appRoute.addChildren([
    dashboardRoute,
    profileRoute,
    supportRoute,
    // ZATCA
    zatcaOnboardingRoute,
    // Sales
    contactsRoute,
    createContactRoute,
    quotationsRoute,
    createQuotationRoute,
    salesOrdersRoute,
    salesInvoicesRoute,
    createSalesInvoiceRoute,
    paymentsRoute,
    createPaymentRoute,
    creditNotesRoute,
    createCreditNoteRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
