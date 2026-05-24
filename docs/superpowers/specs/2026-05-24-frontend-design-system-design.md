# Frontend Design System & UI Overhaul — Design

**Date:** 2026-05-24
**Branch:** `feat/design-system`
**Status:** Approved direction, pending spec review

## Problem

The ERP frontend (`erp-frontend` monorepo: `staff`, `admin`, `portal` apps) looks
"plain, poor, and empty." Concrete causes:

- **Emoji icons** (👥 📋 🛒) used everywhere instead of the `lucide-react` library
  already shipped in `@erp/ui`.
- **No component system** — buttons are raw inline `bg-blue-600` strings duplicated
  across every page; tables, selects, badges, and inputs are all hand-rolled and
  inconsistent.
- `class-variance-authority` + `tailwind-merge` are installed but **unused** — the
  shadcn-style toolchain exists but no variant-based components were built.
- The dashboard is **static and dead** — module link cards + a "getting started"
  list, no KPIs, no real data hierarchy.
- Quality is **uneven**: auth pages (`AuthLayout`) are well-designed; the in-app
  experience is not.

## Goals

1. A real, shared design system in `@erp/ui` consumed by all three apps.
2. Modern SaaS ERP aesthetic (clean, dense, professional; Linear/Stripe/modern-Odoo feel).
3. **Light + dark mode** with a user toggle, persisted, defaulting to system preference.
4. **RTL layout support** (Arabic — required for GCC) via a direction toggle and CSS
   logical properties. *(Full message translation/i18n is out of scope for this pass;
   we ensure the layout flips correctly and is i18n-ready.)*
5. **User-friendly navigation** — going back is always easy (breadcrumbs + back button
   on detail/form pages; browser-back-friendly routing).
6. **Easily identifiable profile and sidebar** — prominent user menu with avatar/name/role;
   clearly branded, well-structured sidebar with icons and obvious active state.
7. **Responsive — proper fit at every screen size.** Layouts adapt fluidly from small
   laptops to large monitors and down to tablet/mobile; no horizontal overflow, no wasted
   whitespace, no clipped content.

## Non-Goals (this pass)

- Translating UI strings into Arabic (layout RTL only; strings stay English, i18n-ready).
- New runtime dependencies — use what's installed (`lucide-react`, `cva`, `tailwind-merge`).
  Radix primitives are a possible *future* add for accessible overlays, not now.
- Backend/API changes. We consume existing endpoints; KPI widgets use existing summary
  endpoints or graceful placeholders where none exist.
- Charts/graphs library adoption (KPI cards + simple CSS visuals only for now).

## Architecture

### Theming (light/dark + RTL)

- A `ThemeProvider` (in `@erp/ui`) manages `theme` (`light`/`dark`/`system`) and
  `dir` (`ltr`/`rtl`). It writes `class="dark"` and `dir`/`lang` onto `<html>`,
  persists to `localStorage`, and respects `prefers-color-scheme` for the `system` setting.
- **Semantic design tokens** defined as CSS variables in a shared
  `packages/ui/src/styles/theme.css`, with a `.dark` override block. Examples:
  `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`,
  `--color-text`, `--color-text-muted`, `--color-brand`, `--color-brand-fg`,
  `--color-danger`, `--color-success`, `--color-warning`.
  Each app's `index.css` imports this and maps the tokens into Tailwind 4 `@theme`
  (e.g. `--color-bg: var(...)`) so utilities like `bg-bg`, `text-muted`,
  `border-border` work and auto-flip in dark mode.
- The existing teal/navy brand stays; the `--color-blue-*` → teal remap is preserved
  for backward compatibility during migration.
- **RTL** uses Tailwind logical-property utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`,
  `text-start`, `text-end`, `start-*`, `end-*`) instead of physical `pl/pr/left/right`.
  Components are authored/migrated to logical props so `dir="rtl"` mirrors correctly.
- A font: **Inter** (self-hosted via `@fontsource/inter` *or* a CSS `@font-face`/Google
  link — decide at implementation; prefer self-host to avoid network dependency).

### Shared component library (`@erp/ui`)

Built with `cva` for variants and `cn()` (clsx + tailwind-merge) for class merging:

- `ThemeProvider`, `useTheme`, `ThemeToggle`, `DirectionToggle`
- `Button` — variants: `primary | secondary | outline | ghost | danger`; sizes `sm | md | lg`;
  `loading`, `iconLeft/iconRight` (lucide), full-width option.
- Form controls: `Input`, `Textarea`, `Select`, `Label`, `FormField` (label + control +
  error + hint), `PasswordInput` (refactor existing).
- `Badge` + generalized `StatusBadge` (semantic color map); refactor `SalesStatusBadge`
  and `ZatcaStatusBadge` to build on it.
- `Card` / `CardHeader` / `CardBody`; refined `StatCard` (KPI: icon + label + value + trend).
- `Table` primitives: `Table`, `THead`, `TR`, `TH`, `TD`, `TableEmpty`, plus a
  `Pagination` footer component. (AG Grid stays for heavy grids; these style the
  hand-rolled tables.)
- `Skeleton` (line/block/table-row) for loading states.
- `Icon` convention — re-export curated lucide icons from `@erp/ui` so apps import from
  one place; **remove all emoji**.
- Refined shell: `AppShell` (theme-aware, RTL-aware), `Sidebar` (branded header, grouped
  nav, lucide icons, clear active state, collapse with tooltips), `TopBar` (breadcrumb
  slot, theme toggle, direction toggle, **prominent profile menu**: avatar + name + role +
  dropdown with Profile / Settings / Sign out).
- `PageHeader` — refined; add optional **Back button** + icon; breadcrumbs styled.
- `EmptyState` — refined with lucide icon; theme-aware.

### Responsive layout (fit at every screen size)

- **Breakpoint strategy** (Tailwind defaults): mobile-first base styles, then `sm` (640),
  `md` (768), `lg` (1024), `xl` (1280), `2xl` (1536).
- **AppShell:** sidebar is a fixed rail on `lg+`; below `lg` it collapses into an
  off-canvas drawer toggled from the TopBar (hamburger). Content area uses `min-w-0` to
  prevent flex overflow; max content width caps on ultra-wide screens to avoid line-length
  sprawl, with comfortable side padding that scales by breakpoint.
- **KPI/Stat grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (fluid auto-fit where
  appropriate), so cards reflow rather than squash.
- **Tables:** horizontal scroll container on small screens (no page-level overflow);
  consider priority-column hiding on `< md` for the densest tables. AG Grid grids size to
  their container.
- **Forms:** single column on mobile, two-column on `md+` where it aids scanning.
- **TopBar:** condenses on small screens (icon-only actions, profile collapses to avatar).
- Verified via screenshots at representative widths (mobile ~375, tablet ~768,
  laptop ~1280, wide ~1680) in addition to light/dark and LTR/RTL.

### Navigation / "easy to go back"

- `PageHeader` gains an optional back affordance (chevron + label) used on all
  detail/create/edit pages, wired to router history / parent route.
- Breadcrumbs become real links (currently mostly non-links) so any level is one click away.
- Sidebar active state reflects the current route reliably (fix `startsWith` edge cases).

## App-by-app migration

1. **Foundation** — tokens, theme/dir providers, all `@erp/ui` components above; export
   from `packages/ui/src/index.ts`. Update each app's `index.css` to the token system.
2. **Staff** — rebuild `DashboardPage` (KPI/overview + quick actions, no emoji); migrate
   `AppLayout`/sidebar to lucide + theme/dir/profile; migrate all `sales/*` list & create
   pages and `zatca/OnboardingPage` to new `Button`/`FormField`/`Table`/`Badge`/`StatCard`.
3. **Admin** — `AdminDashboard` + `AdminLogin` onto the system.
4. **Portal** — `InvoicePage` + `ErrorPage` polished (public-facing, theme/RTL aware).

## Testing & verification

- Component unit tests (Vitest + Testing Library) for `Button`, `StatusBadge`,
  `ThemeProvider` (toggle persists, sets class/dir), `FormField` (error rendering).
  Keep/extend existing `LoadingSpinner`/`Sidebar`/zatca tests.
- `pnpm typecheck` and `pnpm lint` green across the workspace.
- **Live visual verification**: run the staff dev server and screenshot real pages
  (light + dark, LTR + RTL) at each milestone via the existing `_shot.mjs`; share for review.

## Risks

- Tailwind 4 `@theme` + CSS-variable dark mode interaction — validate the token mapping
  early on one component before mass migration.
- RTL regressions from leftover physical-property classes — migrate logical props as we
  touch each file; spot-check with `dir="rtl"` screenshots.
- Scope is large (3 apps); mitigated by phasing + screenshot checkpoints. "Other, we'll
  see on the way" items handled iteratively per user.

## Open decisions (resolve during implementation)

- Inter delivery: `@fontsource/inter` (adds a dev dep) vs. CSS `@font-face` with bundled
  woff2. Lean self-hosted.
- Whether `dir` is user-toggle-only now or also auto-set from a future locale (build the
  toggle now; locale-wiring later).
