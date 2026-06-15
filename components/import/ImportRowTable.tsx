'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ImportRowStatus } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  IMPORT_TARGET_FIELDS,
  LOW_CONFIDENCE_THRESHOLD,
  type ConfidenceScores,
  type MappedWineData,
} from '@/lib/import/constants'
import type { DuplicateMatch } from '@/lib/import/duplicate-detector'
import type { ImportRow } from '@prisma/client'

export interface ImportRowWithDuplicate extends ImportRow {
  duplicateOf: DuplicateMatch | null
}

interface RowState {
  id: string
  mappedData: MappedWineData
  confidenceScores: ConfidenceScores
  status: ImportRowStatus
  duplicateOf: DuplicateMatch | null
}

function toRowState(row: ImportRowWithDuplicate): RowState {
  return {
    id: row.id,
    mappedData: (row.mappedData ?? {}) as unknown as MappedWineData,
    confidenceScores: (row.confidenceScores ?? {}) as unknown as ConfidenceScores,
    status: row.status,
    duplicateOf: row.duplicateOf,
  }
}

interface ImportRowTableProps {
  importId: string
  rows: ImportRowWithDuplicate[]
}

export function ImportRowTable({ importId, rows }: ImportRowTableProps) {
  const router = useRouter()
  const [rowsState, setRowsState] = useState<RowState[]>(() => rows.map(toRowState))
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incompleteRowIds, setIncompleteRowIds] = useState<Set<string>>(new Set())
  const autoSkipped = useRef(false)

  // Possible duplicates default to "Skip" the first time the review loads.
  useEffect(() => {
    if (autoSkipped.current) return
    autoSkipped.current = true

    const toSkip = rowsState.filter((row) => row.duplicateOf && row.status === 'PENDING')
    if (toSkip.length === 0) return

    setRowsState((prev) =>
      prev.map((row) => (row.duplicateOf && row.status === 'PENDING' ? { ...row, status: 'SKIPPED' } : row))
    )

    for (const row of toSkip) {
      void patchRow(row.id, { status: 'SKIPPED' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function patchRow(rowId: string, body: { mappedData?: MappedWineData; status?: ImportRowStatus }) {
    await fetch(`/api/import/${importId}/rows/${rowId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  function updateField(rowId: string, key: keyof MappedWineData, rawValue: string) {
    const field = IMPORT_TARGET_FIELDS.find((f) => f.key === key)

    setRowsState((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row
        const mappedData: MappedWineData = { ...row.mappedData }

        if (rawValue === '') {
          delete mappedData[key]
        } else if (field?.type === 'number') {
          const num = Number(rawValue)
          if (!Number.isNaN(num)) {
            ;(mappedData as Record<string, unknown>)[key] = num
          }
        } else {
          ;(mappedData as Record<string, unknown>)[key] = rawValue
        }

        return { ...row, mappedData }
      })
    )
  }

  function handleBlur(rowId: string) {
    const row = rowsState.find((r) => r.id === rowId)
    if (!row) return
    void patchRow(rowId, { mappedData: row.mappedData })
  }

  function handleStatusChange(rowId: string, status: ImportRowStatus) {
    setRowsState((prev) => prev.map((row) => (row.id === rowId ? { ...row, status } : row)))
    void patchRow(rowId, { status })
  }

  async function handleConfirm() {
    setConfirming(true)
    setError(null)
    setIncompleteRowIds(new Set())

    try {
      const res = await fetch(`/api/import/${importId}/confirm`, { method: 'POST' })
      const body = await res.json().catch(() => null)

      if (!res.ok) {
        if (Array.isArray(body?.rowIds)) {
          setIncompleteRowIds(new Set(body.rowIds))
        }
        throw new Error(body?.error || 'Could not confirm import')
      }

      router.push('/dashboard/cellar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm import')
      setConfirming(false)
    }
  }

  const includedCount = rowsState.filter((row) => row.status !== 'SKIPPED').length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg font-semibold text-foreground">Review your wines</h2>
        <p className="text-sm text-muted-foreground">
          Edit any fields that need correcting. Amber fields had low extraction confidence — please
          verify them. Possible duplicates default to Skip.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Include</TableHead>
              <TableHead>Match</TableHead>
              {IMPORT_TARGET_FIELDS.map((field) => (
                <TableHead key={field.key} className="whitespace-nowrap">
                  {field.label}
                  {field.required ? ' *' : ''}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowsState.map((row) => (
              <TableRow
                key={row.id}
                className={cn(incompleteRowIds.has(row.id) && 'bg-destructive/5')}
              >
                <TableCell className="sticky left-0 bg-card">
                  <Select
                    value={row.status === 'SKIPPED' ? 'SKIPPED' : 'PENDING'}
                    onValueChange={(value) => handleStatusChange(row.id, value as ImportRowStatus)}
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Include</SelectItem>
                      <SelectItem value="SKIPPED">Skip</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {row.duplicateOf ? (
                    <Badge variant="secondary" className="whitespace-nowrap">
                      Possible duplicate of {row.duplicateOf.label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">New</span>
                  )}
                </TableCell>
                {IMPORT_TARGET_FIELDS.map((field) => {
                  const value = row.mappedData[field.key]
                  const confidence = row.confidenceScores[field.key]
                  const lowConfidence = confidence !== undefined && confidence < LOW_CONFIDENCE_THRESHOLD

                  const input = (
                    <Input
                      value={value === undefined || value === null ? '' : String(value)}
                      onChange={(e) => updateField(row.id, field.key, e.target.value)}
                      onBlur={() => handleBlur(row.id)}
                      className={cn(
                        'h-8 w-32 text-xs',
                        lowConfidence && 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                      )}
                    />
                  )

                  return (
                    <TableCell key={field.key}>
                      {lowConfidence ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{input}</TooltipTrigger>
                          <TooltipContent>Low confidence — please verify</TooltipContent>
                        </Tooltip>
                      ) : (
                        input
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleConfirm} disabled={confirming || includedCount === 0}>
          {confirming ? 'Importing...' : `Confirm Import (${includedCount})`}
        </Button>
        <p className="text-sm text-muted-foreground">
          {rowsState.length - includedCount} row{rowsState.length - includedCount === 1 ? '' : 's'} skipped
        </p>
      </div>
    </div>
  )
}
