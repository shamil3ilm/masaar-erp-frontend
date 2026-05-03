import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@erp/api-client'
import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { OrgPickerPage } from './pages/OrgPickerPage'
import { OnboardingPage } from './pages/zatca/OnboardingPage'
import { InvoicesPage } from './pages/zatca/InvoicesPage'
import { CreateInvoicePage } from './pages/zatca/CreateInvoicePage'
import { ReportsPage } from './pages/zatca/ReportsPage'

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
  component: Outlet,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mt-2">Welcome to ERP</p>
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' })
  },
})

// ZATCA onboarding
const zatcaOnboardingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/onboarding',
  component: OnboardingPage,
})

// ZATCA invoices list
const zatcaInvoicesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/invoices',
  component: InvoicesPage,
})

// ZATCA create invoice
const zatcaCreateInvoiceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/invoices/create',
  component: CreateInvoicePage,
})

// ZATCA reports
const zatcaReportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/reports',
  component: ReportsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  orgPickerRoute,
  appRoute.addChildren([
    dashboardRoute,
    zatcaOnboardingRoute,
    zatcaInvoicesRoute,
    zatcaCreateInvoiceRoute,
    zatcaReportsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
