import type { ReactNode } from 'react'
import { Logo } from '@erp/ui'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel (hidden on mobile) ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[400px] xl:w-[460px] flex-col bg-[#1a1f36] px-12 py-14 relative overflow-hidden shrink-0">
        {/* Decorative rings — bottom-left corner */}
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full border border-[#14b8a6]/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[320px] h-[320px] rounded-full border border-[#14b8a6]/15" />
        <div className="pointer-events-none absolute -bottom-8  -left-8  w-[180px] h-[180px] rounded-full border border-[#14b8a6]/20" />
        {/* Filled glow */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-[#14b8a6]/5 blur-3xl" />

        {/* Logo */}
        <Logo size={44} showName nameClassName="font-semibold text-white tracking-tight" />

        {/* Tagline — anchored to bottom */}
        <div className="mt-auto space-y-3 relative z-10">
          <p className="text-2xl font-semibold text-white leading-snug">
            Enterprise ERP for<br />GCC &amp; India
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
            Sales, compliance, accounting, and HR — built for ZATCA e-invoicing, VAT, and regional regulations.
          </p>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10">
          <Logo size={40} showName />
        </div>

        <div className="w-full max-w-[360px]">
          {children}
        </div>
      </div>
    </div>
  )
}
