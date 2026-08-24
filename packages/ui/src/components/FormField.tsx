import type { ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Label } from './Label'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
  className?: string
  labelRight?: ReactNode
}

export function FormField({ label, htmlFor, required, hint, error, children, className, labelRight }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <Label htmlFor={htmlFor} required={required}>
              {label}
            </Label>
          )}
          {labelRight && <div>{labelRight}</div>}
        </div>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
