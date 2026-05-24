import { useState } from 'react'
import { cn } from '../lib/utils'

interface AppShellProps {
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
  sidebarClassName?: string
}

export function AppShell({ sidebar, topbar, children, sidebarClassName }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          'flex flex-col border-r border-white/10 transition-all duration-200',
          collapsed ? 'w-16' : 'w-64',
          sidebarClassName ?? 'bg-white border-gray-200',
        )}
      >
        <div className="flex items-center justify-end px-2 pt-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            >
              {collapsed
                ? <path d="M6 4l4 4-4 4" />
                : <path d="M10 4L6 8l4 4" />}
            </svg>
          </button>
        </div>
        {sidebar}
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 shrink-0">
          {topbar}
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
