import type { ReactNode } from 'react'

interface AuthLayoutProps {
  /** Content rendered inside the dark brand panel (logo, headline, feed, etc.) */
  leftPanel?: ReactNode
  /** The form / right-side content */
  children: ReactNode
}

export function AuthLayout({ leftPanel, children }: AuthLayoutProps) {
  return (
    <div className="auth-root">
      {leftPanel !== undefined && (
        <div className="auth-left">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-orb auth-orb-3" />
          <div className="auth-dot-grid" />
          <div className="auth-left-inner">
            {leftPanel}
          </div>
        </div>
      )}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {children}
        </div>
      </div>
    </div>
  )
}
