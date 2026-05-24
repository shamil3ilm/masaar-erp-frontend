import { useState } from 'react'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'

export function AdminApp() {
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
    <AdminDashboard
      onLogout={() => {
        localStorage.removeItem('admin_token')
        setToken(null)
      }}
    />
  )
}
