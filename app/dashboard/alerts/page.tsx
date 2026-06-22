import { redirect } from 'next/navigation'
import { Bell } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { AlertsList } from '@/components/alerts/AlertsList'

export default async function AlertsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const alerts = await prisma.cellarAlert.findMany({
    where: { userId: user.id },
    include: { wine: { select: { producer: true, wineName: true, vintage: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = alerts.filter((a) => !a.dismissedAt).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts yet"
          description="Alerts for drink windows and watch list reminders will appear here."
        />
      ) : (
        <AlertsList alerts={JSON.parse(JSON.stringify(alerts))} />
      )}
    </div>
  )
}
