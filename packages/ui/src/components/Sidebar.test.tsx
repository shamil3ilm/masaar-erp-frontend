import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sidebar, NavItem } from './Sidebar'

const items: NavItem[] = [
  { label: 'Dashboard', href: '/app/dashboard' },
  { label: 'Compliance', href: '/app/compliance', permission: 'compliance.view' },
  { label: 'Accounting', href: '/app/accounting', permission: 'accounting.view' },
]

describe('Sidebar', () => {
  it('shows all items when all permissions granted', () => {
    render(<Sidebar items={items} permissions={['compliance.view', 'accounting.view']} currentPath="/app/dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Compliance')).toBeInTheDocument()
    expect(screen.getByText('Accounting')).toBeInTheDocument()
  })

  it('hides items when permission missing', () => {
    render(<Sidebar items={items} permissions={['compliance.view']} currentPath="/app/dashboard" />)
    expect(screen.getByText('Compliance')).toBeInTheDocument()
    expect(screen.queryByText('Accounting')).not.toBeInTheDocument()
  })

  it('shows no-permission items regardless', () => {
    render(<Sidebar items={items} permissions={[]} currentPath="/app/dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
