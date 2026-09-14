# Masaar ERP Frontend

Multi-tenant ERP frontend for GCC & India — a Turborepo monorepo containing three React applications and a shared component system.

## Monorepo Structure

### Apps

| App | Package | Port | Description |
|-----|---------|------|-------------|
| `apps/staff` | `@masaar/staff` | 5173 | Internal staff portal (ZATCA, invoicing, accounting, HR, sales, etc.) |
| `apps/admin` | `@masaar/admin` | 5174 | Super-admin console (tenant management, org oversight) |
| `apps/portal` | `@masaar/portal` | 5175 | Vendor self-service portal (tokenized invoice viewer) |

### Shared Packages

| Package | Description |
|---------|-------------|
| `@masaar/types` | TypeScript interfaces (Organization, User, ZatcaInvoice, VendorInvoice, etc.) |
| `@masaar/api-client` | Axios instance, TanStack Query hooks, auth helpers |
| `@masaar/ui` | Masaar design system — tokens, components, auth layout, app shell |

## Design System

All three apps share a single design system defined in `@masaar/ui`:

- **Token source:** `packages/ui/src/styles/theme.css` — CSS variables for light + dark mode (brand teal, navy sidebar, semantic feedback colors).
- **Preset:** `packages/ui/src/styles/preset.css` — the single file every app imports. Owns the Tailwind import, token→utility mapping, shadow tokens, and dark-mode variant. Never duplicate `@theme` blocks in app CSS.
- **Shared components:** `Button` (cva variants + sizes + loading), `Input`/`PasswordInput`/`Select`/`Textarea`, `FormField` (label + hint + error + labelRight), `Label`, `Alert`, `Badge`/`StatusBadge`, `Card`/`StatCard`, `Table`/`Pagination`, `Skeleton`, `AppShell`, `Sidebar`, `TopBar`, `PageHeader`, `AuthLayout`, `Logo`, `EmptyState`, `ConfirmDialog`, `ProfilePage`, `SupportPage`, and more.
- **Auth layout:** `AuthLayout` (exported from `@masaar/ui`) — the two-panel dark-brand-left + form-right shell used by both staff and admin login flows.
- **Icon source:** All icons come from `@masaar/ui`'s curated Lucide re-exports. Apps without a direct `lucide-react` dep (staff, portal) must use only these.

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Getting Started

```bash
# Install all dependencies
pnpm install

# Start all apps in development mode
pnpm dev
```

Every app runs without configuration. Only the staff app needs anything set,
and only to point it somewhere other than its default — see Environment
Variables below.

## Available Commands

### Root (runs across all apps/packages via Turbo)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm build --force` | Build bypassing Turborepo cache |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm test` | Run unit tests (`@masaar/staff`, `@masaar/ui`) |
| `pnpm e2e` | Run Playwright end-to-end tests (`@masaar/staff`) |
| `pnpm lint` | ESLint across every app and package |

Lint runs from a single `eslint.config.js` at the root rather than one per
package. Each package used to declare `lint: eslint .` with eslint installed
nowhere, so the command failed on invocation in all six; and with
`shamefully-hoist=false` a package cannot see a root devDependency, so
per-package configs would mean installing the toolchain six times.

### Per-App

The filter accepts either the package name or its directory, so
`--filter staff` and `--filter @masaar/staff` are the same thing.

```bash
pnpm --filter @masaar/staff dev        # Staff app only (port 5173)
pnpm --filter @masaar/admin dev        # Admin app only (port 5174)
pnpm --filter @masaar/portal dev       # Portal app only (port 5175)
pnpm --filter @masaar/staff build      # Build staff only
pnpm --filter @masaar/staff typecheck  # Type-check staff only
pnpm --filter @masaar/staff test       # Unit tests, once
pnpm --filter @masaar/staff test:watch # Unit tests, watching
pnpm --filter @masaar/staff e2e        # Playwright; starts its own dev server
pnpm --filter @masaar/staff preview    # Serve the built staff bundle
pnpm --filter @masaar/ui test          # Design-system component tests
```

## Environment Variables

`VITE_API_URL` is the only variable any app reads, and only two of the three
read it. Set it in that app's `.env.local`, which is not committed.

| App | Reads `VITE_API_URL` | Falls back to |
|-----|----------------------|---------------|
| `@masaar/staff` | yes | `http://localhost:8000/api/v1` |
| `@masaar/portal` | yes | `/api/v1` (same origin) |
| `@masaar/admin` | no — `/api/v1` is fixed in `src/main.tsx` | — |

```bash
# apps/staff/.env.local
VITE_API_URL=http://localhost:8000/api/v1
```

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
- **Icons:** Lucide React (curated re-exports via `@masaar/ui`)

## Known Issues

- Staff JS bundle is ~610 KB (minified) — above Vite's 500 KB warning. Code splitting via dynamic imports is a future improvement.
