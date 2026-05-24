import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from '@erp/ui'
import { router } from './router'
import { initApiClient } from '@erp/api-client'
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
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
