import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient, initApiClient } from '@erp/api-client'
import { ThemeProvider } from '@erp/ui'
import { AdminApp } from './AdminApp'
import './index.css'

const queryClient = createQueryClient()

initApiClient(
  '/api/v1',
  () => localStorage.getItem('admin_token'),
  () => null,
  () => { localStorage.removeItem('admin_token'); window.location.reload() },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AdminApp />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
