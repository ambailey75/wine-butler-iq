'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { KpiCard } from '@/components/dashboard/KpiCard'
import type { InsightsBreakdown, InsightsSummary } from '@/lib/wines/insights'
import { BreakdownChart } from './BreakdownChart'
import { BreakdownTable } from './BreakdownTable'

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

interface InsightsViewProps {
  summary: InsightsSummary
  summaryAll: InsightsSummary
  byRegion: InsightsBreakdown[]
  byRegionAll: InsightsBreakdown[]
  byVarietal: InsightsBreakdown[]
  byVarietalAll: InsightsBreakdown[]
  byStyle: InsightsBreakdown[]
  byStyleAll: InsightsBreakdown[]
  byDecade: InsightsBreakdown[]
  byDecadeAll: InsightsBreakdown[]
}

export function InsightsView({
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
}: InsightsViewProps) {
  const [includeConsumed, setIncludeConsumed] = useState(false)

  const s = includeConsumed ? summaryAll : summary
  const breakdowns = {
    region: includeConsumed ? byRegionAll : byRegion,
    varietal: includeConsumed ? byVarietalAll : byVarietal,
    style: includeConsumed ? byStyleAll : byStyle,
    decade: includeConsumed ? byDecadeAll : byDecade,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total Bottles" value={s.totalBottles.toLocaleString()} />
        <KpiCard label="Total Cost" value={formatCurrency(s.totalCost)} />
        <KpiCard label="Est. Value" value={formatCurrency(s.totalValue)} />
        <KpiCard
          label="Gain/Loss"
          value={
            <span className={s.gainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}>
              {formatCurrency(s.gainLoss)}
              {s.gainLossPercent !== null && (
                <span className="ml-1 text-sm font-normal">
                  ({formatPercent(s.gainLossPercent)})
                </span>
              )}
            </span>
          }
        />
        <KpiCard
          label="Avg Rating"
          value={s.avgRating !== null ? s.avgRating.toFixed(1) : '--'}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={includeConsumed}
            onCheckedChange={(checked) => setIncludeConsumed(checked === true)}
          />
          Include consumed wines
        </label>
      </div>

      <Tabs defaultValue="region">
        <TabsList>
          <TabsTrigger value="region">By Region</TabsTrigger>
          <TabsTrigger value="varietal">By Varietal</TabsTrigger>
          <TabsTrigger value="style">By Style</TabsTrigger>
          <TabsTrigger value="decade">By Vintage</TabsTrigger>
        </TabsList>

        {(['region', 'varietal', 'style', 'decade'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-6">
            <BreakdownChart data={breakdowns[tab]} />
            <BreakdownTable data={breakdowns[tab]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
