# @erp/admin — Super-Admin Console

The super-admin portal for platform-level tenant management and organization oversight.

**Dev server:** `http://localhost:5174`

## What's Implemented

### Authentication
- `AdminLogin` — two-panel auth page using the shared `AuthLayout` from `@erp/ui` (dark brand panel left, form right)
- Form uses `FormField`, `Input`, `PasswordInput`, `Button`, `Alert` from `@erp/ui`
- Token stored in `localStorage`; logout via `AdminApp` state reset

### App Shell (`AdminShell`)
- Same `AppShell` + `Sidebar` + `TopBar` pattern as staff
- Theme toggle (light/dark) and profile dropdown
- Shared `ProfilePage` and `SupportPage` from `@erp/ui`
- Navigation: Dashboard, Organizations, Users, Settings, Support, Profile (state-based, no router)

### Dashboard
- KPI `StatCard` grid (organizations, users, monthly revenue, uptime)
- Recent activity list with `Badge` status indicators
- Data table with `Table`/`TH`/`TD`/`TR`/`Pagination` from `@erp/ui`

### Design System
- Full Masaar design system via `@erp/ui`
- Light / dark mode toggle
- No custom CSS — relies entirely on `preset.css` + Tailwind utilities

## Commands

```bash
# Development (port 5174)
pnpm --filter @erp/admin dev

# Production build
pnpm --filter @erp/admin build

# Type check
pnpm --filter @erp/admin typecheck
```

## Environment Variables

Create `apps/admin/.env.local`:

```env
VITE_API_URL=http://erp-backend.test/api/v1
```

## CSS Architecture

`apps/admin/src/index.css` contains only:
```css
@import "../../../packages/ui/src/styles/preset.css";
```

No custom CSS. All styling via Tailwind utilities and `@erp/ui` components.
