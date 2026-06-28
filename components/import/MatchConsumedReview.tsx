'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Confidence = 'exact' | 'fuzzy' | 'none'
type RowAction = 'consume' | 'add_new' | 'skip'

interface MatchRow {
  importRowId: string
  importRowLabel: string
  matchedWineId: string | null
  matchedWineName: string | null
  matchedWineRemaining: number | null
  confidence: Confidence
}

interface CellarOption {
  id: string
  label: string
  remaining: number
}

interface RowState {
  importRowId: string
  action: RowAction
  matchedWineId: string | null
}

const CONFIDENCE_BADGE: Record<Confidence, { label: string; className: string }> = {
  exact: { label: 'Exact Match', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  fuzzy: { label: 'Fuzzy Match', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  none: { label: 'No Match', className: 'bg-red-100 text-red-800 border-red-200' },
}

export function MatchConsumedReview({ importId }: { importId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [cellarOptions, setCellarOptions] = useState<CellarOption[]>([])
  const [rowStates, setRowStates] = useState<RowState[]>([])
  const [consumedDate, setConsumedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/import/${importId}/match`)
      .then((r) => r.json())
      .then((data) => {
        const loadedMatches: MatchRow[] = data.matches ?? []
        setMatches(loadedMatches)
        setCellarOptions(data.cellarOptions ?? [])
        setRowStates(
          loadedMatches.map((m) => ({
            importRowId: m.importRowId,
            // exact + fuzzy default to Include; none defaults to Skip
            action:
              m.confidence === 'exact' || m.confidence === 'fuzzy'
                ? ('consume' as RowAction)
                : ('skip' as RowAction),
            matchedWineId: m.matchedWineId,
          }))
        )
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load match candidates')
        setLoading(false)
      })
  }, [importId])

  function updateRow(importRowId: string, patch: Partial<RowState>) {
    setRowStates((prev) =>
      prev.map((r) => (r.importRowId === importRowId ? { ...r, ...patch } : r))
    )
  }

  function bulkSetAction(include: boolean) {
    if (!include) {
      setRowStates((prev) => prev.map((r) => ({ ...r, action: 'skip' })))
      return
    }
    setRowStates((prev) =>
      prev.map((r) => {
        const match = matches.find((m) => m.importRowId === r.importRowId)
        return {
          ...r,
          action: match?.confidence !== 'none' ? 'consume' : 'add_new',
        }
      })
    )
  }

  async function handleConfirm() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/import/${importId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchActions: rowStates, consumedDate }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Confirm failed')
      }
      router.push('/dashboard/cellar')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finding matches in your cellar...
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  const includeCount = rowStates.filter((r) => r.action !== 'skip').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {matches.length} rows matched against your cellar
          </p>
          <p className="text-xs text-muted-foreground">
            Exact and fuzzy matches default to Include. No-match rows default to Skip.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="consumed-date" className="text-xs text-muted-foreground whitespace-nowrap">
            Consumed date
          </label>
          <Input
            id="consumed-date"
            type="date"
            value={consumedDate}
            onChange={(e) => setConsumedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
        <span className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{includeCount}</span> of {matches.length} wines will be imported
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => bulkSetAction(true)}
            disabled={submitting}
          >
            Include All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => bulkSetAction(false)}
            disabled={submitting}
          >
            Skip All
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Include</span>
              </TableHead>
              <TableHead>Your Import Row</TableHead>
              <TableHead>Best Match in Cellar</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const rowState = rowStates.find((r) => r.importRowId === match.importRowId)
              if (!rowState) return null
              const included = rowState.action !== 'skip'
              const badge = CONFIDENCE_BADGE[match.confidence]

              return (
                <TableRow key={match.importRowId} className={included ? '' : 'opacity-50'}>
                  <TableCell>
                    <Checkbox
                      checked={included}
                      onCheckedChange={(checked) =>
                        updateRow(match.importRowId, {
                          action: checked
                            ? match.confidence !== 'none'
                              ? 'consume'
                              : 'add_new'
                            : 'skip',
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">{match.importRowLabel}</TableCell>
                  <TableCell>
                    {match.confidence === 'none' ? (
                      <span className="text-xs text-muted-foreground">No match found</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm">
                          {rowState.matchedWineId
                            ? cellarOptions.find((o) => o.id === rowState.matchedWineId)?.label ??
                              match.matchedWineName
                            : '—'}
                        </p>
                        {rowState.matchedWineId && (
                          <p className="text-xs text-muted-foreground">
                            {
                              (
                                cellarOptions.find((o) => o.id === rowState.matchedWineId) ??
                                { remaining: match.matchedWineRemaining }
                              ).remaining
                            }{' '}
                            remaining
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {included && (
                      <select
                        value={
                          rowState.action === 'consume'
                            ? `consume:${rowState.matchedWineId ?? ''}`
                            : rowState.action === 'add_new'
                              ? 'add_new'
                              : 'skip'
                        }
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === 'add_new') {
                            updateRow(match.importRowId, { action: 'add_new', matchedWineId: null })
                          } else if (val.startsWith('consume:')) {
                            const wineId = val.slice(8) || null
                            updateRow(match.importRowId, { action: 'consume', matchedWineId: wineId || rowState.matchedWineId })
                          }
                        }}
                        className="h-7 rounded border border-border bg-background px-2 text-xs"
                      >
                        {cellarOptions.map((opt) => (
                          <option key={opt.id} value={`consume:${opt.id}`}>
                            Mark consumed: {opt.label}
                          </option>
                        ))}
                        <option value="add_new">Add as new consumed record</option>
                      </select>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          {includeCount} of {matches.length} rows will be processed
        </p>
        <Button onClick={handleConfirm} disabled={submitting || includeCount === 0}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            `Confirm ${includeCount} Match${includeCount === 1 ? '' : 'es'}`
          )}
        </Button>
      </div>
    </div>
  )
}
