import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getImport } from '@/lib/import/queries'
import { IMPORTS_BUCKET, LABELS_BUCKET, type MappedWineData } from '@/lib/import/constants'

interface RouteParams {
  params: { id: string }
}

function toWineCreateData(mapped: MappedWineData) {
  const purchaseDate = mapped.purchaseDate ? new Date(mapped.purchaseDate) : null

  return {
    producer: mapped.producer!.trim(),
    wineName: mapped.wineName!.trim(),
    vintage: mapped.vintage ?? null,
    country: mapped.country ?? null,
    region: mapped.region ?? null,
    subRegion: mapped.subRegion ?? null,
    classification: mapped.classification ?? null,
    varietal: mapped.varietal ?? null,
    format: mapped.format ?? null,
    quantity: mapped.quantity && mapped.quantity > 0 ? Math.round(mapped.quantity) : 1,
    purchasePrice: mapped.purchasePrice ?? null,
    purchaseDate: purchaseDate && !Number.isNaN(purchaseDate.getTime()) ? purchaseDate : null,
    vendor: mapped.vendor ?? null,
    storageLocation: mapped.storageLocation ?? null,
    notes: mapped.notes ?? null,
  }
}

// Copies the uploaded label photo from the private imports bucket to the
// public labels bucket so an IMAGE import also populates Wine.labelPhotoUrl.
async function copyLabelPhoto(userId: string, sourcePath: string): Promise<string | null> {
  const supabase = createAdminClient()

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(IMPORTS_BUCKET)
    .download(sourcePath)

  if (downloadError || !fileData) return null

  const ext = sourcePath.split('.').pop()?.toLowerCase() || 'jpg'
  const labelPath = `${userId}/${Date.now()}.${ext}`

  let { error: uploadError } = await supabase.storage.from(LABELS_BUCKET).upload(labelPath, fileData, {
    contentType: fileData.type,
    upsert: true,
  })

  if (uploadError && /bucket not found/i.test(uploadError.message)) {
    await supabase.storage.createBucket(LABELS_BUCKET, { public: true })
    uploadError = (
      await supabase.storage.from(LABELS_BUCKET).upload(labelPath, fileData, {
        contentType: fileData.type,
        upsert: true,
      })
    ).error
  }

  if (uploadError) return null

  const { data } = supabase.storage.from(LABELS_BUCKET).getPublicUrl(labelPath)
  return data.publicUrl
}

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await getImport(user.id, params.id)
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (importRecord.status !== 'REVIEW') {
    return NextResponse.json({ error: 'This import is not ready to confirm' }, { status: 400 })
  }

  const rowsToImport = importRecord.rows.filter((row) => row.status !== 'SKIPPED')
  const skippedRows = importRecord.rows.filter((row) => row.status === 'SKIPPED')

  if (rowsToImport.length === 0) {
    return NextResponse.json({ error: 'No rows selected to import' }, { status: 400 })
  }

  const incompleteRowIds = rowsToImport
    .filter((row) => {
      const mapped = (row.mappedData ?? {}) as unknown as MappedWineData
      return !mapped.producer?.trim() || !mapped.wineName?.trim()
    })
    .map((row) => row.id)

  if (incompleteRowIds.length > 0) {
    return NextResponse.json(
      { error: 'Some rows are missing a producer or wine name', rowIds: incompleteRowIds },
      { status: 400 }
    )
  }

  let labelPhotoUrl: string | null = null
  if (importRecord.sourceType === 'IMAGE') {
    labelPhotoUrl = await copyLabelPhoto(user.id, importRecord.storagePath)
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rowsToImport) {
      const mapped = (row.mappedData ?? {}) as unknown as MappedWineData

      const wine = await tx.wine.create({
        data: {
          userId: user.id,
          importId: importRecord.id,
          ...toWineCreateData(mapped),
          ...(labelPhotoUrl ? { labelPhotoUrl } : {}),
        },
      })

      await tx.importRow.update({
        where: { id: row.id },
        data: { status: 'CONFIRMED', wineId: wine.id },
      })
    }

    await tx.import.update({
      where: { id: importRecord.id },
      data: {
        status: 'COMPLETE',
        recordCount: rowsToImport.length,
        skippedCount: skippedRows.length,
        completedAt: new Date(),
      },
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/cellar')
  revalidatePath('/dashboard/import')
  revalidatePath('/dashboard/import/history')
  revalidatePath(`/dashboard/import/${importRecord.id}`)

  return NextResponse.json({ success: true })
}
