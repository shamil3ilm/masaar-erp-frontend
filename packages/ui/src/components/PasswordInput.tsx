import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../lib/utils'

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative w-full">
        <input
          {...props}
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn(
            'w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400',
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 right-2.5 flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-600 transition-colors"
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
