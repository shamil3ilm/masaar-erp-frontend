# Frontend Design System & UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain, inconsistent ERP frontend with a modern SaaS design system shared across the `staff`, `admin`, and `portal` apps — with light/dark themes, RTL support, responsive layout, easy back-navigation, and a prominent profile/sidebar.

**Architecture:** Build a token-driven, `cva`-based component library in `@erp/ui` (no new runtime deps — `lucide-react`, `class-variance-authority`, `tailwind-merge` already installed). Theming uses semantic CSS variables flipped by a `.dark` class; RTL uses Tailwind logical-property utilities driven by `dir` on `<html>`. Each app's `index.css` maps tokens into Tailwind 4 `@theme`. Then migrate apps phase-by-phase, verifying visually with live screenshots (light/dark, LTR/RTL, 4 widths).

**Tech Stack:** React 19, Tailwind CSS 4 (`@tailwindcss/vite`), TanStack Router/Query, `cva`, `tailwind-merge`, `clsx`, `lucide-react`, Vitest + Testing Library, Playwright (`_shot.mjs` for screenshots).

**Spec:** `docs/superpowers/specs/2026-05-24-frontend-design-system-design.md`

---

## File Structure

**New in `packages/ui/src/`:**
- `styles/theme.css` — semantic CSS-variable tokens + `.dark` overrides + Inter `@font-face`.
- `theme/ThemeProvider.tsx` — theme (`light|dark|system`) + dir (`ltr|rtl`) state, persistence, `<html>` sync.
- `theme/useTheme.ts` — hook re-export/typing for the context.
- `components/ThemeToggle.tsx`, `components/DirectionToggle.tsx`.
- `components/Button.tsx`, `components/Badge.tsx`, `components/StatusBadge.tsx`.
- `components/form/Input.tsx`, `form/Textarea.tsx`, `form/Select.tsx`, `form/Label.tsx`, `form/FormField.tsx`.
- `components/Card.tsx`, `components/StatCard.tsx`.
- `components/table/Table.tsx` (Table/THead/TR/TH/TD/TableEmpty), `table/Pagination.tsx`.
- `components/Skeleton.tsx`.
- `icons.ts` — curated lucide re-exports.
- `components/ProfileMenu.tsx` — avatar + name + role + dropdown.

**Modified in `packages/ui/src/`:**
- `index.ts` (exports), `components/AppShell.tsx`, `components/Sidebar.tsx`, `components/TopBar.tsx`, `components/PageHeader.tsx`, `components/EmptyState.tsx`, `components/DataCard.tsx`, `components/PasswordInput.tsx`, `components/sales/SalesStatusBadge.tsx`, `components/zatca/ZatcaStatusBadge.tsx`, `lib/utils.ts` (ensure `cn`).

**Modified per app:**
- `apps/{staff,admin,portal}/src/index.css` — import token system, map `@theme`.
- `apps/{staff,admin,portal}/src/main.tsx` — wrap in `ThemeProvider`.
- Staff: `pages/DashboardPage.tsx`, `components/AppLayout.tsx`, all `pages/sales/*`, `pages/zatca/OnboardingPage.tsx`, auth pages as needed.
- Admin: `pages/AdminDashboard.tsx`, `pages/AdminLogin.tsx`.
- Portal: `pages/InvoicePage.tsx`, `pages/ErrorPage.tsx`, `index.css`.

---

## Phase 0 — Baseline screenshots

### Task 0: Capture "before" screenshots

**Files:** none (uses existing `apps/staff/_shot.mjs`).

- [ ] **Step 1: Start the staff dev server**

Run (background): `cd apps/staff; pnpm dev`
Expected: Vite serving on `http://localhost:5173`.

- [ ] **Step 2: Capture before-state of dashboard + one list page + login**

Run: `cd apps/staff; node _shot.mjs` (adjust target URLs inside if needed) and save to `docs/superpowers/_before/`.
Expected: PNGs written; keep for before/after comparison.

- [ ] **Step 3: Commit the baseline shots**

```bash
git add docs/superpowers/_before
git commit -m "chore: baseline screenshots before design system"
```

---

## Phase 1 — Foundation (tokens, theme, components)

### Task 1: Design tokens + Inter font

**Files:**
- Create: `packages/ui/src/styles/theme.css`

- [ ] **Step 1: Write `theme.css` with semantic tokens + dark overrides**

```css
/* Inter (self-hosted woff2 placed in packages/ui/src/styles/fonts/) */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('./fonts/Inter-variable.woff2') format('woff2');
}

:root {
  --color-bg: #f8fafc;          /* slate-50 */
  --color-surface: #ffffff;
  --color-surface-2: #f1f5f9;   /* slate-100 */
  --color-border: #e2e8f0;      /* slate-200 */
  --color-text: #0f172a;        /* slate-900 */
  --color-text-muted: #64748b;  /* slate-500 */
  --color-brand: #14b8a6;
  --color-brand-fg: #ffffff;
  --color-brand-dark: #0d9488;
  --color-surface-brand: #1a1f36; /* navy sidebar */
  --color-danger: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --radius: 0.625rem;
}

.dark {
  --color-bg: #0b1020;
  --color-surface: #131a2c;
  --color-surface-2: #1b2438;
  --color-border: #273248;
  --color-text: #e6edf6;
  --color-text-muted: #94a3b8;
  --color-brand: #2dd4bf;
  --color-brand-fg: #06231f;
  --color-surface-brand: #0e1426;
}

html { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
```

- [ ] **Step 2: Add the Inter variable woff2**

Download `Inter-variable.woff2` (Inter v4, OFL) into `packages/ui/src/styles/fonts/`. (If offline, fall back: remove `@font-face` and use the system stack in `html { font-family: ... }`.)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/styles
git commit -m "feat(ui): semantic design tokens + Inter font"
```

### Task 2: Map tokens into each app's Tailwind theme

**Files:**
- Modify: `apps/staff/src/index.css`, `apps/admin/src/index.css`, `apps/portal/src/index.css`

- [ ] **Step 1: Update staff `index.css` to import tokens and map `@theme`**

Replace the brand block; keep the `bg-blue-*`→teal remap for migration. Add:

```css
@import "tailwindcss";
@import "../../../packages/ui/src/styles/theme.css";
@source "../../packages/ui/src/**/*.{ts,tsx}";

@variant dark (&:where(.dark, .dark *));

@theme {
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-surface-2: var(--color-surface-2);
  --color-border: var(--color-border);
  --color-text: var(--color-text);
  --color-muted: var(--color-text-muted);
  --color-brand: var(--color-brand);
  --color-brand-fg: var(--color-brand-fg);
  --color-danger: var(--color-danger);
  --color-success: var(--color-success);
  --color-warning: var(--color-warning);
  /* keep existing --color-blue-* teal remap block below */
}
```

- [ ] **Step 2: Mirror the same import/map into admin and portal `index.css`**

(Portal currently has a bare reset — convert it to `@import "tailwindcss"` + token import too.)

- [ ] **Step 3: Smoke-build to confirm Tailwind compiles tokens**

Run: `cd apps/staff; pnpm typecheck` then start `pnpm dev` and confirm a `bg-bg`/`text-muted` utility renders.
Expected: no Tailwind/PostCSS errors.

- [ ] **Step 4: Commit**

```bash
git add apps/*/src/index.css
git commit -m "feat: wire design tokens into all three apps"
```

### Task 3: ThemeProvider (TDD)

**Files:**
- Create: `packages/ui/src/theme/ThemeProvider.tsx`, `packages/ui/src/theme/useTheme.ts`
- Test: `packages/ui/src/theme/ThemeProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeProvider'

function Probe() {
  const { theme, setTheme, dir, setDir } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="dir">{dir}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setDir('rtl')}>rtl</button>
    </div>
  )
}

test('applies theme class and dir to document, persists', () => {
  localStorage.clear()
  render(<ThemeProvider><Probe /></ThemeProvider>)
  act(() => { screen.getByText('dark').click() })
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('erp-theme')).toBe('dark')
  act(() => { screen.getByText('rtl').click() })
  expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  expect(localStorage.getItem('erp-dir')).toBe('rtl')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui; pnpm test -- ThemeProvider`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `ThemeProvider.tsx` + `useTheme`**

```tsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Dir = 'ltr' | 'rtl'
interface ThemeCtx { theme: Theme; setTheme: (t: Theme) => void; dir: Dir; setDir: (d: Dir) => void }

const Ctx = createContext<ThemeCtx | null>(null)

function resolve(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('erp-theme') as Theme) ?? 'system')
  const [dir, setDirState] = useState<Dir>(() => (localStorage.getItem('erp-dir') as Dir) ?? 'ltr')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolve(theme) === 'dark')
  }, [theme])
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
  }, [dir])

  const setTheme = useCallback((t: Theme) => { localStorage.setItem('erp-theme', t); setThemeState(t) }, [])
  const setDir = useCallback((d: Dir) => { localStorage.setItem('erp-dir', d); setDirState(d) }, [])

  return <Ctx.Provider value={{ theme, setTheme, dir, setDir }}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui; pnpm test -- ThemeProvider`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/theme
git commit -m "feat(ui): ThemeProvider with persisted theme + direction"
```

### Task 4: `cn` helper + icon re-exports

**Files:**
- Modify: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/icons.ts`

- [ ] **Step 1: Ensure `cn` merges with tailwind-merge**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
```

- [ ] **Step 2: Create curated lucide re-exports**

```ts
export {
  Users, FileText, ShoppingCart, ReceiptText, Wallet, Undo2, ShieldCheck,
  LayoutDashboard, ChevronRight, ChevronLeft, ChevronDown, Menu, X, Bell,
  Sun, Moon, Monitor, Languages, LogOut, Settings, User, Plus, Search,
  ArrowLeft, ArrowRight, Inbox, AlertCircle, Check,
} from 'lucide-react'
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/lib/utils.ts packages/ui/src/icons.ts
git commit -m "feat(ui): cn helper + curated lucide icon re-exports"
```

### Task 5: Button (TDD)

**Files:**
- Create: `packages/ui/src/components/Button.tsx`
- Test: `packages/ui/src/components/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders variant + size classes and disables while loading', () => {
  const { rerender } = render(<Button variant="danger" size="sm">Go</Button>)
  const btn = screen.getByRole('button', { name: 'Go' })
  expect(btn.className).toContain('bg-danger')
  rerender(<Button loading>Go</Button>)
  expect(screen.getByRole('button')).toBeDisabled()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui; pnpm test -- Button`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `Button.tsx` with cva**

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-brand-fg hover:opacity-90',
        secondary: 'bg-surface-2 text-text hover:bg-border',
        outline: 'border border-border text-text hover:bg-surface-2',
        ghost: 'text-text hover:bg-surface-2',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  loading?: boolean
}

export function Button({ className, variant, size, loading, disabled, children, ...rest }: ButtonProps) {
  return (
    <button className={cn(button({ variant, size }), className)} disabled={disabled || loading} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui; pnpm test -- Button`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/Button.*
git commit -m "feat(ui): Button component with cva variants"
```

### Task 6: Badge + StatusBadge (TDD)

**Files:**
- Create: `packages/ui/src/components/Badge.tsx`, `packages/ui/src/components/StatusBadge.tsx`
- Modify: `packages/ui/src/components/sales/SalesStatusBadge.tsx`, `packages/ui/src/components/zatca/ZatcaStatusBadge.tsx`
- Test: `packages/ui/src/components/StatusBadge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

test('maps semantic tone to color classes', () => {
  render(<StatusBadge tone="success">Paid</StatusBadge>)
  expect(screen.getByText('Paid').className).toContain('text-success')
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd packages/ui; pnpm test -- StatusBadge`

- [ ] **Step 3: Implement `Badge.tsx` + `StatusBadge.tsx`**

```tsx
// Badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'
const badge = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: { tone: {
    neutral: 'bg-surface-2 text-muted',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-brand/10 text-brand',
  } }, defaultVariants: { tone: 'neutral' },
})
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}
export function Badge({ className, tone, ...rest }: BadgeProps) {
  return <span className={cn(badge({ tone }), className)} {...rest} />
}
export { badge }
```

```tsx
// StatusBadge.tsx — Badge alias used by domain badges
export { Badge as StatusBadge } from './Badge'
export type { BadgeProps as StatusBadgeProps } from './Badge'
```

- [ ] **Step 4: Refactor SalesStatusBadge + ZatcaStatusBadge to map their statuses to `tone` and render `Badge`**

(Open each file, replace its inline color logic with a `status → tone` map feeding `<Badge tone={tone}>`.)

- [ ] **Step 5: Run tests — expect PASS** (`pnpm test -- StatusBadge` and existing zatca badge test)

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/Badge.tsx packages/ui/src/components/StatusBadge.tsx packages/ui/src/components/sales/SalesStatusBadge.tsx packages/ui/src/components/zatca/ZatcaStatusBadge.tsx
git commit -m "feat(ui): Badge + StatusBadge, refactor domain badges onto it"
```

### Task 7: Form controls + FormField (TDD on FormField)

**Files:**
- Create: `packages/ui/src/components/form/{Input,Textarea,Select,Label,FormField}.tsx`
- Modify: `packages/ui/src/components/PasswordInput.tsx` (build on `Input`)
- Test: `packages/ui/src/components/form/FormField.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'
import { Input } from './Input'

test('renders label, hint, and error; marks invalid', () => {
  render(<FormField label="Email" error="Required"><Input /></FormField>)
  expect(screen.getByText('Email')).toBeInTheDocument()
  expect(screen.getByText('Required').className).toContain('text-danger')
})
```

- [ ] **Step 2: Run test — expect FAIL** (`cd packages/ui; pnpm test -- FormField`)

- [ ] **Step 3: Implement controls**

`Input.tsx` (and `Textarea`/`Select` mirroring it):

```tsx
import { cn } from '../../lib/utils'
export const Input = ({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn('h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50', className)} {...p} />
)
```

`Label.tsx`:

```tsx
import { cn } from '../../lib/utils'
export const Label = ({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1 block text-sm font-medium text-text', className)} {...p} />
)
```

`FormField.tsx`:

```tsx
import { Label } from './Label'
export function FormField({ label, hint, error, children }: {
  label?: string; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Refactor `PasswordInput` to wrap `Input` with a show/hide toggle (lucide Eye).**

- [ ] **Step 5: Run test — expect PASS.**

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/form packages/ui/src/components/PasswordInput.tsx
git commit -m "feat(ui): form controls + FormField with error/hint states"
```

### Task 8: Card, StatCard, Skeleton

**Files:**
- Create: `packages/ui/src/components/Card.tsx`, `packages/ui/src/components/StatCard.tsx`, `packages/ui/src/components/Skeleton.tsx`
- Modify: `packages/ui/src/components/DataCard.tsx` (re-export `StatCard` for back-compat or refactor callers)

- [ ] **Step 1: Implement `Card.tsx`**

```tsx
import { cn } from '../lib/utils'
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-xl border border-border bg-surface shadow-sm', className)} {...p} />
)
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-5', className)} {...p} />
)
```

- [ ] **Step 2: Implement `StatCard.tsx` (icon + label + value + trend)**

```tsx
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { Card } from './Card'
export function StatCard({ icon: Icon, label, value, trend }: {
  icon?: LucideIcon; label: string; value: string | number
  trend?: { value: number; label: string }
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && <span className="rounded-lg bg-brand/10 p-2 text-brand"><Icon className="h-4 w-4" /></span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-text">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </Card>
  )
}
```

- [ ] **Step 3: Implement `Skeleton.tsx`**

```tsx
import { cn } from '../lib/utils'
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-surface-2', className)} />
)
```

- [ ] **Step 4: Make `DataCard` delegate to `StatCard`** (keep export so existing callers still compile).

- [ ] **Step 5: Typecheck + commit**

Run: `cd packages/ui; pnpm typecheck`

```bash
git add packages/ui/src/components/Card.tsx packages/ui/src/components/StatCard.tsx packages/ui/src/components/Skeleton.tsx packages/ui/src/components/DataCard.tsx
git commit -m "feat(ui): Card, StatCard, Skeleton; DataCard delegates to StatCard"
```

### Task 9: ThemeToggle, DirectionToggle, ProfileMenu

**Files:**
- Create: `packages/ui/src/components/ThemeToggle.tsx`, `components/DirectionToggle.tsx`, `components/ProfileMenu.tsx`

- [ ] **Step 1: Implement `ThemeToggle`** — cycles light→dark→system using `useTheme`, shows `Sun`/`Moon`/`Monitor`.

```tsx
import { useTheme } from '../theme/ThemeProvider'
import { Sun, Moon, Monitor } from '../icons'
const order = ['light', 'dark', 'system'] as const
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor
  const next = order[(order.indexOf(theme as typeof order[number]) + 1) % order.length]
  return (
    <button aria-label={`Theme: ${theme}`} onClick={() => setTheme(next)}
      className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text transition-colors">
      <Icon className="h-4 w-4" />
    </button>
  )
}
```

- [ ] **Step 2: Implement `DirectionToggle`** — toggles `ltr`/`rtl` via `useTheme`, shows `Languages` icon.

- [ ] **Step 3: Implement `ProfileMenu`** — avatar (initials) + name + role; click opens a dropdown (Profile / Settings / Sign out). Use logical-property classes (`end-0`, `ms-*`). Close on outside-click (`useEffect` + ref).

- [ ] **Step 4: Typecheck + commit**

```bash
git add packages/ui/src/components/ThemeToggle.tsx packages/ui/src/components/DirectionToggle.tsx packages/ui/src/components/ProfileMenu.tsx
git commit -m "feat(ui): theme toggle, direction toggle, profile menu"
```

### Task 10: Table primitives + Pagination

**Files:**
- Create: `packages/ui/src/components/table/Table.tsx`, `table/Pagination.tsx`

- [ ] **Step 1: Implement `Table.tsx`** — `Table` (wraps in `overflow-x-auto rounded-xl border border-border`), `THead`, `TR` (hover), `TH` (`text-start`, muted), `TD`, `TableEmpty` (colspan + EmptyState).

```tsx
import { cn } from '../../lib/utils'
export const Table = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-border bg-surface">
    <table className={cn('w-full text-sm', className)}>{children}</table>
  </div>
)
export const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="border-b border-border bg-surface-2 text-muted">{children}</thead>
)
export const TR = ({ children, ...p }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-b border-border last:border-0 hover:bg-surface-2/60" {...p}>{children}</tr>
)
export const TH = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <th className={cn('px-4 py-3 text-start font-medium', className)}>{children}</th>
)
export const TD = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <td className={cn('px-4 py-3 text-text', className)}>{children}</td>
)
```

- [ ] **Step 2: Implement `Pagination.tsx`** — prev/next + "Page X of Y — N items", uses `Button variant="outline" size="sm"` and logical chevrons.

- [ ] **Step 3: Typecheck + commit**

```bash
git add packages/ui/src/components/table
git commit -m "feat(ui): Table primitives + Pagination"
```

### Task 11: Refine AppShell / Sidebar / TopBar / PageHeader / EmptyState

**Files:**
- Modify: `packages/ui/src/components/AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `PageHeader.tsx`, `EmptyState.tsx`

- [ ] **Step 1: `AppShell`** — theme-aware (`bg-bg`), responsive: fixed sidebar rail on `lg+`, off-canvas drawer below `lg` (state + overlay + `Menu` button passed to TopBar via render or context). Content wrapper `min-w-0`, padding scales (`p-4 sm:p-6`), max-width cap on ultra-wide (`mx-auto max-w-[1600px]`). Use logical properties throughout.

- [ ] **Step 2: `Sidebar`** — accept grouped `NavItem[]` with lucide icon components; branded header (Logo); section labels; active state via exact/prefix match (`text-brand bg-brand/15`); collapsed mode shows icon + tooltip. Logical props (`ps-*`, `start-*`).

- [ ] **Step 3: `TopBar`** — slots: left = breadcrumb/title + mobile menu button; right = `ThemeToggle`, `DirectionToggle`, optional `Bell`, `ProfileMenu`. Condense on small screens.

- [ ] **Step 4: `PageHeader`** — add optional `backTo`/`onBack` (renders `ArrowLeft` + label), make breadcrumbs real links, theme-aware text.

- [ ] **Step 5: `EmptyState`** — accept a lucide icon prop; theme-aware colors.

- [ ] **Step 6: Update `index.ts` exports** for every new/renamed export (ThemeProvider, useTheme, Button, Badge, StatusBadge, Input, Textarea, Select, Label, FormField, Card, CardBody, StatCard, Skeleton, Table family, Pagination, ThemeToggle, DirectionToggle, ProfileMenu, icons).

- [ ] **Step 7: Typecheck the whole workspace**

Run: `pnpm -w typecheck` (or `pnpm typecheck`)
Expected: green.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src
git commit -m "feat(ui): responsive theme/RTL-aware shell, sidebar, topbar, page header, empty state"
```

---

## Phase 2 — Staff app migration

### Task 12: Wrap staff in ThemeProvider + migrate AppLayout

**Files:**
- Modify: `apps/staff/src/main.tsx`, `apps/staff/src/components/AppLayout.tsx`

- [ ] **Step 1: Wrap `RouterProvider` in `ThemeProvider`** in `main.tsx`.

- [ ] **Step 2: Rewrite `AppLayout`** — replace emoji `NAV_SECTIONS` icons with lucide components (`Users`, `FileText`, `ShoppingCart`, `ReceiptText`, `Wallet`, `Undo2`, `ShieldCheck`); pass grouped items to refined `Sidebar`; wire `TopBar` with `ProfileMenu` (user name + org + role), `ThemeToggle`, `DirectionToggle`, and the mobile drawer toggle.

- [ ] **Step 3: Typecheck + run dev; screenshot dashboard shell in light/dark, LTR/RTL, mobile+desktop.**

Run: `cd apps/staff; pnpm typecheck; pnpm dev` then `node _shot.mjs`.

- [ ] **Step 4: Commit**

```bash
git add apps/staff/src/main.tsx apps/staff/src/components/AppLayout.tsx
git commit -m "feat(staff): themed, responsive app shell with lucide nav + profile menu"
```

### Task 13: Rebuild DashboardPage

**Files:**
- Modify: `apps/staff/src/pages/DashboardPage.tsx`

- [ ] **Step 1: Rebuild** — top row of `StatCard`s (use existing `useInvoiceSummary` data where available; otherwise show graceful "—" placeholders), a "Quick actions" `Button` row, and module cards using lucide icons + `Card` (no emoji). Use responsive grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

- [ ] **Step 2: Typecheck + screenshot (light/dark, LTR/RTL, 4 widths).**

- [ ] **Step 3: Commit**

```bash
git add apps/staff/src/pages/DashboardPage.tsx
git commit -m "feat(staff): rebuild dashboard with KPI stat cards + quick actions"
```

### Task 14: Migrate sales list pages

**Files:**
- Modify: `apps/staff/src/pages/sales/{InvoicesPage,QuotationsPage,SalesOrdersPage,PaymentsPage,CreditNotesPage,ContactsPage}.tsx`

- [ ] **Step 1: For each list page** — replace inline `<table>` with `Table/THead/TR/TH/TD`; replace inline buttons with `Button`; replace inline `<select>` filters with `Select`; KPI strip uses `StatCard`; loading uses `Skeleton` rows; empty uses refined `EmptyState`; pagination uses `Pagination`. Keep data hooks unchanged.

- [ ] **Step 2: Typecheck after each file; screenshot `InvoicesPage` as the representative (light/dark, mobile/desktop).**

- [ ] **Step 3: Commit (one commit per 1-2 pages)**

```bash
git add apps/staff/src/pages/sales
git commit -m "feat(staff): migrate sales list pages to design system"
```

### Task 15: Migrate sales create/form pages + ZATCA

**Files:**
- Modify: `apps/staff/src/pages/sales/{CreateContactPage,CreateQuotationPage,CreateInvoicePage,CreatePaymentPage,CreateCreditNotePage}.tsx`, `apps/staff/src/pages/zatca/OnboardingPage.tsx`

- [ ] **Step 1: For each form page** — wrap fields in `FormField` + `Input`/`Select`/`Textarea`; submit/cancel use `Button`; add `PageHeader` back button (`backTo` parent list); responsive single→two-column layout (`grid md:grid-cols-2`).

- [ ] **Step 2: Typecheck; screenshot `CreateInvoicePage` (light/dark, mobile/desktop).**

- [ ] **Step 3: Commit**

```bash
git add apps/staff/src/pages/sales apps/staff/src/pages/zatca
git commit -m "feat(staff): migrate create/edit + ZATCA pages to design system"
```

### Task 16: Staff auth pages polish + verification pass

**Files:**
- Modify: `apps/staff/src/pages/{LoginPage,RegisterPage,ForgotPasswordPage,ResetPasswordPage,VerifyEmailPage,OrgPickerPage}.tsx` (controls → `Button`/`FormField`; AuthLayout already good — keep, make theme/RTL aware)

- [ ] **Step 1: Swap inline inputs/buttons for `FormField`+`Input`+`Button`; ensure dark-mode + RTL render correctly on the form panel.**

- [ ] **Step 2: Run unit tests + typecheck + lint for staff**

Run: `cd apps/staff; pnpm test; pnpm typecheck; pnpm lint`
Expected: green.

- [ ] **Step 3: Full staff screenshot set (login, dashboard, invoices, create-invoice) in light/dark + LTR/RTL + mobile/desktop; share for review.**

- [ ] **Step 4: Commit**

```bash
git add apps/staff/src/pages
git commit -m "feat(staff): polish auth pages, theme/RTL aware"
```

---

## Phase 3 — Admin app migration

### Task 17: Admin shell + dashboard + login

**Files:**
- Modify: `apps/admin/src/main.tsx`, `apps/admin/src/pages/AdminDashboard.tsx`, `apps/admin/src/pages/AdminLogin.tsx`

- [ ] **Step 1: Wrap admin `main.tsx` in `ThemeProvider`.**

- [ ] **Step 2: Rebuild `AdminDashboard`** with `StatCard`s + `Card`s + lucide icons + responsive grid; reuse `AppShell`/`Sidebar`/`TopBar` if admin has navigation, otherwise a themed header.

- [ ] **Step 3: Migrate `AdminLogin`** controls to `FormField`/`Input`/`Button` (mirror staff auth styling).

- [ ] **Step 4: Typecheck + screenshot (light/dark).**

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src
git commit -m "feat(admin): migrate dashboard + login to design system"
```

---

## Phase 4 — Portal app migration

### Task 18: Portal invoice + error pages

**Files:**
- Modify: `apps/portal/src/main.tsx`, `apps/portal/src/index.css`, `apps/portal/src/pages/InvoicePage.tsx`, `apps/portal/src/pages/ErrorPage.tsx`

- [ ] **Step 1: Convert portal `index.css`** to `@import "tailwindcss"` + token import (Task 2 already covers, verify).

- [ ] **Step 2: Wrap portal `main.tsx` in `ThemeProvider`** (default light; public-facing).

- [ ] **Step 3: Polish `InvoicePage`** (public invoice view) with `Card`, `Table`, `Badge`, brand header, responsive; polish `ErrorPage` with `EmptyState` + lucide.

- [ ] **Step 4: Typecheck + screenshot (light/dark, mobile/desktop).**

- [ ] **Step 5: Commit**

```bash
git add apps/portal/src
git commit -m "feat(portal): polish public invoice + error pages"
```

---

## Phase 5 — Final verification

### Task 19: Workspace-wide green + final screenshots

- [ ] **Step 1: Run the full workspace gates**

Run: `pnpm -w typecheck; pnpm -w lint; pnpm -w test`
Expected: all green. Fix any fallout.

- [ ] **Step 2: Capture the final screenshot set** for all three apps (light/dark, LTR/RTL, mobile ~375 / tablet ~768 / laptop ~1280 / wide ~1680) into `docs/superpowers/_after/`; compare against `_before/`.

- [ ] **Step 3: Commit screenshots + update README if UI docs reference the old look**

```bash
git add docs/superpowers/_after
git commit -m "chore: final design-system screenshots"
```

- [ ] **Step 4: Summary for review** — present before/after, list any deferred items (Arabic translations, charts, Radix overlays) for a follow-up.

---

## Self-Review

**Spec coverage:**
- Shared system in `@erp/ui` → Tasks 1–11. ✓
- Modern SaaS aesthetic → tokens (1), components (5–11), dashboards (13,17). ✓
- Light/dark toggle → Tasks 1,2,3,9,12. ✓
- RTL support → tokens/logical props (2,10,11), DirectionToggle (9), provider (3). ✓
- Easy back-navigation → PageHeader back button + breadcrumb links (11,15). ✓
- Identifiable profile + sidebar → ProfileMenu (9), Sidebar refine (11,12). ✓
- Responsive fit at every size → AppShell drawer + grids + table scroll (11,13,14); verified at 4 widths (16,19). ✓
- All three apps → Phase 2 (staff), 3 (admin), 4 (portal). ✓
- Verification via live screenshots → Tasks 0,12,13,14,16,17,18,19. ✓

**Placeholder scan:** Code steps contain real implementations. Intentionally-deferred items (Arabic strings, charts, Radix) are listed as non-goals, not in-plan placeholders. KPI "—" placeholders are a deliberate graceful-degradation behavior, not a plan gap.

**Type consistency:** `cn`, `useTheme`, `Button`/`ButtonProps`, `Badge`/`BadgeProps`, `StatusBadge` (alias of Badge), `FormField`/`Input`/`Label`, `StatCard`, `Table/THead/TR/TH/TD`, `Pagination`, `ThemeToggle`/`DirectionToggle`/`ProfileMenu` are defined before use and exported in Task 11 Step 6.
