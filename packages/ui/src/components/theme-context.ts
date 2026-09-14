import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type Dir = 'ltr' | 'rtl'

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
  dir: Dir
  setDir: (d: Dir) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * The context and its hook, kept apart from the provider component.
 *
 * A file exporting both a component and a hook loses fast refresh, so every
 * edit to ThemeProvider reloaded the page and dropped the app's state. This
 * split is the usual React arrangement for exactly that reason.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
