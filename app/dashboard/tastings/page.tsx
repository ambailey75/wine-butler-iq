import { redirect } from 'next/navigation'
import { Plus, Notebook } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listTastingNotes, serializeTastingNotes } from '@/lib/tastings/queries'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { TastingNoteCard } from '@/components/tastings/TastingNoteCard'
import { TastingNoteForm } from '@/components/tastings/TastingNoteForm'

export default async function TastingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const notes = await listTastingNotes(user.id)
  const serialized = serializeTastingNotes(notes)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasting Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wines you have tried outside your cellar -- restaurants, tastings, friends
          </p>
        </div>
        <TastingNoteForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log a Tasting
            </Button>
          }
        />
      </div>

      {serialized.length === 0 ? (
        <EmptyState
          icon={Notebook}
          title="No tastings yet"
          description="Log wines you try at restaurants, tastings, or friends' houses to build your tasting history."
          action={{ label: 'Log a Tasting', href: '#' }}
        />
      ) : (
        <div className="space-y-3">
          {serialized.map((note) => (
            <TastingNoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
