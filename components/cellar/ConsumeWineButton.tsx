'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassWater } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'

interface ConsumeWineButtonProps {
  wineId: string
  wineLabel: string
  maxQuantity: number
}

export function ConsumeWineButton({ wineId, wineLabel, maxQuantity }: ConsumeWineButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/wines/${wineId}/consume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          occasion: occasion.trim() || null,
          notes: notes.trim() || null,
          rating: rating ? Number(rating) : null,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Failed to log consumption')
      }
      setOpen(false)
      setQuantity(1)
      setOccasion('')
      setNotes('')
      setRating('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log consumption')
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <GlassWater className="mr-2 h-4 w-4" />
          Mark as Consumed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log consumption</DialogTitle>
          <DialogDescription>{wineLabel}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <label className="text-sm font-medium">Bottles consumed</label>
            <Input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(Number(e.target.value) || 1, maxQuantity))}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">{maxQuantity} available</p>
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
            <label className="text-sm font-medium">Tasting notes (optional)</label>
            <Textarea
              placeholder="How was it?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Personal rating (optional)</label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              placeholder="0-100"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Log Consumption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
