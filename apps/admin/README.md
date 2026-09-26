# @masaar/admin — Super-Admin Console

The super-admin portal for platform-level tenant management and organization oversight.

**Dev server:** `http://localhost:5174`

## What's Implemented

### Authentication
- `AdminLogin` — two-panel auth page using the shared `AuthLayout` from `@masaar/ui` (dark brand panel left, form right)
- Form uses `FormField`, `Input`, `PasswordInput`, `Button`, `Alert` from `@masaar/ui`
- Token stored in `localStorage`; logout via `AdminApp` state reset

### App Shell (`AdminShell`)
- Same `AppShell` + `Sidebar` + `TopBar` pattern as staff
- Theme toggle (light/dark) and profile dropdown
- Shared `ProfilePage` and `SupportPage` from `@masaar/ui`
- Navigation: Dashboard, Organizations, Users, Settings, Support, Profile (state-based, no router)

### Dashboard
- KPI `StatCard` grid (organizations, users, monthly revenue, uptime)
- Recent activity list with `Badge` status indicators
- Data table with `Table`/`TH`/`TD`/`TR`/`Pagination` from `@masaar/ui`

### Design System
- Full Masaar design system via `@masaar/ui`
- Light / dark mode toggle
- No custom CSS — relies entirely on `preset.css` + Tailwind utilities

## Commands

```bash
# Development (port 5174)
pnpm --filter @masaar/admin dev

# Production build
pnpm --filter @masaar/admin build

# Unit tests (Vitest + Testing Library)
pnpm --filter @masaar/admin test

# Type check
pnpm --filter @masaar/admin typecheck
```

## Environment Variables

None. The admin app reads no `import.meta.env` value — its API base is the
literal `/api/v1` in `src/main.tsx`, so it expects to be served from the same
origin as the backend. A `.env.local` here does nothing; pointing admin at
another host is a code change.

## CSS Architecture

`apps/admin/src/index.css` contains only:
```css
@import "../../../packages/ui/src/styles/preset.css";
```

No custom CSS. All styling via Tailwind utilities and `@masaar/ui` components.
