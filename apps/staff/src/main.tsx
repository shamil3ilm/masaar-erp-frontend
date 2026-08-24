import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ErrorBoundary, ThemeProvider } from '@masaar/ui'
import { router } from './router'
import { initApiClient } from '@masaar/api-client'
import { useAuthStore } from './store/auth'
import './index.css'

initApiClient(
  (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8000/api/v1',
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().organization?.id ?? null,
  () => useAuthStore.getState().logout(),
)

useAuthStore.getState().hydrateFromStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>,
)
