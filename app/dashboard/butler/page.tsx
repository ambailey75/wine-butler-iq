import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/current-user'
import { ButlerLookup } from '@/components/butler/ButlerLookup'

export default async function ButlerPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Wine Butler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search any wine or snap a photo from a menu. Get estimated scores, retail pricing, and drink window.
        </p>
      </div>
      <ButlerLookup />
    </div>
  )
}
