import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('block text-[13px] font-medium text-text', className)}
        {...props}
      >
        {children}
        {required && (
          <span className="ms-0.5 text-danger" aria-hidden="true">*</span>
        )}
      </label>
    )
  },
)

Label.displayName = 'Label'
