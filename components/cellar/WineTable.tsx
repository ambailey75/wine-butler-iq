'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Check, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import type { SerializedWine } from '@/lib/wines/queries'
import { getEstimatedValue } from '@/lib/wines/queries'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pagination } from '@/components/ui/pagination'
import { WineFilters } from './WineFilters'
import { DeleteWineDialog } from './DeleteWineDialog'

const STYLE_OPTIONS = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const multiSelectFilter: FilterFn<SerializedWine> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const value = row.getValue<string | null>(columnId)
  return value !== null && filterValue.includes(value)
}

const exactYearFilter: FilterFn<SerializedWine> = (row, _columnId, filterValue) => {
  if (filterValue === undefined || filterValue === null) return true
  const value = row.getValue<number | null>('vintage')
  return value === filterValue
}

const minRatingFilter: FilterFn<SerializedWine> = (row, _columnId, filterValue) => {
  if (filterValue === undefined) return true
  const value = row.getValue<number | null>('rating')
  if (value === null || value === undefined) return false
  return value >= (filterValue as number)
}

const globalSearchFilter: FilterFn<SerializedWine> = (row, _columnId, filterValue) => {
  const search = String(filterValue).toLowerCase().trim()
  if (!search) return true
  const w = row.original
  return [w.producer, w.wineName, w.region, w.country, w.vineyard, w.varietal, w.vendor, w.notes, w.storageLocation, w.state, w.subRegion]
    .filter((v): v is string => typeof v === 'string')
    .some((v) => v.toLowerCase().includes(search))
}

// ─── Inline Editing Primitives ──────────────────────────────────────────────

interface EditCellState {
  wineId: string
  field: string
}

function useInlineEdit(wines: SerializedWine[], setWines: React.Dispatch<React.SetStateAction<SerializedWine[]>>) {
  const [editing, setEditing] = useState<EditCellState | null>(null)
  const [savedCell, setSavedCell] = useState<string | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout>>()

  const startEdit = useCallback((wineId: string, field: string) => {
    setEditing({ wineId, field })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditing(null)
  }, [])

  const saveField = useCallback(async (wineId: string, updates: Record<string, unknown>) => {
    setWines((prev) =>
      prev.map((w) => (w.id === wineId ? { ...w, ...updates } : w))
    )
    setEditing(null)

    try {
      const res = await fetch(`/api/wines/${wineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error()

      const cellKey = `${wineId}-${Object.keys(updates)[0]}`
      setSavedCell(cellKey)
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSavedCell(null), 1200)
    } catch {
      // Revert is complex — for now the optimistic update stays.
      // The next page load will show the server state.
    }
  }, [setWines])

  return { editing, savedCell, startEdit, cancelEdit, saveField }
}

// ─── Cell Components ────────────────────────────────────────────────────────

function TextEditCell({
  value,
  wineId,
  field,
  editing,
  savedCell,
  onStart,
  onSave,
  onCancel,
  placeholder,
  className,
}: {
  value: string | null
  wineId: string
  field: string
  editing: EditCellState | null
  savedCell: string | null
  onStart: (id: string, f: string) => void
  onSave: (id: string, updates: Record<string, unknown>) => void
  onCancel: () => void
  placeholder?: string
  className?: string
}) {
  const isEditing = editing?.wineId === wineId && editing?.field === field
  const isSaved = savedCell === `${wineId}-${field}`
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        defaultValue={value ?? ''}
        className="h-7 min-w-[80px] text-xs"
        onBlur={(e) => {
          const v = e.target.value.trim()
          onSave(wineId, { [field]: v || null })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value.trim()
            onSave(wineId, { [field]: v || null })
          }
          if (e.key === 'Escape') onCancel()
        }}
      />
    )
  }

  return (
    <div
      onClick={() => onStart(wineId, field)}
      className={`cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-accent ${className ?? ''}`}
    >
      {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
      {value || <span className="text-muted-foreground">{placeholder ?? '—'}</span>}
    </div>
  )
}

function NumberEditCell({
  value,
  wineId,
  field,
  editing,
  savedCell,
  onStart,
  onSave,
  onCancel,
  format,
}: {
  value: number | null
  wineId: string
  field: string
  editing: EditCellState | null
  savedCell: string | null
  onStart: (id: string, f: string) => void
  onSave: (id: string, updates: Record<string, unknown>) => void
  onCancel: () => void
  format?: (v: number) => string
}) {
  const isEditing = editing?.wineId === wineId && editing?.field === field
  const isSaved = savedCell === `${wineId}-${field}`
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        defaultValue={value ?? ''}
        className="h-7 w-20 text-xs"
        onBlur={(e) => {
          const v = e.target.value.trim()
          onSave(wineId, { [field]: v ? Number(v) : null })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value.trim()
            onSave(wineId, { [field]: v ? Number(v) : null })
          }
          if (e.key === 'Escape') onCancel()
        }}
      />
    )
  }

  return (
    <div
      onClick={() => onStart(wineId, field)}
      className="cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-accent"
    >
      {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
      {value !== null ? (format ? format(value) : value) : <span className="text-muted-foreground">—</span>}
    </div>
  )
}

function StyleSelectCell({
  value,
  wineId,
  editing,
  savedCell,
  onStart,
  onSave,
  onCancel,
}: {
  value: string | null
  wineId: string
  editing: EditCellState | null
  savedCell: string | null
  onStart: (id: string, f: string) => void
  onSave: (id: string, updates: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const isEditing = editing?.wineId === wineId && editing?.field === 'style'
  const isSaved = savedCell === `${wineId}-style`
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (isEditing) selectRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        defaultValue={value ?? ''}
        className="h-7 rounded border border-border bg-background px-1 text-xs"
        onBlur={(e) => {
          onSave(wineId, { style: e.target.value || null })
        }}
        onChange={(e) => {
          onSave(wineId, { style: e.target.value || null })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      >
        <option value="">—</option>
        {STYLE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    )
  }

  return (
    <div
      onClick={() => onStart(wineId, 'style')}
      className="cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-accent"
    >
      {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
      {value || <span className="text-muted-foreground">—</span>}
    </div>
  )
}

function DualFieldCell({
  topValue,
  bottomValue,
  wineId,
  topField,
  bottomField,
  topLabel,
  bottomLabel,
  editing,
  savedCell,
  onStart,
  onSave,
  onCancel,
}: {
  topValue: string | null
  bottomValue: string | null
  wineId: string
  topField: string
  bottomField: string
  topLabel: string
  bottomLabel: string
  editing: EditCellState | null
  savedCell: string | null
  onStart: (id: string, f: string) => void
  onSave: (id: string, updates: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const dualField = `${topField}_${bottomField}`
  const isEditing = editing?.wineId === wineId && editing?.field === dualField
  const isSaved = savedCell === `${wineId}-${topField}` || savedCell === `${wineId}-${bottomField}`
  const topRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) topRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <div className="flex flex-col gap-1">
        <Input
          ref={topRef}
          defaultValue={topValue ?? ''}
          placeholder={topLabel}
          className="h-6 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel()
          }}
        />
        <Input
          defaultValue={bottomValue ?? ''}
          placeholder={bottomLabel}
          className="h-6 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Escape') onCancel()
            if (e.key === 'Enter') {
              const topVal = topRef.current?.value.trim() || null
              const botVal = (e.target as HTMLInputElement).value.trim() || null
              onSave(wineId, { [topField]: topVal, [bottomField]: botVal })
            }
          }}
          onBlur={(e) => {
            const topVal = topRef.current?.value.trim() || null
            const botVal = e.target.value.trim() || null
            onSave(wineId, { [topField]: topVal, [bottomField]: botVal })
          }}
        />
      </div>
    )
  }

  return (
    <div
      onClick={() => onStart(wineId, dualField)}
      className="cursor-pointer rounded px-1 py-0.5 hover:bg-accent"
    >
      {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
      <div className="text-xs leading-tight">
        {topValue || <span className="text-muted-foreground">—</span>}
      </div>
      {bottomValue && (
        <div className="text-[10px] leading-tight text-muted-foreground">{bottomValue}</div>
      )}
    </div>
  )
}

function NotesEditCell({
  value,
  wineId,
  field,
  editing,
  savedCell,
  onStart,
  onSave,
  onCancel,
}: {
  value: string | null
  wineId: string
  field: string
  editing: EditCellState | null
  savedCell: string | null
  onStart: (id: string, f: string) => void
  onSave: (id: string, updates: Record<string, unknown>) => void
  onCancel: () => void
}) {
  const isEditing = editing?.wineId === wineId && editing?.field === field
  const isSaved = savedCell === `${wineId}-${field}`
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={value ?? ''}
        className="min-h-[60px] w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        onBlur={(e) => {
          onSave(wineId, { [field]: e.target.value.trim() || null })
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
    )
  }

  const truncated = value && value.length > 40 ? `${value.slice(0, 40)}...` : value

  return (
    <div
      onClick={() => onStart(wineId, field)}
      title={value ?? undefined}
      className="max-w-[120px] cursor-pointer truncate rounded px-1 py-0.5 text-xs hover:bg-accent"
    >
      {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
      {truncated || <span className="text-muted-foreground">—</span>}
    </div>
  )
}

// ─── Row Actions ────────────────────────────────────────────────────────────

function WineRowActions({ wine, onDelete }: { wine: SerializedWine; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/cellar/${wine.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Main Table ─────────────────────────────────────────────────────────────

type CellarView = 'in-cellar' | 'all' | 'consumed'

export function WineTable({ wines: initialWines }: { wines: SerializedWine[] }) {
  const [wines, setWines] = useState(initialWines)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SerializedWine | null>(null)
  const [cellarView, setCellarView] = useState<CellarView>('in-cellar')

  useEffect(() => { setWines(initialWines) }, [initialWines])

  const { editing, savedCell, startEdit, cancelEdit, saveField } = useInlineEdit(wines, setWines)

  const filteredWines = useMemo(() => {
    if (cellarView === 'all') return wines
    if (cellarView === 'consumed') return wines.filter((w) => w.isFullyConsumed)
    return wines.filter((w) => !w.isFullyConsumed)
  }, [wines, cellarView])

  const columns = useMemo<ColumnDef<SerializedWine>[]>(
    () => [
      {
        accessorKey: 'producer',
        header: ({ column }) => <SortHeader column={column} label="Producer" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.producer}
            wineId={row.original.id} field="producer"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
            className="font-medium"
          />
        ),
      },
      {
        accessorKey: 'wineName',
        header: ({ column }) => <SortHeader column={column} label="Wine" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.wineName}
            wineId={row.original.id} field="wineName"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'vintage',
        header: ({ column }) => <SortHeader column={column} label="Yr" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.vintage}
            wineId={row.original.id} field="vintage"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
        filterFn: exactYearFilter,
      },
      {
        id: 'countryState',
        accessorFn: (row) => row.country,
        header: ({ column }) => <SortHeader column={column} label="Country" />,
        cell: ({ row }) => (
          <DualFieldCell
            topValue={row.original.country}
            bottomValue={row.original.state}
            wineId={row.original.id}
            topField="country" bottomField="state"
            topLabel="Country" bottomLabel="State"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
        filterFn: multiSelectFilter,
      },
      {
        id: 'regionSubRegion',
        accessorFn: (row) => row.region,
        header: ({ column }) => <SortHeader column={column} label="Region" />,
        cell: ({ row }) => (
          <DualFieldCell
            topValue={row.original.region}
            bottomValue={row.original.subRegion}
            wineId={row.original.id}
            topField="region" bottomField="subRegion"
            topLabel="Region" bottomLabel="Sub-Region"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
        filterFn: multiSelectFilter,
      },
      {
        id: 'subRegion',
        accessorKey: 'subRegion',
        filterFn: multiSelectFilter,
        enableSorting: false,
        header: () => null,
        cell: () => null,
      },
      {
        accessorKey: 'varietal',
        header: ({ column }) => <SortHeader column={column} label="Varietal" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.varietal}
            wineId={row.original.id} field="varietal"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
        filterFn: multiSelectFilter,
      },
      {
        accessorKey: 'vineyard',
        header: ({ column }) => <SortHeader column={column} label="Vineyard" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.vineyard}
            wineId={row.original.id} field="vineyard"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => <SortHeader column={column} label="Qty" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.quantity}
            wineId={row.original.id} field="quantity"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'style',
        header: ({ column }) => <SortHeader column={column} label="Style" />,
        cell: ({ row }) => (
          <StyleSelectCell
            value={row.original.style}
            wineId={row.original.id}
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'purchasePrice',
        header: ({ column }) => <SortHeader column={column} label="Price" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.purchasePrice}
            wineId={row.original.id} field="purchasePrice"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
            format={formatCurrency}
          />
        ),
      },
      {
        accessorKey: 'rating',
        header: ({ column }) => <SortHeader column={column} label="Score" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.rating}
            wineId={row.original.id} field="rating"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
        filterFn: minRatingFilter,
      },
      {
        id: 'estValue',
        accessorFn: (row) => {
          const est = getEstimatedValue(row.currentEstValue, row.purchasePrice)
          return est.perBottle
        },
        header: ({ column }) => <SortHeader column={column} label="Est. Val" />,
        cell: ({ row }) => {
          const w = row.original
          const est = getEstimatedValue(w.currentEstValue, w.purchasePrice)
          const isEditing = editing?.wineId === w.id && editing?.field === 'currentEstValue'
          const isSaved = savedCell === `${w.id}-currentEstValue`

          if (isEditing) {
            return (
              <NumberEditCell
                value={w.currentEstValue}
                wineId={w.id} field="currentEstValue"
                editing={editing} savedCell={savedCell}
                onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
                format={formatCurrency}
              />
            )
          }

          return (
            <div
              onClick={() => startEdit(w.id, 'currentEstValue')}
              className="cursor-pointer rounded px-1 py-0.5 text-xs hover:bg-accent"
            >
              {isSaved && <Check className="mr-1 inline h-3 w-3 text-emerald-500" />}
              {est.perBottle !== null ? (
                est.isApproximate ? (
                  <span className="text-muted-foreground" title="Based on purchase price">≈{formatCurrency(est.perBottle)}</span>
                ) : (
                  formatCurrency(est.perBottle)
                )
              ) : (
                <span className="text-muted-foreground">No data</span>
              )}
            </div>
          )
        },
      },
      {
        id: 'totalCost',
        accessorFn: (row) =>
          row.totalCostOverride ?? (row.purchasePrice !== null ? row.purchasePrice * row.quantity : null),
        header: ({ column }) => <SortHeader column={column} label="Total Cost" />,
        cell: ({ row }) => {
          const w = row.original
          const val = w.totalCostOverride ?? (w.purchasePrice !== null ? w.purchasePrice * w.quantity : null)
          return (
            <div className="bg-muted/30 px-1 py-0.5 text-xs">
              {val !== null ? formatCurrency(val) : <span className="text-muted-foreground">—</span>}
            </div>
          )
        },
      },
      {
        id: 'totalEstValue',
        accessorFn: (row) => {
          if (row.totalValueOverride !== null) return row.totalValueOverride
          const est = getEstimatedValue(row.currentEstValue, row.purchasePrice)
          return est.perBottle !== null ? est.perBottle * row.quantity : null
        },
        header: ({ column }) => <SortHeader column={column} label="Total Val" />,
        cell: ({ row }) => {
          const w = row.original
          if (w.totalValueOverride !== null) {
            return <div className="bg-muted/30 px-1 py-0.5 text-xs">{formatCurrency(w.totalValueOverride)}</div>
          }
          const est = getEstimatedValue(w.currentEstValue, w.purchasePrice)
          if (est.perBottle === null) {
            return <div className="bg-muted/30 px-1 py-0.5 text-xs text-muted-foreground">No data</div>
          }
          const total = est.perBottle * w.quantity
          return (
            <div className="bg-muted/30 px-1 py-0.5 text-xs">
              {est.isApproximate ? <span className="text-muted-foreground">≈{formatCurrency(total)}</span> : formatCurrency(total)}
            </div>
          )
        },
      },
      {
        accessorKey: 'drinkWindowStart',
        header: ({ column }) => <SortHeader column={column} label="Drink Start" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.drinkWindowStart}
            wineId={row.original.id} field="drinkWindowStart"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'drinkWindowEnd',
        header: ({ column }) => <SortHeader column={column} label="Drink Until" />,
        cell: ({ row }) => (
          <NumberEditCell
            value={row.original.drinkWindowEnd}
            wineId={row.original.id} field="drinkWindowEnd"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'format',
        header: ({ column }) => <SortHeader column={column} label="Format" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.format}
            wineId={row.original.id} field="format"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'storageLocation',
        header: ({ column }) => <SortHeader column={column} label="Location" />,
        cell: ({ row }) => (
          <TextEditCell
            value={row.original.storageLocation}
            wineId={row.original.id} field="storageLocation"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <NotesEditCell
            value={row.original.notes}
            wineId={row.original.id} field="notes"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'tastingNotes',
        header: 'Tasting',
        cell: ({ row }) => (
          <NotesEditCell
            value={row.original.tastingNotes}
            wineId={row.original.id} field="tastingNotes"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        accessorKey: 'pairingNotes',
        header: 'Pairing',
        cell: ({ row }) => (
          <NotesEditCell
            value={row.original.pairingNotes}
            wineId={row.original.id} field="pairingNotes"
            editing={editing} savedCell={savedCell}
            onStart={startEdit} onSave={saveField} onCancel={cancelEdit}
          />
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <WineRowActions wine={row.original} onDelete={() => setDeleteTarget(row.original)} />
        ),
      },
    ],
    [editing, savedCell, startEdit, saveField, cancelEdit]
  )

  const filterOptions = useMemo(() => {
    const countries = new Set<string>()
    const regions = new Set<string>()
    const subRegions = new Set<string>()
    const varietals = new Set<string>()
    const vintages = new Set<number>()

    for (const wine of filteredWines) {
      if (wine.country) countries.add(wine.country)
      if (wine.region) regions.add(wine.region)
      if (wine.subRegion) subRegions.add(wine.subRegion)
      if (wine.varietal) varietals.add(wine.varietal)
      if (wine.vintage) vintages.add(wine.vintage)
    }

    return {
      countries: Array.from(countries).sort(),
      regions: Array.from(regions).sort(),
      subRegions: Array.from(subRegions).sort(),
      varietals: Array.from(varietals).sort(),
      vintages: Array.from(vintages).sort((a, b) => b - a),
    }
  }, [filteredWines])

  const table = useReactTable({
    data: filteredWines,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 40 }, columnVisibility: { subRegion: false } },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search your cellar..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex rounded-md border border-border">
            {(['in-cellar', 'all', 'consumed'] as CellarView[]).map((view) => (
              <button
                key={view}
                onClick={() => setCellarView(view)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md last:rounded-r-md ${
                  cellarView === view
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {view === 'in-cellar' ? 'In Cellar' : view === 'all' ? 'All' : 'Consumed'}
              </button>
            ))}
          </div>
        </div>
        <WineFilters
          table={table}
          options={filterOptions}
          globalFilter={globalFilter}
          onClearSearch={() => setGlobalFilter('')}
        />
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap px-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 py-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No wines match your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
      />

      <DeleteWineDialog
        wineId={deleteTarget?.id ?? ''}
        wineLabel={deleteTarget ? `${deleteTarget.producer} ${deleteTarget.wineName}` : ''}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      />
    </div>
  )
}

// Extracted to avoid type issues with Column generic
function SortHeader({ column, label }: { column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc: boolean) => void }; label: string }) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 px-2"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  )
}
