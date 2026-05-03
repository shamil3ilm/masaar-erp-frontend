import { useState } from 'react'
import { cn } from '../lib/utils'

interface AppShellProps {
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
}

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={cn('flex flex-col bg-white border-r border-gray-200 transition-all duration-200', collapsed ? 'w-16' : 'w-64')}>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="p-3 text-gray-500 hover:text-gray-900 self-end"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
        {sidebar}
      </aside>
      <div className="flex flex-col flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4">
          {topbar}
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
