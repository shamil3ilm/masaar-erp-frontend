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
          'w-full rounded-lg border bg-bg px-3 py-2 text-sm text-text transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          error
            ? 'border-danger focus:ring-danger'
            : 'border-border hover:border-border-strong',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',
          // Chevron arrow via background image
          'bg-[image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'none\' stroke=\'%236b7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M2 4l4 4 4-4\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_0.75rem_center]',
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
