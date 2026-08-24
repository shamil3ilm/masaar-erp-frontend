import { type ReactNode } from 'react'
import { cn } from '../lib/utils'
import { Button } from './Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Table primitives ──────────────────────────────────────────────────────────

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-sm border-collapse', className)}>
        {children}
      </table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-surface-2/60 border-b border-border">{children}</thead>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>
}

export function TR({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-surface-2/50',
        className,
      )}
    >
      {children}
    </tr>
  )
}

export function TH({ children, className, align = 'start' }: { children?: ReactNode; className?: string; align?: 'start' | 'end' | 'center' }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-xs font-medium text-muted whitespace-nowrap',
        align === 'end' ? 'text-end' : align === 'center' ? 'text-center' : 'text-start',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TD({ children, className, align = 'start', muted }: { children?: ReactNode; className?: string; align?: 'start' | 'end' | 'center'; muted?: boolean }) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm',
        muted ? 'text-muted' : 'text-text',
        align === 'end' ? 'text-end' : align === 'center' ? 'text-center' : 'text-start',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function TableEmpty({ message = 'No records found.', colSpan = 1 }: { message?: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-sm text-muted">
        {message}
      </td>
    </tr>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  lastPage: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, lastPage, total, perPage, onPageChange, className }: PaginationProps) {
  const from = Math.min((currentPage - 1) * perPage + 1, total)
  const to = Math.min(currentPage * perPage, total)

  return (
    <div className={cn('flex items-center justify-between gap-4 px-1 py-3', className)}>
      <p className="text-xs text-muted">
        {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </Button>
        <span className="px-2 text-xs text-text tabular-nums">{currentPage} / {lastPage || 1}</span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
