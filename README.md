# Masaar ERP Frontend

Multi-tenant ERP frontend for GCC & India — a Turborepo monorepo containing three React applications and a shared component system.

## Monorepo Structure

### Apps

| App | Package | Port | Description |
|-----|---------|------|-------------|
| `apps/staff` | `@erp/staff` | 5173 | Internal staff portal (ZATCA, invoicing, accounting, HR, sales, etc.) |
| `apps/admin` | `@erp/admin` | 5174 | Super-admin console (tenant management, org oversight) |
| `apps/portal` | `@erp/portal` | 5181 | Vendor self-service portal (tokenized invoice viewer) |

### Shared Packages

| Package | Description |
|---------|-------------|
| `@erp/types` | TypeScript interfaces (Organization, User, ZatcaInvoice, VendorInvoice, etc.) |
| `@erp/api-client` | Axios instance, TanStack Query hooks, auth helpers |
| `@erp/ui` | Masaar design system — tokens, components, auth layout, app shell |

## Design System

All three apps share a single design system defined in `@erp/ui`:

- **Token source:** `packages/ui/src/styles/theme.css` — CSS variables for light + dark mode (brand teal, navy sidebar, semantic feedback colors).
- **Preset:** `packages/ui/src/styles/preset.css` — the single file every app imports. Owns the Tailwind import, token→utility mapping, shadow tokens, and dark-mode variant. Never duplicate `@theme` blocks in app CSS.
- **Shared components:** `Button` (cva variants + sizes + loading), `Input`/`PasswordInput`/`Select`/`Textarea`, `FormField` (label + hint + error + labelRight), `Label`, `Alert`, `Badge`/`StatusBadge`, `Card`/`StatCard`, `Table`/`Pagination`, `Skeleton`, `AppShell`, `Sidebar`, `TopBar`, `PageHeader`, `AuthLayout`, `Logo`, `EmptyState`, `ConfirmDialog`, `ProfilePage`, `SupportPage`, and more.
- **Auth layout:** `AuthLayout` (exported from `@erp/ui`) — the two-panel dark-brand-left + form-right shell used by both staff and admin login flows.
- **Icon source:** All icons come from `@erp/ui`'s curated Lucide re-exports. Apps without a direct `lucide-react` dep (staff, portal) must use only these.

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting Started

```bash
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
| `pnpm build --force` | Build bypassing Turborepo cache |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm lint` | Lint all packages |

### Per-App

```bash
pnpm --filter @erp/staff dev        # Staff app only (port 5173)
pnpm --filter @erp/admin dev        # Admin app only (port 5174)
pnpm --filter @erp/portal dev       # Portal app only (port 5181)
pnpm --filter @erp/staff build      # Build staff only
pnpm --filter @erp/staff typecheck  # Type-check staff only
```

## Environment Variables

Each app reads from its own `.env.local`:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://erp-backend.test/api/v1` |

## Tech Stack

- **Build system:** Turborepo, pnpm workspaces
- **Framework:** React 19, TypeScript 5, Vite 5
- **Routing:** TanStack Router v1 (code-based, type-safe)
- **Data fetching:** TanStack Query v5
- **State management:** Zustand v5
- **Styling:** Tailwind CSS v4, custom Masaar design system (no shadcn/ui)
- **Component variants:** class-variance-authority (cva)
- **Forms & validation:** React Hook Form, Zod
- **HTTP client:** Axios with JWT interceptors
- **Testing:** Vitest + jsdom, Playwright (E2E)
- **Icons:** Lucide React (curated re-exports via `@erp/ui`)

## Known Issues

- `pnpm typecheck` fails in `packages/api-client/src/mocks/zatca.ts` — some ZATCA mock types are not exported from `@erp/types`. Not caused by design system work; fix separately.
- Staff JS bundle is ~610 KB (minified) — above Vite's 500 KB warning. Code splitting via dynamic imports is a future improvement.
