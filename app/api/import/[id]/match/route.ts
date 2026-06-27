import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { getImport } from '@/lib/import/queries'
import type { MappedWineData } from '@/lib/import/constants'

interface RouteParams {
  params: { id: string }
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const importRecord = await getImport(user.id, params.id)
  if (!importRecord) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const cellarWines = await prisma.wine.findMany({
    where: { userId: user.id, isFullyConsumed: false },
    select: {
      id: true,
      producer: true,
      wineName: true,
      vintage: true,
      quantity: true,
      consumedQuantity: true,
      region: true,
      varietal: true,
    },
    orderBy: [{ producer: 'asc' }, { wineName: 'asc' }],
  })

  const matches = importRecord.rows.map((row) => {
    const mapped = (row.mappedData ?? {}) as unknown as MappedWineData
    const rowLabel = [mapped.producer, mapped.wineName, mapped.vintage].filter(Boolean).join(' ')

    if (!mapped.producer?.trim() || !mapped.wineName?.trim()) {
      return {
        importRowId: row.id,
        importRowLabel: rowLabel || 'Unknown',
        matchedWineId: null as string | null,
        matchedWineName: null as string | null,
        matchedWineRemaining: null as number | null,
        confidence: 'none' as 'exact' | 'fuzzy' | 'none',
      }
    }

    const nProducer = normalize(mapped.producer)
    const nName = normalize(mapped.wineName)
    const vintage = mapped.vintage

    let bestMatch: (typeof cellarWines)[0] | null = null
    let confidence: 'exact' | 'fuzzy' | 'none' = 'none'

    for (const wine of cellarWines) {
      const wProducer = normalize(wine.producer)
      const wName = normalize(wine.wineName)

      const producerMatch =
        wProducer === nProducer ||
        wProducer.includes(nProducer) ||
        nProducer.includes(wProducer)
      const nameMatch =
        wName === nName ||
        wName.includes(nName) ||
        nName.includes(wName)

      if (!producerMatch || !nameMatch) continue

      if (vintage && wine.vintage && wine.vintage === vintage) {
        bestMatch = wine
        confidence = 'exact'
        break
      } else {
        const vintageMissing = !vintage || !wine.vintage
        const vintageClose = vintage && wine.vintage && Math.abs(wine.vintage - vintage) <= 1
        if (vintageMissing || vintageClose) {
          bestMatch = wine
          confidence = 'fuzzy'
        }
      }
    }

    return {
      importRowId: row.id,
      importRowLabel: rowLabel,
      matchedWineId: bestMatch?.id ?? null,
      matchedWineName: bestMatch
        ? `${bestMatch.producer} ${bestMatch.wineName}${bestMatch.vintage ? ' ' + bestMatch.vintage : ''}`
        : null,
      matchedWineRemaining: bestMatch
        ? bestMatch.quantity - bestMatch.consumedQuantity
        : null,
      confidence,
    }
  })

  const cellarOptions = cellarWines.map((w) => ({
    id: w.id,
    label: `${w.producer} ${w.wineName}${w.vintage ? ' ' + w.vintage : ''}`,
    remaining: w.quantity - w.consumedQuantity,
  }))

  return NextResponse.json({ matches, cellarOptions })
}
