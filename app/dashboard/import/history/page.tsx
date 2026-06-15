import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { listImports } from '@/lib/import/queries'
import { ImportHistoryTable } from '@/components/import/ImportHistoryTable'

export default async function ImportHistoryPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const imports = await listImports(user.id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/import"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Import
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Import History</h1>
      </div>

      <ImportHistoryTable imports={imports} />
    </div>
  )
}
