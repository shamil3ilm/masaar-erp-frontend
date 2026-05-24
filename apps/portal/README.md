# @erp/portal — Vendor/Customer Self-Service Portal

The external-facing portal for vendors and customers to view invoices, track orders, and interact with their account.

## Current State

Minimal Vite scaffold. The full portal module — invoice viewing, payment status, purchase order acknowledgment, and document downloads — is planned for an upcoming release.

## Commands

```bash
# Development (port 5175)
pnpm --filter @erp/portal dev

# Type check
pnpm --filter @erp/portal typecheck

# Production build
pnpm --filter @erp/portal build
```

## Environment Variables

Create `apps/portal/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=LoopERP Portal
```
