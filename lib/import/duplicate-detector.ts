import { prisma } from '@/lib/prisma/client'
import type { MappedWineData } from './constants'

export interface DuplicateMatch {
  wineId: string
  label: string
}

function normalize(value: string | undefined | null): string {
  return (value ?? '').trim().toLowerCase()
}

function buildKey(
  producer?: string | null,
  wineName?: string | null,
  vintage?: number | null,
  format?: string | null
): string {
  return [normalize(producer), normalize(wineName), vintage ?? '', normalize(format)].join('|')
}

// Computed on-the-fly against the user's current cellar (not persisted) so
// review reflects wines added since the import was uploaded.
export async function findDuplicates(
  userId: string,
  candidates: MappedWineData[]
): Promise<(DuplicateMatch | null)[]> {
  const existingWines = await prisma.wine.findMany({
    where: { userId },
    select: { id: true, producer: true, wineName: true, vintage: true, format: true },
  })

  const lookup = new Map<string, DuplicateMatch>()
  for (const wine of existingWines) {
    const key = buildKey(wine.producer, wine.wineName, wine.vintage, wine.format)
    if (!lookup.has(key)) {
      lookup.set(key, {
        wineId: wine.id,
        label: `${wine.producer} ${wine.wineName}${wine.vintage ? ` (${wine.vintage})` : ''}`,
      })
    }
  }

  return candidates.map((candidate) => {
    const key = buildKey(candidate.producer, candidate.wineName, candidate.vintage, candidate.format)
    return lookup.get(key) ?? null
  })
}
