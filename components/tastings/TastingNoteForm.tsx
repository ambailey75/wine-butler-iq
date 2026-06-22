'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
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
import { tastingNoteSchema, tastingNoteDefaults, type TastingNoteFormValues } from '@/lib/tastings/schema'
import type { SerializedTastingNote } from '@/lib/tastings/queries'

interface TastingNoteFormProps {
  trigger: React.ReactNode
  editNote?: SerializedTastingNote
  prefill?: {
    producer?: string
    wineName?: string
    vintage?: number
  }
}

export function TastingNoteForm({ trigger, editNote, prefill }: TastingNoteFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const defaults = editNote
    ? {
        producer: editNote.producer,
        wineName: editNote.wineName,
        vintage: editNote.vintage ?? undefined,
        rating: editNote.rating ?? undefined,
        liked: editNote.liked ?? undefined,
        notes: editNote.notes ?? '',
        occasion: editNote.occasion ?? '',
        tastedDate: editNote.tastedDate
          ? new Date(editNote.tastedDate).toISOString().split('T')[0]
          : tastingNoteDefaults.tastedDate,
      }
    : {
        ...tastingNoteDefaults,
        ...(prefill?.producer ? { producer: prefill.producer } : {}),
        ...(prefill?.wineName ? { wineName: prefill.wineName } : {}),
        ...(prefill?.vintage ? { vintage: prefill.vintage } : {}),
      }

  const form = useForm<TastingNoteFormValues>({
    resolver: zodResolver(tastingNoteSchema),
    defaultValues: defaults,
  })

  const liked = form.watch('liked')

  async function onSubmit(values: TastingNoteFormValues) {
    setSubmitting(true)
    try {
      const url = editNote ? `/api/tastings/${editNote.id}` : '/api/tastings'
      const method = editNote ? 'PUT' : 'POST'
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
          <DialogTitle>{editNote ? 'Edit Tasting Note' : 'Log a Tasting'}</DialogTitle>
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
            <Label htmlFor="wineName">Wine Name *</Label>
            <Input id="wineName" {...form.register('wineName')} />
            {form.formState.errors.wineName && (
              <p className="text-xs text-destructive">{form.formState.errors.wineName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vintage">Vintage</Label>
              <Input id="vintage" type="number" {...form.register('vintage')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-100)</Label>
              <Input id="rating" type="number" step="0.1" {...form.register('rating')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Would you buy this?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={liked === true ? 'default' : 'outline'}
                size="sm"
                onClick={() => form.setValue('liked', liked === true ? undefined : true)}
              >
                <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                Yes
              </Button>
              <Button
                type="button"
                variant={liked === false ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => form.setValue('liked', liked === false ? undefined : false)}
              >
                <ThumbsDown className="mr-1 h-3.5 w-3.5" />
                No
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Input id="occasion" placeholder="e.g. dinner at Bestia" {...form.register('occasion')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tastedDate">Date</Label>
            <Input id="tastedDate" type="date" {...form.register('tastedDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} placeholder="Tasting impressions..." {...form.register('notes')} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editNote ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
