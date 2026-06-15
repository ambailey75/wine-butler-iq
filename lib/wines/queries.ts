import { prisma } from '@/lib/prisma/client'
import type { Wine } from '@prisma/client'

// Prisma returns Decimal fields as Decimal.js instances, which cannot cross
// the server/client component boundary. Use these when passing wines to
// client components (table, form).
export type SerializedWine = Omit<Wine, 'purchasePrice' | 'rating' | 'currentEstValue'> & {
  purchasePrice: number | null
  rating: number | null
  currentEstValue: number | null
}

export function serializeWine(wine: Wine): SerializedWine {
  return {
    ...wine,
    purchasePrice: wine.purchasePrice ? wine.purchasePrice.toNumber() : null,
    rating: wine.rating ? wine.rating.toNumber() : null,
    currentEstValue: wine.currentEstValue ? wine.currentEstValue.toNumber() : null,
  }
}

export function serializeWines(wines: Wine[]): SerializedWine[] {
  return wines.map(serializeWine)
}

export async function listWines(userId: string): Promise<Wine[]> {
  return prisma.wine.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getWine(userId: string, id: string): Promise<Wine | null> {
  return prisma.wine.findFirst({
    where: { id, userId },
  })
}

export async function getRecentWines(userId: string, limit = 5): Promise<Wine[]> {
  return prisma.wine.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export interface DistinctWineValues {
  regions: string[]
  varietals: string[]
}

export async function getDistinctRegionsAndVarietals(
  userId: string
): Promise<DistinctWineValues> {
  const wines = await prisma.wine.findMany({
    where: { userId },
    select: { region: true, varietal: true },
  })

  const regions = new Set<string>()
  const varietals = new Set<string>()

  for (const wine of wines) {
    if (wine.region) regions.add(wine.region)
    if (wine.varietal) varietals.add(wine.varietal)
  }

  return {
    regions: Array.from(regions).sort(),
    varietals: Array.from(varietals).sort(),
  }
}

export interface DashboardSummary {
  totalBottles: number
  estimatedValue: number
  bottlesAtPeak: number
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const wines = await prisma.wine.findMany({
    where: { userId },
    select: { quantity: true, purchasePrice: true, currentEstValue: true },
  })

  const totalBottles = wines.reduce((sum, w) => sum + w.quantity, 0)
  const estimatedValue = wines.reduce((sum, w) => {
    const perBottleValue = w.currentEstValue
      ? w.currentEstValue.toNumber()
      : w.purchasePrice
        ? w.purchasePrice.toNumber()
        : 0
    return sum + w.quantity * perBottleValue
  }, 0)

  // Will be 0 until Phase 5 populates WineEnrichment.peakWindowStart/End.
  const currentYear = new Date().getFullYear()
  const peakWines = await prisma.wine.findMany({
    where: {
      userId,
      enrichment: {
        peakWindowStart: { lte: currentYear },
        peakWindowEnd: { gte: currentYear },
      },
    },
    select: { quantity: true },
  })
  const bottlesAtPeak = peakWines.reduce((sum, w) => sum + w.quantity, 0)

  return { totalBottles, estimatedValue, bottlesAtPeak }
}
