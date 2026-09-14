import { cn } from '../lib/utils'

/**
 * Canonical class string for a sidebar nav link — shared by every app's shell
 * so the active / hover treatment never drifts between apps.
 *
 * Its own module rather than a second export from Sidebar.tsx: a component
 * file that also exports a plain function loses fast refresh, so editing the
 * sidebar reloaded the page instead of hot-swapping it.
 */
export function sidebarLinkClass(active: boolean, collapsed = false): string {
  return cn(
    'flex items-center gap-3 py-2 text-sm font-medium transition-colors',
    collapsed
      ? 'justify-center px-2 rounded-lg'
      : active
        ? 'sb-active -mx-2 pl-5 pr-3'
        : 'px-3 rounded-lg text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text-active)]',
  )
}
