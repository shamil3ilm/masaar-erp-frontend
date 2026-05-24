// Screenshot helper for design-system review.
// Usage:
//   node _shot.mjs <label> [path] [--dark] [--rtl] [--widths=375,768,1280,1680]
// Examples:
//   node _shot.mjs before-dashboard /app/dashboard
//   node _shot.mjs dash-dark /app/dashboard --dark --widths=1280
// Logs in with the seeded admin, applies theme/dir via localStorage, and writes
// PNGs to ../../docs/superpowers/_shots/<label>-<width>[-dark][-rtl].png
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const label = args[0] ?? 'shot'
const routePath = args.find((a, i) => i >= 1 && !a.startsWith('--')) ?? '/app/dashboard'
const dark = args.includes('--dark')
const rtl = args.includes('--rtl')
const widthsArg = args.find((a) => a.startsWith('--widths='))
const widths = widthsArg ? widthsArg.replace('--widths=', '').split(',').map(Number) : [375, 768, 1280, 1680]

const BASE = process.env.APP_URL ?? 'http://localhost:5173'
const EMAIL = process.env.LOGIN_EMAIL ?? 'admin@admin.com'
const PASSWORD = process.env.LOGIN_PASSWORD ?? 'admin123'
const outDir = resolve(__dirname, '../../docs/superpowers/_shots')

async function run() {
  await mkdir(outDir, { recursive: true })
  const browser = await chromium.launch()
  try {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await ctx.newPage()

      // Seed theme/dir before app code runs.
      await ctx.addInitScript(
        ([t, d]) => {
          localStorage.setItem('erp-theme', t)
          localStorage.setItem('erp-dir', d)
        },
        [dark ? 'dark' : 'light', rtl ? 'rtl' : 'ltr'],
      )

      // Public route → no login needed.
      const isPublic = routePath.startsWith('/login') || routePath === '/' || routePath.startsWith('/register')
      if (!isPublic) {
        await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
        // Best-effort login; fields are matched loosely so it survives markup changes.
        const email = page.locator('input[type="email"], input[name="email"]').first()
        if (await email.count()) {
          await email.fill(EMAIL)
          await page.locator('input[type="password"]').first().fill(PASSWORD)
          await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first().click()
          await page.waitForLoadState('networkidle').catch(() => {})
          await page.waitForTimeout(800)
        }
      }

      await page.goto(`${BASE}${routePath}`, { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(600)

      const suffix = `${width}${dark ? '-dark' : ''}${rtl ? '-rtl' : ''}`
      const file = resolve(outDir, `${label}-${suffix}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log('wrote', file)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
