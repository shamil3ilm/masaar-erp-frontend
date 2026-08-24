import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-bg px-3 py-2 text-sm text-text transition-colors resize-y min-h-[80px]',
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

Textarea.displayName = 'Textarea'
