import { cva } from 'class-variance-authority'

/**
 * The button's class recipe, kept apart from the component.
 *
 * SupportPage styles an anchor as a button, so this has to be importable on
 * its own. Exporting it from Button.tsx alongside the component is what breaks
 * fast refresh — a file that exports anything other than components reloads
 * the page instead of hot-swapping, on every edit.
 */
export const buttonVariants = cva(
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
