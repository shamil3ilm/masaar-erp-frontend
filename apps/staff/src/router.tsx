import { createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@erp/api-client'
import { useAuthStore } from './store/auth'
import { LoginPage } from './pages/LoginPage'
import { OrgPickerPage } from './pages/OrgPickerPage'
import { OnboardingPage } from './pages/zatca/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'

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
  component: DashboardPage,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' })
  },
})

const zatcaOnboardingRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/compliance/zatca/onboarding',
  component: OnboardingPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  orgPickerRoute,
  appRoute.addChildren([
    dashboardRoute,
    zatcaOnboardingRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
