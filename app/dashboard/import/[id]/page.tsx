import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/current-user'
import { getImport } from '@/lib/import/queries'
import { findDuplicates } from '@/lib/import/duplicate-detector'
import { type MappedWineData } from '@/lib/import/constants'
import { ImportStatusBadge } from '@/components/import/ImportStatusBadge'
import { ImportReview } from '@/components/import/ImportReview'

interface ImportReviewPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ImportReviewPage({ params, searchParams }: ImportReviewPageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const importRecord = await getImport(user.id, params.id)
  if (!importRecord) {
    notFound()
  }

  const candidates = importRecord.rows.map(
    (row) => (row.mappedData ?? {}) as unknown as MappedWineData
  )
  const duplicates = await findDuplicates(user.id, candidates)

  const rows = importRecord.rows.map((row, index) => ({
    ...row,
    duplicateOf: duplicates[index],
  }))

  const mappingParam = searchParams.mapping
  let mappingSuggestion: Record<string, string | null> = {}
  if (typeof mappingParam === 'string') {
    try {
      mappingSuggestion = JSON.parse(mappingParam)
    } catch {
      mappingSuggestion = {}
    }
  }

  const regionSplitsParam = searchParams.regionSplits
  let regionSplitColumns: Record<string, string> = {}
  if (typeof regionSplitsParam === 'string') {
    try {
      regionSplitColumns = JSON.parse(regionSplitsParam)
    } catch {
      regionSplitColumns = {}
    }
  }

  const countryStateSplitsParam = searchParams.countryStateSplits
  let countryStateSplitColumns: Record<string, string> = {}
  if (typeof countryStateSplitsParam === 'string') {
    try {
      countryStateSplitColumns = JSON.parse(countryStateSplitsParam)
    } catch {
      countryStateSplitColumns = {}
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/import/history"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All imports
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{importRecord.originalFilename}</h1>
          <ImportStatusBadge status={importRecord.status} />
        </div>
      </div>

      <ImportReview importRecord={importRecord} rows={rows} mappingSuggestion={mappingSuggestion} regionSplitColumns={regionSplitColumns} countryStateSplitColumns={countryStateSplitColumns} />
    </div>
  )
}
