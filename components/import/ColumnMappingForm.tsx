'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HEADER_ALIASES, IMPORT_TARGET_FIELDS, type MappedWineData } from '@/lib/import/constants'

const SKIP_VALUE = '__skip__'
const SPLIT_REGION_VALUE = '__split_region__'

interface ColumnMappingFormProps {
  importId: string
  headers: string[]
  sampleRow: Record<string, string>
  suggestion: Record<string, string | null>
  regionSplitColumns?: Record<string, string>
}

const TARGET_KEYS = new Set<string>(IMPORT_TARGET_FIELDS.map((field) => field.key))

function guessTargetKey(header: string): string | null {
  const normalized = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  const match = IMPORT_TARGET_FIELDS.find(
    (field) =>
      field.key.toLowerCase() === normalized ||
      field.label.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
  )
  return match?.key ?? null
}

function aliasTargetKey(header: string): { matched: boolean; key: string | null } {
  const normalized = header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  if (normalized in HEADER_ALIASES) {
    return { matched: true, key: HEADER_ALIASES[normalized] }
  }
  return { matched: false, key: null }
}

function buildInitialMapping(
  headers: string[],
  suggestion: Record<string, string | null>,
  regionSplitColumns?: Record<string, string>
) {
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const alias = aliasTargetKey(header)
    if (alias.matched) {
      mapping[header] = alias.key ?? SKIP_VALUE
      continue
    }
    const suggested = suggestion[header]
    const key = suggested && TARGET_KEYS.has(suggested) ? suggested : guessTargetKey(header)
    mapping[header] = key ?? SKIP_VALUE
  }
  return mapping
}

export function ColumnMappingForm({ importId, headers, sampleRow, suggestion, regionSplitColumns = {} }: ColumnMappingFormProps) {
  const router = useRouter()
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    buildInitialMapping(headers, suggestion, regionSplitColumns)
  )
  const [splitSelections, setSplitSelections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const header of Object.keys(regionSplitColumns)) {
      initial[header] = true
    }
    return initial
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApply() {
    setSubmitting(true)
    setError(null)

    const payload: Record<string, keyof MappedWineData | null> = {}
    const splits: Record<string, string> = {}
    for (const [header, value] of Object.entries(mapping)) {
      if (value === SPLIT_REGION_VALUE || (value === 'region' && splitSelections[header])) {
        payload[header] = 'region'
        splits[header] = regionSplitColumns[header] || ', '
      } else {
        payload[header] = value === SKIP_VALUE ? null : (value as keyof MappedWineData)
      }
    }

    try {
      const res = await fetch(`/api/import/${importId}/mapping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapping: payload, regionSplits: splits }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Could not apply mapping')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply mapping')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg font-semibold text-foreground">Map your columns</h2>
        <p className="text-sm text-muted-foreground">
          We matched your spreadsheet columns to wine fields. Review and adjust before continuing.
          Fields marked with * are required.
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Column</TableHead>
              <TableHead>Sample Value</TableHead>
              <TableHead>Maps To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header) => {
              const canSplit = header in regionSplitColumns
              const isSplitting = canSplit && splitSelections[header]

              return (
                <TableRow key={header}>
                  <TableCell className="font-medium text-foreground">{header}</TableCell>
                  <TableCell className="text-muted-foreground">{sampleRow[header] || '—'}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Select
                        value={mapping[header]}
                        onValueChange={(value) => setMapping((prev) => ({ ...prev, [header]: value }))}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SKIP_VALUE}>Don&apos;t import</SelectItem>
                          {IMPORT_TARGET_FIELDS.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                              {field.required ? ' *' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {canSplit && mapping[header] === 'region' && (
                        <label className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={isSplitting}
                            onCheckedChange={(checked) =>
                              setSplitSelections((prev) => ({ ...prev, [header]: checked === true }))
                            }
                          />
                          <span className="text-muted-foreground">
                            Split into Region + Sub-Region
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            Detected
                          </Badge>
                        </label>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleApply} disabled={submitting}>
        {submitting ? 'Applying...' : 'Apply Mapping'}
      </Button>
    </div>
  )
}
