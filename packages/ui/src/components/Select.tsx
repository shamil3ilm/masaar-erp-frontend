import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full h-9 rounded-[--radius] border bg-surface px-3 text-sm text-text transition-colors appearance-none',
          'focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/25',
          error
            ? 'border-danger focus:ring-danger/25'
            : 'border-border-strong hover:border-muted',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2',
          // Chevron arrow via background image
          'bg-[image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M2 4l4 4 4-4\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center] pr-8',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)

Select.displayName = 'Select'
