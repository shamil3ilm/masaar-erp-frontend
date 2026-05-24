# @erp/staff — Internal Staff Portal

The primary application for internal staff. Handles day-to-day ERP operations including ZATCA e-invoicing compliance, HR, and financial workflows.

## What's Implemented

- **ZATCA Compliance module** — Saudi e-invoicing (Phase 2)
  - Onboarding wizard (CSID registration, cryptographic stamp setup)
  - Invoice list with status tracking (cleared, reported, rejected)
  - Create invoice form with Zod validation
  - Compliance reports and dashboard widgets

## Routes

| Route | Description |
|-------|-------------|
| `/login` | JWT authentication (username + password) |
| `/org-picker` | Organization selector after login (multi-tenant) |
| `/app/dashboard` | Main dashboard |
| `/app/compliance/zatca` | ZATCA compliance overview |
| `/app/compliance/zatca/onboarding` | CSID onboarding wizard |
| `/app/compliance/zatca/invoices` | Invoice list |
| `/app/compliance/zatca/invoices/create` | Create new ZATCA invoice |
| `/app/compliance/zatca/reports` | Compliance reports |

## Authentication

- JWT token stored in `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` to all requests and handles 401 refresh
- Active organization stored in Zustand; switching org re-scopes all API calls

## Commands

```bash
# Development (port 5173)
pnpm --filter @erp/staff dev

# Unit tests (Vitest)
pnpm --filter @erp/staff test

# E2E tests (Playwright)
pnpm --filter @erp/staff e2e

# Type check
pnpm --filter @erp/staff typecheck

# Production build
pnpm --filter @erp/staff build
```

## Environment Variables

Create `apps/staff/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=LoopERP Staff
```
