import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { processImport } from '@/lib/import/processor'
import { IMPORTS_BUCKET, MAX_FILE_SIZE, detectSourceType } from '@/lib/import/constants'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const sourceHint = (formData.get('sourceHint') as string | null) || undefined
  const importTypeStr = (formData.get('importType') as string) || 'NEW_INVENTORY'
  const importType = (['NEW_INVENTORY', 'MATCH_CONSUMED', 'HISTORICAL_CONSUMED'] as const).includes(
    importTypeStr as 'NEW_INVENTORY' | 'MATCH_CONSUMED' | 'HISTORICAL_CONSUMED'
  )
    ? (importTypeStr as 'NEW_INVENTORY' | 'MATCH_CONSUMED' | 'HISTORICAL_CONSUMED')
    : ('NEW_INVENTORY' as const)
  const isHistoricalImport = importType === 'HISTORICAL_CONSUMED'
  const historicalConsumedDateStr = formData.get('historicalConsumedDate') as string | null
  const historicalConsumedDate = historicalConsumedDateStr ? new Date(historicalConsumedDateStr) : null

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File must be smaller than 25MB' }, { status: 400 })
  }

  const sourceType = detectSourceType(file.name, file.type)
  if (!sourceType) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const importRecord = await prisma.import.create({
    data: {
      userId: user.id,
      sourceType,
      originalFilename: file.name,
      storagePath: '',
      status: 'PENDING',
      importType,
      isHistoricalImport,
      historicalConsumedDate: isHistoricalImport ? historicalConsumedDate : null,
    },
  })

  const storagePath = `${user.id}/${importRecord.id}/${file.name}`
  const supabase = createAdminClient()

  let { error: uploadError } = await supabase.storage.from(IMPORTS_BUCKET).upload(storagePath, file, {
    contentType: file.type || undefined,
    upsert: true,
  })

  if (uploadError && /bucket not found/i.test(uploadError.message)) {
    await supabase.storage.createBucket(IMPORTS_BUCKET, { public: false })
    uploadError = (
      await supabase.storage.from(IMPORTS_BUCKET).upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: true,
      })
    ).error
  }

  if (uploadError) {
    await prisma.import.delete({ where: { id: importRecord.id } })
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  await prisma.import.update({ where: { id: importRecord.id }, data: { storagePath } })

  const result = await processImport(importRecord.id, file, sourceHint)
  const updated = await prisma.import.findUnique({ where: { id: importRecord.id } })

  revalidatePath('/dashboard/import')
  revalidatePath('/dashboard/import/history')

  return NextResponse.json({
    id: importRecord.id,
    status: updated?.status,
    errorMessage: updated?.errorMessage,
    mappingSuggestion: result.mappingSuggestion,
    regionSplitColumns: result.regionSplitColumns,
    countryStateSplitColumns: result.countryStateSplitColumns,
  })
}
