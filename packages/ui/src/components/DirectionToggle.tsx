import { useTheme } from './ThemeProvider'
import { cn } from '../lib/utils'

interface DirectionToggleProps {
  className?: string
}

export function DirectionToggle({ className }: DirectionToggleProps) {
  const { dir, setDir } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setDir(dir === 'ltr' ? 'rtl' : 'ltr')}
      title={dir === 'ltr' ? 'Switch to RTL' : 'Switch to LTR'}
      aria-label={dir === 'ltr' ? 'Switch to right-to-left layout' : 'Switch to left-to-right layout'}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded border border-border bg-surface',
        'text-xs font-semibold text-muted hover:text-text hover:bg-surface-2 transition-colors',
        className,
      )}
    >
      {dir === 'ltr' ? 'ع' : 'A'}
    </button>
  )
}
