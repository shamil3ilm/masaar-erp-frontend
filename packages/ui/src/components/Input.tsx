import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-bg px-3 py-2 text-sm text-text transition-colors',
          'placeholder:text-faint',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          error
            ? 'border-danger focus:ring-danger'
            : 'border-border hover:border-border-strong',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
