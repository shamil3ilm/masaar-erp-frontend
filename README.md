# LoopERP Frontend

Multi-tenant ERP frontend for GCC & India — a Turborepo monorepo containing three React applications and shared packages.

## Monorepo Structure

### Apps

| App | Package | Port | Description |
|-----|---------|------|-------------|
| `apps/staff` | `@erp/staff` | 5173 | Internal staff portal (ZATCA, invoicing, HR, etc.) |
| `apps/admin` | `@erp/admin` | 5174 | Super-admin portal (tenant management, org oversight) |
| `apps/portal` | `@erp/portal` | 5175 | Vendor/customer self-service portal |

### Shared Packages

| Package | Description |
|---------|-------------|
| `@erp/types` | TypeScript interfaces (Organization, User, ZatcaInvoice, etc.) |
| `@erp/api-client` | Axios instance, TanStack Query hooks, MSW mocks |
| `@erp/ui` | Shared components (AppShell, Sidebar, TopBar, Logo, ZatcaStatusBadge, etc.) |

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting Started

```bash
# Clone the repository
git clone https://github.com/shamil3ilm/masaar-frontend.git
cd masaar-frontend

# Install all dependencies
pnpm install

# Set up environment variables for each app
cp apps/staff/.env.example apps/staff/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/portal/.env.example apps/portal/.env.local
# Edit each .env.local with your values

# Start all apps in development mode
pnpm dev
```

## Available Commands

### Root (runs across all apps/packages via Turbo)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm test` | Run Vitest across all packages |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm lint` | Lint all packages |

### Per-App

| Command | Description |
|---------|-------------|
| `pnpm --filter @erp/staff dev` | Start only the staff app |
| `pnpm --filter @erp/admin dev` | Start only the admin app |
| `pnpm --filter @erp/portal dev` | Start only the portal app |
| `pnpm --filter @erp/staff test` | Run unit tests for staff app |
| `pnpm --filter @erp/staff e2e` | Run Playwright E2E tests for staff app |

## Environment Variables

Each app reads from its own `.env.local`. Copy the example file and adjust values:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | App display name | `LoopERP Staff` |

## Tech Stack

- **Build system:** Turborepo, pnpm workspaces
- **Framework:** React 19, TypeScript 5, Vite 5
- **Routing:** TanStack Router v1 (code-based)
- **Data fetching:** TanStack Query v5
- **State management:** Zustand v5
- **UI:** shadcn/ui, Tailwind CSS v4, AG Grid Community
- **Forms & validation:** React Hook Form, Zod
- **HTTP client:** Axios with JWT interceptors
- **Testing:** Vitest + jsdom, MSW v2 (API mocking), Playwright (E2E)
