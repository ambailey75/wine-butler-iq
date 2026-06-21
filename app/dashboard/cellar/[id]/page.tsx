import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { getWine } from '@/lib/wines/queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteWineButton } from '@/components/cellar/DeleteWineButton'
import { LabelPhoto } from '@/components/cellar/LabelPhoto'
import { LabelPhotoUpload } from '@/components/cellar/LabelPhotoUpload'

interface WineDetailPageProps {
  params: { id: string }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatRating(value: number) {
  return `${value}/100`
}

function formatDrinkWindow(start: number | null, end: number | null) {
  if (start && end) return `${start}–${end}`
  if (start) return `${start} onward`
  if (end) return `Through ${end}`
  return null
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value || '—'}</p>
    </div>
  )
}

export default async function WineDetailPage({ params }: WineDetailPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const wine = await getWine(user.id, params.id)
  if (!wine) {
    notFound()
  }

  const purchasePrice = wine.purchasePrice ? wine.purchasePrice.toNumber() : null
  const currentEstValue = wine.currentEstValue ? wine.currentEstValue.toNumber() : null
  const rating = wine.rating ? wine.rating.toNumber() : null
  const totalCost = purchasePrice !== null ? purchasePrice * wine.quantity : null
  const totalEstValue = currentEstValue !== null ? currentEstValue * wine.quantity : null
  const drinkWindow = formatDrinkWindow(wine.drinkWindowStart, wine.drinkWindowEnd)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <LabelPhoto
            src={wine.labelPhotoUrl}
            alt={`${wine.producer} ${wine.wineName} label`}
            initial={wine.producer.charAt(0).toUpperCase()}
          />
          <LabelPhotoUpload wineId={wine.id} hasPhoto={Boolean(wine.labelPhotoUrl)} />
        </div>
        <div className="flex flex-1 flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {wine.producer} {wine.wineName}
              </h1>
              {wine.vintage && <Badge variant="secondary">{wine.vintage}</Badge>}
              {wine.format && <Badge variant="outline">{wine.format}</Badge>}
            </div>
            {(wine.region || wine.country) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[wine.region, wine.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/cellar/${wine.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DeleteWineButton
              wineId={wine.id}
              wineLabel={`${wine.producer} ${wine.wineName}`}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Producer" value={wine.producer} />
          <DetailField label="Wine Name" value={wine.wineName} />
          <DetailField label="Vintage" value={wine.vintage?.toString()} />
          <DetailField label="Country" value={wine.country} />
          <DetailField label="Region" value={wine.region} />
          <DetailField label="Sub-Region" value={wine.subRegion} />
          <DetailField label="Vineyard" value={wine.vineyard} />
          <DetailField label="Classification" value={wine.classification} />
          <DetailField label="Varietal" value={wine.varietal} />
          <DetailField label="Format" value={wine.format} />
          <DetailField label="Style" value={wine.style} />
          <DetailField label="Quantity" value={wine.quantity.toString()} />
          <DetailField
            label="Purchase Price"
            value={purchasePrice !== null ? formatCurrency(purchasePrice) : null}
          />
          <DetailField
            label="Total Cost"
            value={totalCost !== null ? formatCurrency(totalCost) : null}
          />
          <DetailField
            label="Purchase Date"
            value={wine.purchaseDate ? formatDate(wine.purchaseDate) : null}
          />
          <DetailField label="Vendor" value={wine.vendor} />
          <DetailField label="Storage Location" value={wine.storageLocation} />
          <DetailField label="Wine ID" value={wine.wineId} />
          <DetailField
            label="Current Est. Value"
            value={currentEstValue !== null ? formatCurrency(currentEstValue) : null}
          />
          <DetailField
            label="Total Est. Value"
            value={totalEstValue !== null ? formatCurrency(totalEstValue) : null}
          />
          <DetailField label="Rating" value={rating !== null ? formatRating(rating) : null} />
          <DetailField label="Drink Window" value={drinkWindow} />
        </CardContent>
      </Card>

      {wine.tastingNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{wine.tastingNotes}</p>
          </CardContent>
        </Card>
      )}

      {wine.pairingNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pairing Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{wine.pairingNotes}</p>
          </CardContent>
        </Card>
      )}

      {wine.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">{wine.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrichment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Not yet enriched. Critic scores, market pricing, and drinking windows will
            appear here once the enrichment pipeline runs (Phase 5).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
