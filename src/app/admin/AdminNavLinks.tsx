'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, RefreshCw, CheckSquare, FileText, AlertTriangle } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Escrow Deals', href: '/admin/transactions', icon: RefreshCw },
  { label: 'Pending Listings', href: '/admin/listings', icon: CheckSquare },
  { label: 'KYC Docs', href: '/admin/verifications', icon: FileText },
  { label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
]

export default function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
