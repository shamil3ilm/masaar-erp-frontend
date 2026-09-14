/** Title-case a snake_case status for display: `partially_delivered` becomes "Partially Delivered". */
export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
