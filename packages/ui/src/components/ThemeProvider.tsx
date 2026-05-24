import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Dir = 'ltr' | 'rtl'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
  dir: Dir
  setDir: (d: Dir) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  defaultDir?: Dir
}

export function ThemeProvider({ children, defaultTheme = 'system', defaultDir = 'ltr' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('erp-theme') as Theme | null) ?? defaultTheme
  })
  const [dir, setDirState] = useState<Dir>(() => {
    return (localStorage.getItem('erp-dir') as Dir | null) ?? defaultDir
  })
  const [systemDark, setSystemDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  useEffect(() => {
    document.documentElement.dir = dir
  }, [dir])

  function setTheme(t: Theme) {
    localStorage.setItem('erp-theme', t)
    setThemeState(t)
  }

  function setDir(d: Dir) {
    localStorage.setItem('erp-dir', d)
    setDirState(d)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, dir, setDir }}>
      {children}
    </ThemeContext.Provider>
  )
}
