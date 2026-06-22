import { redirect } from 'next/navigation'
import { Plus, BookmarkCheck, Pencil, Trash2 } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/dashboard/EmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { WatchListForm } from '@/components/watchlist/WatchListForm'
import { WatchListDeleteButton } from '@/components/watchlist/WatchListDeleteButton'

function formatDate(date: Date | null) {
  if (!date) return '--'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function WatchListPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const items = await prisma.watchListItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Watch List</h1>
        <WatchListForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Wine
            </Button>
          }
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={BookmarkCheck}
          title="Your watch list is empty"
          description="Add wines you want to keep an eye on -- we will remind you when your target date approaches."
          action={{ label: 'Add a Wine', href: '#' }}
        />
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producer</TableHead>
                <TableHead>Wine</TableHead>
                <TableHead>Vintage</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-foreground">{item.producer}</TableCell>
                  <TableCell>{item.wineName || '--'}</TableCell>
                  <TableCell>{item.vintage ?? '--'}</TableCell>
                  <TableCell>{formatDate(item.targetDate)}</TableCell>
                  <TableCell>
                    {item.notified ? (
                      <Badge variant="secondary">Notified</Badge>
                    ) : item.targetDate ? (
                      <Badge variant="outline">Watching</Badge>
                    ) : (
                      <Badge variant="outline">No date</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <WatchListForm
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                        editItem={item}
                      />
                      <WatchListDeleteButton id={item.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
