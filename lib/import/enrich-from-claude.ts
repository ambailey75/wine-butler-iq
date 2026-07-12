import { anthropic, CLAUDE_MODEL } from '@/lib/ai/client'
import type { MappedWineData } from './constants'
import type { EnrichableRow } from './enrich-from-static'

const ENRICHABLE_FIELDS = [
  'country', 'state', 'region', 'subRegion', 'varietal',
  'style', 'drinkWindowStart', 'drinkWindowEnd', 'classification', 'vineyard',
] as const

type EnrichableField = (typeof ENRICHABLE_FIELDS)[number]
const NUMERIC_FIELDS = new Set<EnrichableField>(['drinkWindowStart', 'drinkWindowEnd'])

function getBlankFields(data: MappedWineData): EnrichableField[] {
  return ENRICHABLE_FIELDS.filter((f) => !data[f as keyof MappedWineData])
}

function coerce(field: EnrichableField, val: unknown): string | number | undefined {
  if (val === null || val === undefined || val === '') return undefined
  if (NUMERIC_FIELDS.has(field)) {
    const n = typeof val === 'number' ? val : parseInt(String(val), 10)
    return Number.isNaN(n) ? undefined : n
  }
  return typeof val === 'string' ? val : String(val)
}

export async function enrichFromClaude(rows: EnrichableRow[]): Promise<EnrichableRow[]> {
  const needsEnrichment = rows
    .map((row, i) => ({ i, row, blanks: getBlankFields(row.mappedData) }))
    .filter(({ blanks }) => blanks.length > 0)

  if (!needsEnrichment.length) return rows

  const systemPrompt =
    'You are a wine expert. Given a JSON array of wines, fill any blank fields from your knowledge. ' +
    'For "subRegion", provide the appellation (e.g. AVA, DOC, DOCG, AOC) if you don\'t know a more specific sub-region — treat appellation and sub-region as the same field. ' +
    'Return ONLY a JSON array — no explanation. Each element: {"index":<number>,"filled":{<field>:<value>,...}}. ' +
    'Only fill fields listed in blankFields. Omit fields you are uncertain about. Never guess.'

  try {
    const payload = needsEnrichment.map(({ i, row, blanks }) => ({
      index: i,
      producer: row.mappedData.producer,
      wineName: row.mappedData.wineName,
      vintage: row.mappedData.vintage,
      country: row.mappedData.country,
      region: row.mappedData.region,
      blankFields: blanks,
    }))

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    })

    const text = response.content.find((c) => c.type === 'text')?.text ?? ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return rows

    const parsed = JSON.parse(jsonMatch[0]) as { index: number; filled: Record<string, unknown> }[]

    const result: EnrichableRow[] = rows.map((row) => ({
      mappedData: { ...row.mappedData },
      confidenceScores: { ...row.confidenceScores },
    }))

    for (const { index, filled } of parsed) {
      if (index < 0 || index >= result.length) continue
      for (const field of ENRICHABLE_FIELDS) {
        const raw = filled[field]
        if (raw === undefined) continue
        if (result[index].mappedData[field as keyof MappedWineData]) continue
        const val = coerce(field, raw)
        if (val === undefined) continue
        ;(result[index].mappedData as Record<string, unknown>)[field] = val
        result[index].confidenceScores[field] = 0.75
        result[index].confidenceScores[`_src_${field}`] = 'ai-suggested'
      }
    }

    return result
  } catch {
    // Enrichment failure is non-fatal — show review table without enrichment
    return rows
  }
}
