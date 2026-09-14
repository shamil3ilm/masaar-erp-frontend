import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface StatusPillProps {
  /** Background and text colour classes for this status. */
  tone: string
  className?: string
  children: ReactNode
}

/** The rounded status label the domain badges share; each badge owns its colour map. */
export function StatusPill({ tone, className, children }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tone,
        className,
      )}
    >
      {children}
    </span>
  )
}
