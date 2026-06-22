'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SerializedTastingNote } from '@/lib/tastings/queries'
import { TastingNoteForm } from './TastingNoteForm'

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function TastingNoteCard({ note }: { note: SerializedTastingNote }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this tasting note?')) return
    setDeleting(true)
    await fetch(`/api/tastings/${note.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {note.producer} {note.wineName}
              </span>
              {note.vintage && (
                <span className="text-sm text-muted-foreground">({note.vintage})</span>
              )}
              {note.liked === true && <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />}
              {note.liked === false && <ThumbsDown className="h-3.5 w-3.5 text-red-500" />}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {note.rating !== null && <span>Rating: {note.rating}</span>}
              {note.occasion && <span>{note.occasion}</span>}
              <span>{formatDate(note.tastedDate)}</span>
            </div>
            {note.notes && (
              <p className="mt-2 text-sm text-foreground/80">{note.notes}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <TastingNoteForm
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
              editNote={note}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
