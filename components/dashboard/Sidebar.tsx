'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wine,
  Upload,
  BarChart3,
  Search,
  Notebook,
  BookmarkCheck,
  Bell,
  Sparkles,
  Settings,
} from 'lucide-react'
import { NavItem } from './NavItem'

const NAV_ITEMS = [
  { href: '/dashboard/cellar', label: 'Cellar', icon: Wine },
  { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  { href: '/dashboard/import', label: 'Import', icon: Upload },
  { href: '/dashboard/butler', label: 'Butler', icon: Search },
  { href: '/dashboard/tastings', label: 'Tastings', icon: Notebook },
  { href: '/dashboard/watchlist', label: 'Watch List', icon: BookmarkCheck },
  { href: '/dashboard/alerts', label: 'Alerts', icon: Bell },
  {
    href: '/dashboard/assistant',
    label: 'Assistant',
    icon: Sparkles,
    soon: true,
    tooltip: 'AI sommelier chat for your collection (Phase 4)',
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    soon: true,
    tooltip: 'Account and preferences (Phase 6)',
  },
]

export function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="flex h-full flex-col gap-1 p-4">
      <Link href="/dashboard" className="mb-4 flex flex-col items-center px-3">
        <Image
          src="/wine-butler-ai-logo.png"
          alt="Wine Butler AI"
          width={140}
          height={140}
          className="mb-1"
          priority
        />
        <span className="text-xs text-muted-foreground">Wine Butler AI</span>
      </Link>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.label}
          {...item}
          active={pathname.startsWith(item.href)}
          badgeCount={item.href === '/dashboard/alerts' ? alertCount : undefined}
        />
      ))}
    </nav>
  )
}
