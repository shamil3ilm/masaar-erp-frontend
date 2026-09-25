import { Select, statusLabel } from '@masaar/ui'

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  /** The values to offer, in menu order; each shows as its title-cased label. */
  options: readonly string[]
  allLabel?: string
  className?: string
}

/**
 * The "All …" select that filters a list page by status or type. It carries
 * `allLabel` as its accessible name: the control stands on its own, with no
 * visible label beside it.
 */
export function StatusFilter({
  value, onChange, options, allLabel = 'All Statuses', className = 'max-w-[180px]',
}: StatusFilterProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      aria-label={allLabel}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>{statusLabel(option)}</option>
      ))}
    </Select>
  )
}
