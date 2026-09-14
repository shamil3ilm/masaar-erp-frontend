# @masaar/staff — Internal Staff Portal

The primary application for internal staff. Handles day-to-day ERP operations including ZATCA e-invoicing compliance, accounting, sales, HR, and more.

**Dev server:** `http://localhost:5173`

## What's Implemented

### Design System
- Full Masaar design system via `@masaar/ui` — tokens, components, auth shell
- Light / dark mode with toggle (persisted, respects system preference)
- RTL layout support (Arabic) via direction toggle
- Responsive layout from mobile to wide desktop

### Authentication Flow
All auth pages share the `AuthLayout` wrapper (staff brand panel + form panel) and use `FormField`, `Input`/`PasswordInput`, `Button`, `Alert` from `@masaar/ui`.

| Page | Route | Notes |
|------|-------|-------|
| Login | `/login` | Email + password; 2FA challenge inline |
| Register | `/register` | Full org + user registration with Zod validation |
| Verify email | `/verify-email` | 6-digit code entry |
| Forgot password | `/forgot-password` | Email link request |
| Reset password | `/reset-password` | Token-based new password form |
| Org picker | `/org-picker` | Multi-org selector post-login |

### App Shell
- Collapsible sidebar with section groups and active state
- TopBar with org switcher, notification bell, profile dropdown (avatar initials, role, sign-out)
- Theme toggle (light/dark/system) and direction toggle (LTR/RTL) in topbar
- Shared `ProfilePage` and `SupportPage` (from `@masaar/ui`)

### Modules

| Module | Route prefix | Status |
|--------|-------------|--------|
| Dashboard | `/app/dashboard` | KPI cards + activity |
| ZATCA Compliance | `/app/compliance/zatca` | Onboarding wizard, invoice list + create, reports |
| Sales | `/app/sales` | Contacts, invoices, payments, quotations |
| More modules | `/app/*` | Stubs / in progress |

## Commands

```bash
# Development (port 5173)
pnpm --filter @masaar/staff dev

# Production build
pnpm --filter @masaar/staff build

# Type check
pnpm --filter @masaar/staff typecheck

# Unit tests (Vitest) — once, or watching
pnpm --filter @masaar/staff test
pnpm --filter @masaar/staff test:watch

# E2E tests (Playwright). The config starts its own dev server on 5173 and
# reuses one already running.
pnpm --filter @masaar/staff e2e

# Serve the production build locally
pnpm --filter @masaar/staff preview
```

## Environment Variables

`VITE_API_URL` defaults to `http://localhost:8000/api/v1`. Override it by
creating `apps/staff/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## CSS Architecture

`apps/staff/src/index.css` imports `packages/ui/src/styles/preset.css` (which owns Tailwind + tokens) then adds only staff-specific primitives:
- `.field`, `.badge`, `.alert`, `.tab` — Masaar template-aligned form/feedback primitives
- `.focus-ring`, `.rtl-flip` — utilities

Auth layout CSS (`.auth-root`, `.auth-left`, `.auth-right`, `auth-*` classes) lives in `packages/ui/src/styles/theme.css` so it's available to all apps.
