import { redirect } from 'next/navigation'
import { Wine } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { getDashboardSummary, getRecentWines, getRecentConsumptionLogs } from '@/lib/wines/queries'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { RecentWines } from '@/components/dashboard/RecentWines'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const summary = await getDashboardSummary(user.id)

  if (summary.totalBottles === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-foreground">
          Welcome to your cellar
        </h1>
        <EmptyState
          icon={Wine}
          title="Your cellar is empty"
          description="Add your first bottle to start tracking your collection, or import your existing cellar."
          action={{ label: 'Add a wine', href: '/dashboard/cellar/new' }}
          secondaryAction={{ label: 'Import your collection' }}
        />
      </div>
    )
  }

  const [recentWines, recentConsumption] = await Promise.all([
    getRecentWines(user.id, 5),
    getRecentConsumptionLogs(user.id, 5),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Bottles" value={summary.totalBottles.toLocaleString()} />
        <KpiCard
          label="Total Cost Basis"
          value={formatCurrency(summary.totalCostBasis)}
        />
        <KpiCard
          label="Total Current Value"
          value={formatCurrency(summary.totalCurrentValue)}
        />
        <KpiCard
          label="Net Gain/Loss"
          value={
            <span className={summary.netGainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}>
              {formatCurrency(summary.netGainLoss)}
              {summary.netGainLossPercent !== null && (
                <span className="ml-1 text-sm font-normal">
                  ({formatPercent(summary.netGainLossPercent)})
                </span>
              )}
            </span>
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Bottles at Peak"
          value={summary.bottlesAtPeak.toLocaleString()}
          caption="Updates once enrichment runs (Phase 5)"
        />
      </div>
      {recentWines.length > 0 && <RecentWines wines={recentWines} />}
      {recentConsumption.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently Enjoyed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentConsumption.map((log) => (
                <li key={log.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {log.wine.producer} {log.wine.wineName}
                    {log.wine.vintage ? ` (${log.wine.vintage})` : ''}
                  </span>
                  <span className="text-muted-foreground">
                    {log.occasion ? `${log.occasion} — ` : ''}
                    {formatDate(log.consumedDate)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
