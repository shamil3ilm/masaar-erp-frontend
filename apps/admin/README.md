# @erp/admin — Super-Admin Portal

The super-admin portal for platform-level tenant management and organization oversight.

## Current State

Minimal Vite scaffold. The full admin module — tenant provisioning, subscription management, organization health dashboards, and impersonation tooling — is planned for an upcoming release.

## Commands

```bash
# Development (port 5174)
pnpm --filter @erp/admin dev

# Type check
pnpm --filter @erp/admin typecheck

# Production build
pnpm --filter @erp/admin build
```

## Environment Variables

Create `apps/admin/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=LoopERP Admin
```
