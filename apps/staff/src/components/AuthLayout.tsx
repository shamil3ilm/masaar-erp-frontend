import type { ReactNode } from 'react'
import { AuthLayout as SharedAuthLayout, Logo } from '@erp/ui'

function IconInvoice() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function IconPayment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
function IconLedger() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

const ACTIVITY = [
  { Icon: IconInvoice, title: 'ZATCA invoice generated', sub: 'INV-2024-0891 · SAR 24,500', tag: 'Compliant' },
  { Icon: IconCheck,   title: 'VAT return filed',         sub: 'Q4 2024 · AED 8,200',       tag: 'Filed'     },
  { Icon: IconPayment, title: 'Payment reconciled',       sub: 'SABB Bank · SAR 145,000',   tag: 'Matched'   },
  { Icon: IconLedger,  title: 'Journal entry posted',     sub: 'FY2024 · 14 lines',         tag: 'Posted'    },
]

const STATS = [
  { value: '500+',  label: 'Companies' },
  { value: '6',     label: 'Countries' },
  { value: '99.9%', label: 'Uptime'    },
]

function StaffBrandPanel() {
  return (
    <>
      <div className="auth-left-logo">
        <Logo size={38} showName nameClassName="font-semibold text-white tracking-tight" />
      </div>

      <div className="auth-headline">
        <h1>The ERP built<br />for GCC &amp; India</h1>
        <p>ZATCA e-invoicing, VAT, multi-currency accounting, and payroll — in one platform your whole team will use.</p>
      </div>

      <div className="auth-feed">
        {ACTIVITY.map(({ Icon, title, sub, tag }, i) => (
          <div key={title} className="auth-feed-item" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
            <span className="auth-feed-icon"><Icon /></span>
            <div className="auth-feed-body">
              <span className="auth-feed-title">{title}</span>
              <span className="auth-feed-sub">{sub}</span>
            </div>
            <span className="auth-feed-tag">{tag}</span>
          </div>
        ))}
      </div>

      <div className="auth-stats">
        {STATS.map((s) => (
          <div key={s.label} className="auth-stat">
            <span className="auth-stat-value">{s.value}</span>
            <span className="auth-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SharedAuthLayout leftPanel={<StaffBrandPanel />}>
      <div className="auth-right-logo">
        <Logo size={34} showName nameClassName="font-semibold text-gray-900 tracking-tight" />
      </div>
      {children}
    </SharedAuthLayout>
  )
}
