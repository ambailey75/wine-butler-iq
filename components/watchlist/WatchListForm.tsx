'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { watchListSchema, watchListDefaults, type WatchListFormValues } from '@/lib/watchlist/schema'
import type { WatchListItem } from '@prisma/client'

interface WatchListFormProps {
  trigger: React.ReactNode
  editItem?: WatchListItem
  prefill?: {
    producer?: string
    wineName?: string
    vintage?: number
  }
}

export function WatchListForm({ trigger, editItem, prefill }: WatchListFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const defaults = editItem
    ? {
        producer: editItem.producer,
        wineName: editItem.wineName ?? '',
        vintage: editItem.vintage ?? undefined,
        notes: editItem.notes ?? '',
        targetDate: editItem.targetDate
          ? new Date(editItem.targetDate).toISOString().split('T')[0]
          : '',
      }
    : {
        ...watchListDefaults,
        ...(prefill?.producer ? { producer: prefill.producer } : {}),
        ...(prefill?.wineName ? { wineName: prefill.wineName } : {}),
        ...(prefill?.vintage ? { vintage: prefill.vintage } : {}),
      }

  const form = useForm<WatchListFormValues>({
    resolver: zodResolver(watchListSchema),
    defaultValues: defaults,
  })

  async function onSubmit(values: WatchListFormValues) {
    setSubmitting(true)
    try {
      const url = editItem ? `/api/watchlist/${editItem.id}` : '/api/watchlist'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Failed to save')
      setOpen(false)
      router.refresh()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Watch List Item' : 'Add to Watch List'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="producer">Producer *</Label>
            <Input id="producer" {...form.register('producer')} />
            {form.formState.errors.producer && (
              <p className="text-xs text-destructive">{form.formState.errors.producer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wineName">Wine Name</Label>
            <Input id="wineName" {...form.register('wineName')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage</Label>
              <Input id="vintage" type="number" {...form.register('vintage')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input id="targetDate" type="date" {...form.register('targetDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Why are you watching this wine?" {...form.register('notes')} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
