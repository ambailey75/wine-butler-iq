import { prisma } from '@/lib/prisma/client'

export interface InsightsBreakdown {
  label: string
  bottles: number
  estimatedValue: number
  avgRating: number | null
}

export interface InsightsSummary {
  totalBottles: number
  totalCost: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number | null
  avgRating: number | null
}

interface WineRow {
  quantity: number
  purchasePrice: { toNumber(): number } | null
  currentEstValue: { toNumber(): number } | null
  totalCostOverride: { toNumber(): number } | null
  totalValueOverride: { toNumber(): number } | null
  rating: { toNumber(): number } | null
  region: string | null
  varietal: string | null
  style: string | null
  vintage: number | null
}

async function fetchWines(userId: string, includeConsumed: boolean): Promise<WineRow[]> {
  return prisma.wine.findMany({
    where: {
      userId,
      ...(includeConsumed ? {} : { isFullyConsumed: false }),
    },
    select: {
      quantity: true,
      purchasePrice: true,
      currentEstValue: true,
      totalCostOverride: true,
      totalValueOverride: true,
      rating: true,
      region: true,
      varietal: true,
      style: true,
      vintage: true,
    },
  })
}

function wineCost(w: WineRow): number {
  if (w.totalCostOverride) return w.totalCostOverride.toNumber()
  if (w.purchasePrice) return w.purchasePrice.toNumber() * w.quantity
  return 0
}

function wineValue(w: WineRow): number {
  if (w.totalValueOverride) return w.totalValueOverride.toNumber()
  if (w.currentEstValue) return w.currentEstValue.toNumber() * w.quantity
  if (w.purchasePrice) return w.purchasePrice.toNumber() * w.quantity
  return 0
}

export async function getInsightsSummary(
  userId: string,
  includeConsumed: boolean
): Promise<InsightsSummary> {
  const wines = await fetchWines(userId, includeConsumed)

  const totalBottles = wines.reduce((sum, w) => sum + w.quantity, 0)
  const totalCost = wines.reduce((sum, w) => sum + wineCost(w), 0)
  const totalValue = wines.reduce((sum, w) => sum + wineValue(w), 0)
  const gainLoss = totalValue - totalCost
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : null

  const rated = wines.filter((w) => w.rating !== null)
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, w) => sum + w.rating!.toNumber(), 0) / rated.length
      : null

  return { totalBottles, totalCost, totalValue, gainLoss, gainLossPercent, avgRating }
}

function buildBreakdown(
  wines: WineRow[],
  keyFn: (w: WineRow) => string | null
): InsightsBreakdown[] {
  const groups = new Map<string, { bottles: number; value: number; ratings: number[]; label: string }>()

  for (const w of wines) {
    const key = keyFn(w) || 'Unknown'
    const existing = groups.get(key) || { bottles: 0, value: 0, ratings: [], label: key }
    existing.bottles += w.quantity
    existing.value += wineValue(w)
    if (w.rating !== null) existing.ratings.push(w.rating.toNumber())
    groups.set(key, existing)
  }

  return Array.from(groups.values())
    .map((g) => ({
      label: g.label,
      bottles: g.bottles,
      estimatedValue: g.value,
      avgRating: g.ratings.length > 0 ? g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length : null,
    }))
    .sort((a, b) => b.bottles - a.bottles)
}

export async function getInsightsByRegion(
  userId: string,
  includeConsumed: boolean
): Promise<InsightsBreakdown[]> {
  const wines = await fetchWines(userId, includeConsumed)
  return buildBreakdown(wines, (w) => w.region)
}

export async function getInsightsByVarietal(
  userId: string,
  includeConsumed: boolean
): Promise<InsightsBreakdown[]> {
  const wines = await fetchWines(userId, includeConsumed)
  return buildBreakdown(wines, (w) => w.varietal)
}

export async function getInsightsByStyle(
  userId: string,
  includeConsumed: boolean
): Promise<InsightsBreakdown[]> {
  const wines = await fetchWines(userId, includeConsumed)
  return buildBreakdown(wines, (w) => w.style)
}

export async function getInsightsByVintageDecade(
  userId: string,
  includeConsumed: boolean
): Promise<InsightsBreakdown[]> {
  const wines = await fetchWines(userId, includeConsumed)
  return buildBreakdown(wines, (w) =>
    w.vintage ? `${Math.floor(w.vintage / 10) * 10}s` : null
  )
}
