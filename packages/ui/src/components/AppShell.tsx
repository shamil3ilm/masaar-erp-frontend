import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface AppShellProps {
  sidebar: ReactNode
  topbar: ReactNode
  children: ReactNode
  sidebarClassName?: string
}

export function AppShell({ sidebar, topbar, children, sidebarClassName }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed rail on lg+, off-canvas drawer on mobile */}
      <aside
        className={cn(
          'z-40 flex-col h-full transition-transform duration-200',
          // Desktop: always visible, part of flow
          'hidden lg:flex lg:relative lg:translate-x-0',
          // Mobile: fixed overlay
          mobileOpen && '!flex fixed inset-y-0 start-0 translate-x-0',
          sidebarClassName,
        )}
        style={{ width: 'var(--sidebar-width, 240px)' }}
      >
        {sidebar}
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-bg border-b border-border flex items-center px-4 gap-3">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors -ms-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {topbar}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
