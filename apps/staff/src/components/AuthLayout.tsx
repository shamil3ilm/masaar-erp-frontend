import type { ReactNode } from 'react'
import { Logo } from '@erp/ui'

interface AuthLayoutProps {
  children: ReactNode
}

const ACTIVITY = [
  { icon: '🧾', title: 'ZATCA invoice generated', sub: 'INV-2024-0891 · SAR 24,500', tag: 'Compliant' },
  { icon: '✅', title: 'VAT return filed', sub: 'Q4 2024 · AED 8,200', tag: 'Filed' },
  { icon: '💰', title: 'Payment reconciled', sub: 'SABB Bank · SAR 145,000', tag: 'Matched' },
  { icon: '📊', title: 'Journal entry posted', sub: 'FY2024 · 14 lines', tag: 'Posted' },
]

const STATS = [
  { value: '500+', label: 'Companies' },
  { value: '6', label: 'Countries' },
  { value: '99.9%', label: 'Uptime' },
]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-root">

      {/* ── LEFT: brand panel ──────────────────────────────────────────── */}
      <div className="auth-left">

        {/* Background orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-dot-grid" />

        {/* Content */}
        <div className="auth-left-inner">

          {/* Logo */}
          <div className="auth-left-logo">
            <Logo size={40} showName nameClassName="font-semibold text-white tracking-tight" />
          </div>

          {/* Headline */}
          <div className="auth-headline">
            <h1>The ERP built<br />for GCC &amp; India</h1>
            <p>ZATCA e-invoicing, VAT, multi-currency accounting, and payroll — in one platform your whole team will use.</p>
          </div>

          {/* Live activity feed */}
          <div className="auth-feed">
            {ACTIVITY.map((item, i) => (
              <div
                key={item.title}
                className="auth-feed-item"
                style={{ animationDelay: `${0.4 + i * 0.12}s` }}
              >
                <span className="auth-feed-icon">{item.icon}</span>
                <div className="auth-feed-body">
                  <span className="auth-feed-title">{item.title}</span>
                  <span className="auth-feed-sub">{item.sub}</span>
                </div>
                <span className="auth-feed-tag">{item.tag}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="auth-stats">
            {STATS.map((s) => (
              <div key={s.label} className="auth-stat">
                <span className="auth-stat-value">{s.value}</span>
                <span className="auth-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── RIGHT: form panel ──────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {children}
        </div>
      </div>

    </div>
  )
}
