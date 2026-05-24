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
          'w-full h-9 rounded-[--radius] border bg-surface px-3 text-sm text-text transition-colors',
          'placeholder:text-faint',
          'focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/25',
          error
            ? 'border-danger focus:ring-danger/25'
            : 'border-border-strong hover:border-muted',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
