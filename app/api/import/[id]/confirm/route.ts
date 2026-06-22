import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { getImport } from '@/lib/import/queries'
import { IMPORTS_BUCKET, LABELS_BUCKET, type MappedWineData } from '@/lib/import/constants'
import { inferStyle } from '@/lib/wines/inferStyle'

export const maxDuration = 60

interface RouteParams {
  params: { id: string }
}

const BATCH_SIZE = 50

function toWineCreateData(mapped: MappedWineData) {
  const purchaseDate = mapped.purchaseDate ? new Date(mapped.purchaseDate) : null

  return {
    producer: mapped.producer!.trim(),
    wineName: mapped.wineName!.trim(),
    vintage: mapped.vintage ?? null,
    country: mapped.country ?? null,
    state: mapped.state ?? null,
    region: mapped.region ?? null,
    subRegion: mapped.subRegion ?? null,
    vineyard: mapped.vineyard ?? null,
    classification: mapped.classification ?? null,
    varietal: mapped.varietal ?? null,
    format: mapped.format ?? null,
    style: mapped.style || inferStyle({ varietal: mapped.varietal, region: mapped.region, wineName: mapped.wineName, classification: mapped.classification }) || null,
    quantity: mapped.quantity && mapped.quantity > 0 ? Math.round(mapped.quantity) : 1,
    purchasePrice: mapped.purchasePrice ?? null,
    purchaseDate: purchaseDate && !Number.isNaN(purchaseDate.getTime()) ? purchaseDate : null,
    vendor: mapped.vendor ?? null,
    storageLocation: mapped.storageLocation ?? null,
    notes: mapped.notes ?? null,
    currentEstValue: mapped.currentEstValue ?? null,
    totalCostOverride: mapped.totalCostOverride ?? null,
    totalValueOverride: mapped.totalValueOverride ?? null,
    rating: mapped.rating ?? null,
    drinkWindowStart: mapped.drinkWindowStart ?? null,
    drinkWindowEnd: mapped.drinkWindowEnd ?? null,
    tastingNotes: mapped.tastingNotes ?? null,
    pairingNotes: mapped.pairingNotes ?? null,
    wineId: mapped.wineId ?? null,
  }
}

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

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function sendProgress(imported: number, total: number) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'progress', imported, total }) + '\n')
        )
      }

      try {
        let totalImported = 0

        for (let i = 0; i < rowsToImport.length; i += BATCH_SIZE) {
          const batch = rowsToImport.slice(i, i + BATCH_SIZE)

          const wineDataBatch = batch.map((row) => {
            const mapped = (row.mappedData ?? {}) as unknown as MappedWineData
            return {
              userId: user.id,
              importId: importRecord.id,
              ...toWineCreateData(mapped),
              ...(labelPhotoUrl ? { labelPhotoUrl } : {}),
            }
          })

          await prisma.wine.createMany({ data: wineDataBatch })

          const createdWines = await prisma.wine.findMany({
            where: { importId: importRecord.id },
            select: { id: true, producer: true, wineName: true, vintage: true },
            orderBy: { createdAt: 'asc' },
            skip: i,
            take: BATCH_SIZE,
          })

          const rowUpdates = batch.map((row, idx) => {
            const wineId = createdWines[idx]?.id
            return prisma.importRow.update({
              where: { id: row.id },
              data: { status: 'CONFIRMED', ...(wineId ? { wineId } : {}) },
            })
          })
          await Promise.all(rowUpdates)

          totalImported += batch.length
          sendProgress(totalImported, rowsToImport.length)
        }

        await prisma.import.update({
          where: { id: importRecord.id },
          data: {
            status: 'COMPLETE',
            recordCount: rowsToImport.length,
            skippedCount: skippedRows.length,
            completedAt: new Date(),
          },
        })

        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'complete', imported: totalImported }) + '\n')
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Import failed'
        await prisma.import.update({
          where: { id: importRecord.id },
          data: { status: 'FAILED', errorMessage: message, completedAt: new Date() },
        }).catch(() => {})

        controller.enqueue(
          encoder.encode(JSON.stringify({ type: 'error', error: message }) + '\n')
        )
      } finally {
        controller.close()
      }
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/cellar')
  revalidatePath('/dashboard/import')
  revalidatePath('/dashboard/import/history')
  revalidatePath(`/dashboard/import/${importRecord.id}`)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
