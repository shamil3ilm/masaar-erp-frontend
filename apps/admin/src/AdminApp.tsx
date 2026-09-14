import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AdminLogin } from './pages/AdminLogin'
import { AdminShell } from './components/AdminShell'

export function AdminApp() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'))

  if (!token) {
    return (
      <AdminLogin
        onLogin={(t) => {
          localStorage.setItem('admin_token', t)
          setToken(t)
        }}
      />
    )
  }

  return (
    <AdminShell
      onLogout={() => {
        localStorage.removeItem('admin_token')
        queryClient.clear()
        setToken(null)
      }}
    />
  )
}
