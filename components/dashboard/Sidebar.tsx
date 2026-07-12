'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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

const IMAGE_MIN_HEIGHT = 120
const IMAGE_MAX_HEIGHT = 500

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
  const containerRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const [showImage, setShowImage] = useState(true)

  useEffect(() => {
    const container = containerRef.current
    const top = topRef.current
    if (!container || !top) return

    const measure = () => {
      const remaining = container.clientHeight - top.clientHeight
      setShowImage(remaining >= IMAGE_MIN_HEIGHT)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(top)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <div ref={topRef} className="flex flex-shrink-0 flex-col p-4">
        <Link href="/dashboard" className="mb-4 flex flex-shrink-0 flex-col items-center px-3">
          <Image
            src="/wine-butler-ai-logo.png"
            alt="Wine Butler AI"
            width={230}
            height={230}
            className="mb-1"
            priority
          />
          <span className="text-xs text-muted-foreground">Wine Butler AI</span>
        </Link>
        <nav className="flex flex-shrink-0 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              {...item}
              active={pathname.startsWith(item.href)}
              badgeCount={item.href === '/dashboard/alerts' ? alertCount : undefined}
            />
          ))}
        </nav>
      </div>
      {showImage && (
        <div
          className="relative w-full flex-1 overflow-hidden rounded-t-lg"
          style={{ minHeight: IMAGE_MIN_HEIGHT, maxHeight: IMAGE_MAX_HEIGHT }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, width: '200%', height: '100%' }}>
            <Image
              src="/images/grapes-vineyard.png"
              alt="Vineyard grapes"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
