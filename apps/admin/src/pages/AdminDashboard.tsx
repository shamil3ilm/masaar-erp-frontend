import {
  PageHeader, StatCard, Button, StatusBadge,
  Table, THead, TBody, TR, TH, TD, Pagination,
  Users, FileText, Clock, CheckCircle2, AlertTriangle, RotateCcw, Info,
  Plus, Filter, Download, ArrowRight,
} from '@erp/ui'
import type { ComponentType } from 'react'

type IconType = ComponentType<{ size?: number | string; className?: string }>

// ── Mock data (reference screen — mirrors the Masaar UI template sample) ────────

const KPIS: Array<{
  label: string
  value: string
  subtitle: string
  icon: IconType
  iconColor?: string
  trend: { value: number; label: string }
}> = [
  { label: 'Active users',    value: '8,420',  subtitle: 'vs. previous period', icon: Users,        trend: { value: 12, label: '' } },
  { label: 'Open items',      value: '312',    subtitle: 'vs. previous period', icon: FileText,     iconColor: 'bg-info-subtle text-info',       trend: { value: 3.1, label: '' } },
  { label: 'Avg. response',   value: '2h 14m', subtitle: 'vs. previous period', icon: Clock,        iconColor: 'bg-warning-subtle text-warning', trend: { value: -1.4, label: '' } },
  { label: 'Completion rate', value: '94.2%',  subtitle: 'vs. previous period', icon: CheckCircle2, iconColor: 'bg-success-subtle text-success', trend: { value: 0.6, label: '' } },
]

const ACTIVITY: Array<{ icon: IconType; tone: string; text: string; when: string }> = [
  { icon: CheckCircle2,  tone: 'bg-success-subtle text-success',           text: 'Record A-1024 marked complete', when: '2m' },
  { icon: Info,          tone: 'bg-info-subtle text-info',                 text: 'New comment on A-1023',          when: '14m' },
  { icon: Users,         tone: 'bg-brand-subtle text-brand-dark dark:text-brand', text: 'User name joined the workspace', when: '1h' },
  { icon: AlertTriangle, tone: 'bg-warning-subtle text-warning',           text: 'Threshold reached on Item 7',    when: '3h' },
  { icon: RotateCcw,     tone: 'bg-surface-2 text-muted',                  text: 'Record A-1010 archived',         when: '1d' },
]

const ROWS: Array<{ id: string; cat: string; status: string; owner: string; when: string }> = [
  { id: 'A-1024', cat: 'Category 1', status: 'Active',  owner: 'AB', when: '2m ago' },
  { id: 'A-1023', cat: 'Category 2', status: 'Pending', owner: 'CD', when: '1h ago' },
  { id: 'A-1022', cat: 'Category 1', status: 'Review',  owner: 'EF', when: 'Yesterday' },
  { id: 'A-1021', cat: 'Category 3', status: 'Blocked', owner: 'GH', when: '3d ago' },
  { id: 'A-1020', cat: 'Category 2', status: 'Active',  owner: 'IJ', when: '4d ago' },
]

export function AdminDashboard() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
      <PageHeader
          title="Dashboard"
          breadcrumbs={[{ label: 'Workspace', href: '#' }, { label: 'Dashboard' }]}
          actions={
            <>
              <Button variant="secondary" size="sm" iconLeft={<Filter size={14} />}>Filter</Button>
              <Button variant="secondary" size="sm" iconLeft={<Download size={14} />}>Export</Button>
              <Button size="sm" iconLeft={<Plus size={14} />}>New item</Button>
            </>
          }
        />

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {KPIS.map((k) => (
            <StatCard
              key={k.label}
              label={k.label}
              value={k.value}
              subtitle={k.subtitle}
              icon={k.icon}
              iconColor={k.iconColor}
              trend={k.trend}
            />
          ))}
        </div>

        {/* Chart + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 mb-5">
          {/* Activity chart */}
          <div className="rounded-[var(--radius)] border border-border bg-surface shadow-sm">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Activity</div>
                <div className="text-xs text-muted mt-0.5">Items created &amp; resolved · last 14 days</div>
              </div>
              <div className="inline-flex rounded-lg border border-border bg-surface text-[11px] font-medium p-0.5">
                <button className="px-2 py-1 rounded-md bg-surface-2 text-text">14d</button>
                <button className="px-2 py-1 rounded-md text-muted">30d</button>
                <button className="px-2 py-1 rounded-md text-muted">90d</button>
              </div>
            </div>
            <div className="p-4 text-brand">
              <svg viewBox="0 0 480 160" className="w-full h-40" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="currentColor" strokeOpacity="0.1">
                  <line x1="0" y1="40" x2="480" y2="40" />
                  <line x1="0" y1="80" x2="480" y2="80" />
                  <line x1="0" y1="120" x2="480" y2="120" />
                </g>
                <path d="M0,120 C40,110 60,80 100,90 C140,100 160,60 200,55 C240,50 270,90 310,80 C350,70 380,40 420,50 C450,55 470,40 480,30 L480,160 L0,160 Z" fill="url(#chartFill)" />
                <path d="M0,120 C40,110 60,80 100,90 C140,100 160,60 200,55 C240,50 270,90 310,80 C350,70 380,40 420,50 C450,55 470,40 480,30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M0,130 C40,125 70,115 110,118 C160,120 200,95 240,100 C280,105 310,120 350,115 C390,110 430,95 480,90" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
              </svg>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand" /> Created</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-faint" /> Resolved</span>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="rounded-[var(--radius)] border border-border bg-surface shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <div className="text-sm font-semibold">Recent activity</div>
              <div className="text-xs text-muted mt-0.5">Updates from your workspace</div>
            </div>
            <ul className="divide-y divide-border flex-1">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="px-4 py-2.5 flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex w-7 h-7 rounded-md items-center justify-center ${a.tone}`}>
                    <a.icon size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] truncate">{a.text}</div>
                    <div className="text-[11px] text-faint">{a.when} ago</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2.5 border-t border-border text-end">
              <a className="text-xs font-medium text-brand-dark dark:text-brand hover:underline inline-flex items-center gap-1" href="#">
                View all <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="rounded-[var(--radius)] border border-border bg-surface shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-sm font-semibold">Items</div>
              <div className="text-xs text-muted mt-0.5">All records across the workspace</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" iconLeft={<Filter size={14} />}>View</Button>
              <Button size="sm" iconLeft={<Plus size={14} />}>New</Button>
            </div>
          </div>
          <Table className="min-w-[720px]">
            <THead>
              <TR>
                <TH>Item</TH>
                <TH>Status</TH>
                <TH>Owner</TH>
                <TH align="end">Updated</TH>
              </TR>
            </THead>
            <TBody>
              {ROWS.map((r) => (
                <TR key={r.id} className="hover:bg-surface-2/50">
                  <TD>
                    <div className="font-medium">Record {r.id}</div>
                    <div className="text-xs text-muted">Item · {r.cat}</div>
                  </TD>
                  <TD>
                    <StatusBadge status={r.status} />
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-brand-subtle text-brand-dark dark:text-brand text-[10px] font-semibold inline-flex items-center justify-center">
                        {r.owner}
                      </span>
                      Customer name
                    </div>
                  </TD>
                  <TD align="end" muted>{r.when}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        <div className="border-t border-border px-2">
          <Pagination currentPage={1} lastPage={26} total={126} perPage={5} onPageChange={() => {}} />
        </div>
      </div>
    </div>
  )
}
