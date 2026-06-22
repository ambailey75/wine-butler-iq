'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckCheck, Wine, BookmarkCheck, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AlertItem {
  id: string
  alertType: string
  message: string | null
  triggerDate: string
  createdAt: string
  dismissedAt: string | null
  wine: { producer: string; wineName: string; vintage: number | null } | null
}

const ALERT_CONFIG: Record<string, { label: string; icon: typeof Wine }> = {
  DRINK_WINDOW: { label: 'Drink Window', icon: Wine },
  WATCH_LIST_REMINDER: { label: 'Watch List', icon: BookmarkCheck },
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function AlertsList({ alerts }: { alerts: AlertItem[] }) {
  const router = useRouter()
  const [dismissing, setDismissing] = useState<Set<string>>(new Set())

  const hasUnread = alerts.some((a) => !a.dismissedAt)

  async function dismiss(id: string) {
    setDismissing((prev) => new Set(prev).add(id))
    await fetch(`/api/alerts/${id}/dismiss`, { method: 'POST' })
    router.refresh()
  }

  async function dismissAll() {
    await fetch('/api/alerts/dismiss-all', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={dismissAll}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Dismiss All
          </Button>
        </div>
      )}

      {alerts.map((alert) => {
        const config = ALERT_CONFIG[alert.alertType] || { label: alert.alertType, icon: Bell }
        const Icon = config.icon
        const isDismissed = !!alert.dismissedAt

        return (
          <Card key={alert.id} className={isDismissed ? 'opacity-60' : ''}>
            <CardContent className="flex items-start gap-3 p-4">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={isDismissed ? 'secondary' : 'default'} className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {alert.message ||
                    (alert.wine
                      ? `${alert.wine.producer} ${alert.wine.wineName}${alert.wine.vintage ? ` (${alert.wine.vintage})` : ''}`
                      : 'Alert')}
                </p>
              </div>
              {!isDismissed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => dismiss(alert.id)}
                  disabled={dismissing.has(alert.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
