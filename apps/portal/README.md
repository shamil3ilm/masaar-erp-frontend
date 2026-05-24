# @erp/portal — Vendor Invoice Portal

Public-facing portal for vendors and customers to view invoices shared with them via a tokenized link. No login form — authentication is embedded in the URL.

**Dev server:** `http://localhost:5181`

## How It Works

Access is via a URL with two required query parameters:

```
http://localhost:5181/?invoice=<invoice-id>&token=<signed-token>
```

Visiting without these params shows the "Invalid invoice link" error state. This is expected behavior.

### States

| State | Trigger | Display |
|-------|---------|---------|
| `invalid` | Missing `?invoice` or `?token` params | Error card |
| `loading` | Fetching from API | Spinner |
| `error` | API returned 401/403/404 | Error card with specific message |
| `ready` | Invoice loaded | `InvoiceViewer` |

### InvoiceViewer

A print-optimized invoice document:
- **Header:** Seller logo/name + download and print buttons
- **Invoice meta:** Number, date, due date, status badge
- **Bill-to block:** Buyer name and details
- **Line items table:** Description, qty, unit price, total
- **Totals:** Subtotal, VAT, grand total
- **Footer:** Seller contact details

Print-specific CSS hides the header actions and removes margins.

## Design System

The portal imports `packages/ui/src/styles/preset.css` (tokens, Inter font, Tailwind) and then defines its own print-focused document layout in `index.css` using the same CSS variables (`var(--surface)`, `var(--brand)`, `var(--text-muted)`, etc.).

Does **not** use `@erp/ui` React components — the invoice document is plain HTML/CSS for maximum print fidelity.

## Commands

```bash
# Development (port 5181)
pnpm --filter @erp/portal dev

# Production build
pnpm --filter @erp/portal build

# Type check
pnpm --filter @erp/portal typecheck
```

## Environment Variables

Create `apps/portal/.env.local`:

```env
VITE_API_URL=http://erp-backend.test/api/v1
```
