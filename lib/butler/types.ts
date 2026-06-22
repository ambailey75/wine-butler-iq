export interface ButlerResult {
  producer: string
  wineName: string
  vintage: number | null
  region: string | null
  varietal: string | null
  estimatedCriticScoreMin: number | null
  estimatedCriticScoreMax: number | null
  estimatedRetailPriceMin: number | null
  estimatedRetailPriceMax: number | null
  drinkWindowStart: number | null
  drinkWindowEnd: number | null
  briefDescription: string
}

export interface MarkupAssessment {
  label: string
  color: string
  ratio: number
  explanation: string
}

export function getMarkupAssessment(
  menuPrice: number,
  retailMin: number | null,
  retailMax: number | null
): MarkupAssessment | null {
  if (!retailMin || !retailMax) return null
  const avgRetail = (retailMin + retailMax) / 2
  if (avgRetail <= 0) return null
  const ratio = menuPrice / avgRetail

  if (ratio < 2) {
    return {
      label: 'Great Value',
      color: 'text-emerald-500',
      ratio,
      explanation: `$${menuPrice} menu / ~$${Math.round(avgRetail)} retail = ${ratio.toFixed(1)}x markup`,
    }
  }
  if (ratio < 3) {
    return {
      label: 'Fair',
      color: 'text-foreground',
      ratio,
      explanation: `$${menuPrice} menu / ~$${Math.round(avgRetail)} retail = ${ratio.toFixed(1)}x markup`,
    }
  }
  if (ratio < 4) {
    return {
      label: 'On the high end',
      color: 'text-amber-500',
      ratio,
      explanation: `$${menuPrice} menu / ~$${Math.round(avgRetail)} retail = ${ratio.toFixed(1)}x markup`,
    }
  }
  return {
    label: 'Expensive',
    color: 'text-red-500',
    ratio,
    explanation: `$${menuPrice} menu / ~$${Math.round(avgRetail)} retail = ${ratio.toFixed(1)}x markup`,
  }
}
