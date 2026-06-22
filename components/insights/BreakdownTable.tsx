'use client'

import type { InsightsBreakdown } from '@/lib/wines/insights'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function BreakdownTable({ data }: { data: InsightsBreakdown[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data to display yet.
      </p>
    )
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Bottles</TableHead>
            <TableHead className="text-right">Est. Value</TableHead>
            <TableHead className="text-right">Avg Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-medium text-foreground">{row.label}</TableCell>
              <TableCell className="text-right">{row.bottles}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.estimatedValue)}</TableCell>
              <TableCell className="text-right">
                {row.avgRating !== null ? row.avgRating.toFixed(1) : '--'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
