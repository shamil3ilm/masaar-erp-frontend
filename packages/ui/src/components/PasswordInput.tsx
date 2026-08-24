import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'
import { Input, type InputProps } from './Input'

type PasswordInputProps = Omit<InputProps, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative w-full">
        {/* Reuses the shared Input so the field is identical to every other
            input — only the visibility toggle differs. */}
        <Input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pe-10', className)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute end-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center text-faint hover:text-muted transition-colors"
          tabIndex={-1}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
