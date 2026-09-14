/**
 * Permission slugs the staff app checks, each one enforced by a
 * `check.permission:<slug>` middleware on the route the action calls
 * (routes/api/v1/sales.php, routes/api/v1/compliance.php).
 *
 * Hiding an action is only a courtesy: the backend still refuses the request.
 */
export type Permission =
  | 'sales.contacts.view'
  | 'sales.contacts.create'
  | 'sales.quotations.view'
  | 'sales.quotations.create'
  | 'sales.quotations.send'
  | 'sales.quotations.convert'
  | 'sales.orders.view'
  | 'sales.orders.confirm'
  | 'sales.orders.cancel'
  | 'sales.orders.convert'
  | 'sales.invoices.view'
  | 'sales.invoices.create'
  | 'sales.invoices.send'
  | 'sales.invoices.void'
  | 'sales.payments.view'
  | 'sales.payments.create'
  | 'sales.payments.complete'
  | 'sales.payments.void'
  | 'sales.credit-notes.view'
  | 'sales.credit-notes.create'
  | 'sales.credit-notes.approve'
  | 'sales.credit-notes.void'
  | 'compliance.onboarding.view'

/**
 * Whether the slugs from `/auth/me` include `permission`. Until they have
 * loaded (`null`) nothing is allowed. Super admins need no special case: the
 * backend lists every slug for them (User::getAllPermissions).
 */
export function can(granted: readonly string[] | null | undefined, permission: Permission): boolean {
  return granted?.includes(permission) ?? false
}

/** Keep the entries whose permission is granted; entries without one always stay. */
export function permitted<T extends { permission?: Permission }>(
  items: readonly T[],
  allow: (permission: Permission) => boolean,
): T[] {
  return items.filter((item) => !item.permission || allow(item.permission))
}
