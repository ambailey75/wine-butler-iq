import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/current-user'
import {
  getInsightsSummary,
  getInsightsByRegion,
  getInsightsByVarietal,
  getInsightsByStyle,
  getInsightsByVintageDecade,
} from '@/lib/wines/insights'
import { InsightsView } from '@/components/insights/InsightsView'

export default async function InsightsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const [
    summary,
    summaryAll,
    byRegion,
    byRegionAll,
    byVarietal,
    byVarietalAll,
    byStyle,
    byStyleAll,
    byDecade,
    byDecadeAll,
  ] = await Promise.all([
    getInsightsSummary(user.id, false),
    getInsightsSummary(user.id, true),
    getInsightsByRegion(user.id, false),
    getInsightsByRegion(user.id, true),
    getInsightsByVarietal(user.id, false),
    getInsightsByVarietal(user.id, true),
    getInsightsByStyle(user.id, false),
    getInsightsByStyle(user.id, true),
    getInsightsByVintageDecade(user.id, false),
    getInsightsByVintageDecade(user.id, true),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Collection Insights</h1>
      <InsightsView
        summary={summary}
        summaryAll={summaryAll}
        byRegion={byRegion}
        byRegionAll={byRegionAll}
        byVarietal={byVarietal}
        byVarietalAll={byVarietalAll}
        byStyle={byStyle}
        byStyleAll={byStyleAll}
        byDecade={byDecade}
        byDecadeAll={byDecadeAll}
      />
    </div>
  )
}
