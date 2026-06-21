'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { SerializedWine } from '@/lib/wines/queries'
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
import { WineFilters, type WineFilterOptions } from './WineFilters'
import { DeleteWineDialog } from './DeleteWineDialog'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

const multiSelectFilter: FilterFn<SerializedWine> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true
  const value = row.getValue<string | null>(columnId)
  return value !== null && filterValue.includes(value)
}

const vintageRangeFilter: FilterFn<SerializedWine> = (row, columnId, filterValue) => {
  const [min, max] = (filterValue ?? []) as [number | undefined, number | undefined]
  if (min === undefined && max === undefined) return true
  const value = row.getValue<number | null>(columnId)
  if (value === null || value === undefined) return false
  if (min !== undefined && value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

const globalSearchFilter: FilterFn<SerializedWine> = (row, _columnId, filterValue) => {
  const search = String(filterValue).toLowerCase().trim()
  if (!search) return true
  const wine = row.original
  return [wine.producer, wine.wineName, wine.region, wine.vineyard, wine.varietal, wine.vendor, wine.notes]
    .filter((value): value is string => typeof value === 'string')
    .some((value) => value.toLowerCase().includes(search))
}

function SortButton({
  column,
  label,
}: {
  column: Column<SerializedWine, unknown>
  label: string
}) {
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

function WineRowActions({
  wine,
  onDelete,
}: {
  wine: SerializedWine
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/cellar/${wine.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/cellar/${wine.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function WineTable({ wines }: { wines: SerializedWine[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    country: false,
    vineyard: false,
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SerializedWine | null>(null)

  const columns = useMemo<ColumnDef<SerializedWine>[]>(
    () => [
      {
        accessorKey: 'producer',
        header: ({ column }) => <SortButton column={column} label="Producer" />,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.producer}</span>
        ),
      },
      {
        accessorKey: 'wineName',
        header: ({ column }) => <SortButton column={column} label="Wine Name" />,
      },
      {
        accessorKey: 'vintage',
        header: ({ column }) => <SortButton column={column} label="Vintage" />,
        cell: ({ row }) => row.original.vintage ?? '—',
        filterFn: vintageRangeFilter,
      },
      {
        accessorKey: 'region',
        header: ({ column }) => <SortButton column={column} label="Region" />,
        cell: ({ row }) => row.original.region ?? '—',
        filterFn: multiSelectFilter,
      },
      {
        accessorKey: 'varietal',
        header: ({ column }) => <SortButton column={column} label="Varietal" />,
        cell: ({ row }) => row.original.varietal ?? '—',
        filterFn: multiSelectFilter,
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => <SortButton column={column} label="Qty" />,
      },
      {
        accessorKey: 'purchasePrice',
        header: ({ column }) => <SortButton column={column} label="Purchase Price" />,
        cell: ({ row }) =>
          row.original.purchasePrice !== null
            ? formatCurrency(row.original.purchasePrice)
            : '—',
      },
      {
        accessorKey: 'currentEstValue',
        header: ({ column }) => <SortButton column={column} label="Est. Value/Bottle" />,
        cell: ({ row }) =>
          row.original.currentEstValue !== null
            ? formatCurrency(row.original.currentEstValue)
            : '—',
      },
      {
        id: 'totalEstValue',
        accessorFn: (row) =>
          row.currentEstValue !== null ? row.currentEstValue * row.quantity : null,
        header: ({ column }) => <SortButton column={column} label="Total Est. Value" />,
        cell: ({ row }) =>
          row.original.currentEstValue !== null
            ? formatCurrency(row.original.currentEstValue * row.original.quantity)
            : '—',
      },
      {
        accessorKey: 'vineyard',
        header: ({ column }) => <SortButton column={column} label="Vineyard" />,
        cell: ({ row }) => row.original.vineyard ?? '—',
      },
      {
        accessorKey: 'country',
        header: 'Country',
        filterFn: multiSelectFilter,
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <WineRowActions wine={row.original} onDelete={() => setDeleteTarget(row.original)} />
        ),
      },
    ],
    []
  )

  const filterOptions = useMemo<WineFilterOptions>(() => {
    const countries = new Set<string>()
    const regions = new Set<string>()
    const varietals = new Set<string>()

    for (const wine of wines) {
      if (wine.country) countries.add(wine.country)
      if (wine.region) regions.add(wine.region)
      if (wine.varietal) varietals.add(wine.varietal)
    }

    return {
      countries: Array.from(countries).sort(),
      regions: Array.from(regions).sort(),
      varietals: Array.from(varietals).sort(),
    }
  }, [wines])

  const table = useReactTable({
    data: wines,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalSearchFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search your cellar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="sm:max-w-xs"
        />
        <WineFilters table={table} options={filterOptions} />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
        wineLabel={
          deleteTarget ? `${deleteTarget.producer} ${deleteTarget.wineName}` : ''
        }
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      />
    </div>
  )
}
