'use client'

import { useState } from 'react'
import type { SerializedWine } from '@/lib/wines/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MarkConsumedDialogProps {
  wine: SerializedWine | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConsumed: (wineId: string, update: { consumedQuantity: number; isFullyConsumed: boolean }) => void
}

export function MarkConsumedDialog({ wine, open, onOpenChange, onConsumed }: MarkConsumedDialogProps) {
  const remaining = wine ? wine.quantity - wine.consumedQuantity : 0
  const [quantity, setQuantity] = useState(remaining)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setQuantity(remaining)
    setDate(new Date().toISOString().split('T')[0])
    setOccasion('')
    setNotes('')
    setError(null)
    setSubmitting(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  async function handleSubmit() {
    if (!wine) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/wines/${wine.id}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          consumedDate: date,
          occasion: occasion.trim() || null,
          notes: notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Failed to log consumption')
      }
      const newConsumedQuantity = wine.consumedQuantity + quantity
      const isFullyConsumed = newConsumedQuantity >= wine.quantity
      onConsumed(wine.id, { consumedQuantity: newConsumedQuantity, isFullyConsumed })
      onOpenChange(false)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log consumption')
      setSubmitting(false)
    }
  }

  if (!wine) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Consumed</DialogTitle>
          <DialogDescription>
            {wine.producer} {wine.wineName}
            {wine.vintage ? ` · ${wine.vintage}` : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium">Bottles consumed</label>
            <Input
              type="number"
              min={1}
              max={remaining}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value) || 1), remaining))}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">{remaining} bottle{remaining === 1 ? '' : 's'} remaining</p>
          </div>
          <div>
            <label className="text-sm font-medium">Date consumed</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Occasion (optional)</label>
            <Input
              placeholder="e.g. Anniversary dinner"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              placeholder="How was it?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || remaining <= 0}>
            {submitting ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
