'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { InsightsBreakdown } from '@/lib/wines/insights'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function truncate(str: string, max: number) {
  return str.length > max ? `${str.slice(0, max)}...` : str
}

export function BreakdownChart({ data }: { data: InsightsBreakdown[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No data to display yet.
      </p>
    )
  }

  const chartData = data.slice(0, 15).map((d) => ({
    name: truncate(d.label, 18),
    bottles: d.bottles,
    value: d.estimatedValue,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis
          yAxisId="bottles"
          orientation="left"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          label={{ value: 'Bottles', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          yAxisId="value"
          orientation="right"
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          label={{ value: 'Est. Value', angle: 90, position: 'insideRight', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: 12,
          }}
          formatter={(value, name) =>
            name === 'value' ? [formatCurrency(value as number), 'Est. Value'] : [value, 'Bottles']
          }
        />
        <Bar yAxisId="bottles" dataKey="bottles" fill="#6B212E" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="value" dataKey="value" fill="#B89600" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
