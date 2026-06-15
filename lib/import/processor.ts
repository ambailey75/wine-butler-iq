import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'
import { parseSpreadsheet } from './excel'
import { extractPdfPages } from './pdf'
import { fileToBase64 } from './image'
import { extractWinesFromPdf, extractWinesFromImage, extractWinesFromText, suggestColumnMapping } from './claude-extractor'
import { PDF_PAGE_BATCH_SIZE } from './constants'

export interface ProcessResult {
  mappingSuggestion?: Record<string, string | null>
}

// Parses/extracts the uploaded file and creates ImportRows, then transitions
// Import to REVIEW (or FAILED). Called synchronously from the upload route;
// kept isolated here as a seam for a future background-job approach.
export async function processImport(importId: string, file: File): Promise<ProcessResult> {
  const importRecord = await prisma.import.findUniqueOrThrow({ where: { id: importId } })

  await prisma.import.update({ where: { id: importId }, data: { status: 'PROCESSING' } })

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    switch (importRecord.sourceType) {
      case 'EXCEL':
      case 'CSV':
        return await processSpreadsheet(importId, buffer)
      case 'PDF':
        return await processPdf(importId, buffer)
      case 'IMAGE':
        return await processImage(importId, file)
    }
  } catch (error) {
    await prisma.import.update({
      where: { id: importId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Import processing failed',
        completedAt: new Date(),
      },
    })
    return {}
  }
}

async function processSpreadsheet(importId: string, buffer: Buffer): Promise<ProcessResult> {
  const { headers, rows } = parseSpreadsheet(buffer)

  if (rows.length === 0) {
    await prisma.import.update({
      where: { id: importId },
      data: { status: 'FAILED', errorMessage: 'No rows found in this file', completedAt: new Date() },
    })
    return {}
  }

  await prisma.importRow.createMany({
    data: rows.map((row) => ({ importId, rawData: row })),
  })

  const mappingSuggestion = await suggestColumnMapping(headers, rows.slice(0, 3))

  await prisma.import.update({
    where: { id: importId },
    data: { status: 'REVIEW', recordCount: rows.length },
  })

  return { mappingSuggestion }
}

async function processPdf(importId: string, buffer: Buffer): Promise<ProcessResult> {
  const pages = await extractPdfPages(buffer)
  const extracted = await extractWinesFromPdf(pages, PDF_PAGE_BATCH_SIZE)

  if (extracted.length === 0) {
    await prisma.import.update({
      where: { id: importId },
      data: {
        status: 'FAILED',
        errorMessage: 'Could not find any wine line items in this PDF',
        completedAt: new Date(),
      },
    })
    return {}
  }

  await prisma.importRow.createMany({
    data: extracted.map((row) => ({
      importId,
      rawData: row.mappedData as unknown as Prisma.InputJsonValue,
      mappedData: row.mappedData as unknown as Prisma.InputJsonValue,
      confidenceScores: row.confidenceScores as unknown as Prisma.InputJsonValue,
    })),
  })

  await prisma.import.update({
    where: { id: importId },
    data: { status: 'REVIEW', recordCount: extracted.length },
  })

  return {}
}

async function processImage(importId: string, file: File): Promise<ProcessResult> {
  const isHtml = file.type === 'text/html' || /\.html?$/i.test(file.name)

  if (isHtml) {
    const html = await file.text()
    const extracted = await extractWinesFromText(html)

    if (extracted.length === 0) {
      await prisma.import.update({
        where: { id: importId },
        data: {
          status: 'FAILED',
          errorMessage: 'Could not find any wine line items in this file',
          completedAt: new Date(),
        },
      })
      return {}
    }

    await prisma.importRow.createMany({
      data: extracted.map((row) => ({
        importId,
        rawData: row.mappedData as unknown as Prisma.InputJsonValue,
        mappedData: row.mappedData as unknown as Prisma.InputJsonValue,
        confidenceScores: row.confidenceScores as unknown as Prisma.InputJsonValue,
      })),
    })

    await prisma.import.update({
      where: { id: importId },
      data: { status: 'REVIEW', recordCount: extracted.length },
    })

    return {}
  }

  const { base64, mimeType } = await fileToBase64(file)

  if (mimeType !== 'image/jpeg' && mimeType !== 'image/png' && mimeType !== 'image/webp') {
    await prisma.import.update({
      where: { id: importId },
      data: { status: 'FAILED', errorMessage: 'Unsupported image type for extraction', completedAt: new Date() },
    })
    return {}
  }

  const extracted = await extractWinesFromImage(base64, mimeType)

  if (extracted.length === 0) {
    await prisma.importRow.create({
      data: { importId, rawData: {}, mappedData: {}, confidenceScores: {} },
    })

    await prisma.import.update({
      where: { id: importId },
      data: {
        status: 'REVIEW',
        recordCount: 1,
        errorMessage:
          'Could not identify wine details from this image — fill in the fields manually before confirming.',
      },
    })

    return {}
  }

  await prisma.importRow.createMany({
    data: extracted.map((row) => ({
      importId,
      rawData: row.mappedData as unknown as Prisma.InputJsonValue,
      mappedData: row.mappedData as unknown as Prisma.InputJsonValue,
      confidenceScores: row.confidenceScores as unknown as Prisma.InputJsonValue,
    })),
  })

  await prisma.import.update({
    where: { id: importId },
    data: { status: 'REVIEW', recordCount: extracted.length },
  })

  return {}
}
