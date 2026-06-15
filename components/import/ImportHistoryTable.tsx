'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Import } from '@prisma/client'
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ImportStatusBadge } from './ImportStatusBadge'

const SOURCE_LABELS: Record<Import['sourceType'], string> = {
  EXCEL: 'Excel',
  CSV: 'CSV',
  PDF: 'PDF Invoice',
  IMAGE: 'Label Photo',
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))
}

export function ImportHistoryTable({ imports }: { imports: Import[] }) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<Import | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    startTransition(async () => {
      await fetch(`/api/import/${id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No imports yet.
                </TableCell>
              </TableRow>
            ) : (
              imports.map((importRecord) => (
                <TableRow key={importRecord.id}>
                  <TableCell className="max-w-[240px] truncate font-medium text-foreground">
                    {importRecord.status === 'REVIEW' ? (
                      <Link href={`/dashboard/import/${importRecord.id}`} className="hover:underline">
                        {importRecord.originalFilename}
                      </Link>
                    ) : (
                      importRecord.originalFilename
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{SOURCE_LABELS[importRecord.sourceType]}</Badge>
                  </TableCell>
                  <TableCell>
                    <ImportStatusBadge status={importRecord.status} />
                    {importRecord.status === 'FAILED' && importRecord.errorMessage && (
                      <p className="mt-1 max-w-[280px] text-xs text-muted-foreground">
                        {importRecord.errorMessage}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {importRecord.recordCount}
                    {importRecord.skippedCount > 0 ? ` (${importRecord.skippedCount} skipped)` : ''}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(importRecord.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {importRecord.status === 'REVIEW' && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/import/${importRecord.id}`}>Review</Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(importRecord)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this import?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.originalFilename} and its uploaded file will be permanently removed. Wines
              already added to your cellar from this import will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
