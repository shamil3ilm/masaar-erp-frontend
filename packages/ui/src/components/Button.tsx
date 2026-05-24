import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[--radius] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:          'bg-brand text-brand-fg hover:bg-brand-dark',
        secondary:        'bg-surface-2 text-text hover:bg-border',
        outline:          'border border-border-strong text-text hover:bg-surface-2',
        ghost:            'text-text hover:bg-surface-2',
        danger:           'bg-danger text-danger-fg hover:opacity-90',
        'danger-outline': 'border border-danger text-danger hover:bg-danger-subtle',
      },
      size: {
        sm:       'h-8  px-2.5 text-xs',
        md:       'h-9  px-3.5 text-sm',
        lg:       'h-11 px-5   text-[15px]',
        xl:       'h-12 px-6   text-base',
        icon:     'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, iconLeft, iconRight, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading === true}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin shrink-0" />
        ) : (
          iconLeft && <span className="shrink-0">{iconLeft}</span>
        )}
        {children}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { buttonVariants }
