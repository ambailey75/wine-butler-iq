import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Download, Wine } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listWines, serializeWines } from '@/lib/wines/queries'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { WineTable } from '@/components/cellar/WineTable'

export default async function CellarPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const wines = await listWines(user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Cellar</h1>
        {wines.length > 0 && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/api/wines/export" download>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </a>
            </Button>
            <Button asChild>
              <Link href="/dashboard/cellar/new">Add a wine</Link>
            </Button>
          </div>
        )}
      </div>

      {wines.length === 0 ? (
        <EmptyState
          icon={Wine}
          title="Your cellar is empty"
          description="Add your first bottle to start tracking your collection, or import your existing cellar."
          action={{ label: 'Add a wine', href: '/dashboard/cellar/new' }}
          secondaryAction={{ label: 'Import your collection', href: '/dashboard/import' }}
        />
      ) : (
        <div className="p-4">
          <WineTable wines={serializeWines(wines)} />
        </div>
      )}
    </div>
  )
}
