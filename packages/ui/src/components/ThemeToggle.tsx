import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '../lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className={cn('flex items-center rounded-md border border-border bg-surface p-0.5 gap-0.5', className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded text-xs transition-colors',
            theme === value
              ? 'bg-brand text-brand-fg shadow-sm'
              : 'text-muted hover:text-text hover:bg-surface-2',
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
