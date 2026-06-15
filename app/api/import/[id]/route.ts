import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getImport } from '@/lib/import/queries'
import { findDuplicates } from '@/lib/import/duplicate-detector'
import { IMPORTS_BUCKET, type MappedWineData } from '@/lib/import/constants'

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await getImport(user.id, params.id)
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const candidates = importRecord.rows.map(
    (row) => (row.mappedData ?? {}) as unknown as MappedWineData
  )
  const duplicates = await findDuplicates(user.id, candidates)

  const rows = importRecord.rows.map((row, index) => ({
    ...row,
    duplicateOf: duplicates[index],
  }))

  return NextResponse.json({ ...importRecord, rows })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await prisma.import.findFirst({ where: { id: params.id, userId: user.id } })
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (importRecord.storagePath) {
    const supabase = createAdminClient()
    await supabase.storage.from(IMPORTS_BUCKET).remove([importRecord.storagePath])
  }

  await prisma.import.delete({ where: { id: importRecord.id } })

  revalidatePath('/dashboard/import')
  revalidatePath('/dashboard/import/history')

  return NextResponse.json({ success: true })
}
