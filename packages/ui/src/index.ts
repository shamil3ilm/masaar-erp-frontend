// Theme system
export { ThemeProvider, useTheme } from './components/ThemeProvider'
export { ThemeToggle } from './components/ThemeToggle'
export { DirectionToggle } from './components/DirectionToggle'

// Layout shell
export { AppShell } from './components/AppShell'
export { Sidebar } from './components/Sidebar'
export type { NavItem, NavSection } from './components/Sidebar'
export { TopBar } from './components/TopBar'
export { PageHeader } from './components/PageHeader'

// Base components
export { Logo } from './components/Logo'
export { LoadingSpinner } from './components/LoadingSpinner'
export { EmptyState } from './components/EmptyState'
export { ErrorBoundary } from './components/ErrorBoundary'
export { ConfirmDialog } from './components/ConfirmDialog'
export { PasswordInput } from './components/PasswordInput'

// Actions
export { Button, buttonVariants } from './components/Button'
export type { ButtonProps } from './components/Button'

// Form controls
export { Input } from './components/Input'
export { Textarea } from './components/Textarea'
export { Select } from './components/Select'
export { Label } from './components/Label'
export { FormField } from './components/FormField'

// Data display
export { Badge, StatusBadge, badgeVariants } from './components/Badge'
export type { BadgeProps } from './components/Badge'
export { Alert, alertVariants } from './components/Alert'
export type { AlertProps } from './components/Alert'
export { Card, CardHeader, CardBody, StatCard } from './components/Card'
export { DataCard } from './components/DataCard'
export { Table, THead, TBody, TR, TH, TD, TableEmpty, Pagination } from './components/Table'
export { Skeleton, SkeletonText, SkeletonCard, SkeletonTableRow } from './components/Skeleton'

// Domain badges (existing, now built on StatusBadge)
export { ZatcaStatusBadge } from './components/zatca/ZatcaStatusBadge'
export { SalesStatusBadge } from './components/sales/SalesStatusBadge'

// ZATCA module
export { ZatcaOnboardingWizard } from './components/zatca/ZatcaOnboardingWizard'
export type { RequestCcsidPayload } from './components/zatca/ZatcaOnboardingWizard'
export { ComplianceStatsCard } from './components/zatca/ComplianceStatsCard'

// Icons (curated lucide re-exports)
export {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Menu, X, ArrowLeft, ArrowRight, ExternalLink,
  Plus, Pencil, Trash2, Download, Upload, Copy, Check, RefreshCw,
  Search, Filter, MoreHorizontal, MoreVertical, Settings, LogOut, User,
  AlertCircle, AlertTriangle, CheckCircle2, Info, XCircle, Loader2,
  Sun, Moon, Monitor,
  LayoutDashboard, Users, FileText, ShoppingCart, Receipt, CreditCard,
  RotateCcw, Shield, Building2, Briefcase, BarChart3, Boxes, Truck,
  Wrench, Globe, Bell, Calendar, Clock, Mail, Phone, MapPin, Lock, Eye, EyeOff,
} from './components/icons'

// Utilities
export { cn } from './lib/utils'
