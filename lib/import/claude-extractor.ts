import { z } from 'zod'
import { anthropic, CLAUDE_MODEL } from '@/lib/ai/client'
import { IMPORT_TARGET_FIELDS, type ConfidenceScores, type MappedWineData } from './constants'

const WINE_FIELD_PROPERTIES = {
  producer: { type: 'string', description: 'Producer / winery name' },
  wineName: { type: 'string', description: 'Wine name (cuvee/bottling), without producer or vintage' },
  vintage: { type: 'number', description: '4-digit vintage year' },
  country: { type: 'string', description: 'e.g. France, Italy, United States' },
  region: { type: 'string', description: 'e.g. Bordeaux, Napa Valley' },
  subRegion: { type: 'string' },
  classification: { type: 'string', description: 'e.g. Grand Cru, 1er Cru, DOCG' },
  varietal: { type: 'string', description: 'Primary grape variety or blend name' },
  format: { type: 'string', description: 'Bottle size, e.g. 750mL (Standard), 1.5L (Magnum)' },
  style: { type: 'string', description: 'Wine style/color, e.g. Red, White, Rosé, Sparkling, Dessert, Fortified' },
  quantity: { type: 'number', description: 'Number of bottles' },
  purchasePrice: { type: 'number', description: 'Price per bottle' },
  purchaseDate: { type: 'string', description: 'ISO 8601 date, e.g. 2024-03-15' },
  vendor: { type: 'string' },
  storageLocation: { type: 'string' },
  currentEstValue: { type: 'number', description: 'Current estimated market value per bottle' },
  rating: { type: 'number', description: 'Critic or personal score out of 100' },
  drinkWindowStart: { type: 'number', description: '4-digit year the wine begins drinking well' },
  drinkWindowEnd: { type: 'number', description: '4-digit year by which the wine should be drunk' },
  tastingNotes: { type: 'string', description: 'Tasting notes describing aroma, flavor, and structure' },
  pairingNotes: { type: 'string', description: 'Food pairing suggestions' },
  wineId: { type: 'string', description: 'An inventory or lot ID assigned by the collector or seller' },
  notes: { type: 'string' },
}

const mappedWineDataSchema = z.object({
  producer: z.string().optional(),
  wineName: z.string().optional(),
  vintage: z.number().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  subRegion: z.string().optional(),
  classification: z.string().optional(),
  varietal: z.string().optional(),
  format: z.string().optional(),
  style: z.string().optional(),
  quantity: z.number().optional(),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  vendor: z.string().optional(),
  storageLocation: z.string().optional(),
  currentEstValue: z.number().optional(),
  rating: z.number().optional(),
  drinkWindowStart: z.number().optional(),
  drinkWindowEnd: z.number().optional(),
  tastingNotes: z.string().optional(),
  pairingNotes: z.string().optional(),
  wineId: z.string().optional(),
  notes: z.string().optional(),
})

const confidenceScoresSchema = z.record(z.string(), z.number())

const extractedRowSchema = z.object({
  mappedData: mappedWineDataSchema,
  confidenceScores: confidenceScoresSchema,
})

const extractedRowsSchema = z.object({
  wines: z.array(extractedRowSchema),
})

const columnMappingSchema = z.object({
  mapping: z.record(z.string(), z.string().nullable()),
})

export interface ExtractedRow {
  mappedData: MappedWineData
  confidenceScores: ConfidenceScores
}

function extractToolInput(
  message: { content: Array<{ type: string; name?: string; input?: unknown }> },
  toolName: string
): unknown {
  const block = message.content.find((b) => b.type === 'tool_use' && b.name === toolName)
  return block?.input
}

export async function suggestColumnMapping(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<Record<string, string | null>> {
  const targetFieldList = IMPORT_TARGET_FIELDS.map((f) => `- ${f.key}: ${f.label}`).join('\n')

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    tools: [
      {
        name: 'suggest_mapping',
        description:
          'Map each source spreadsheet column header to the matching target wine field, or null if no field matches.',
        input_schema: {
          type: 'object',
          properties: {
            mapping: {
              type: 'object',
              description:
                'Keys are the exact source column headers provided. Values are one of the target field keys listed, or null if the column has no corresponding wine field.',
              additionalProperties: { type: ['string', 'null'] },
            },
          },
          required: ['mapping'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'suggest_mapping' },
    messages: [
      {
        role: 'user',
        content: `Map each source spreadsheet column header to one of these target wine fields, or null if there's no good match:\n${targetFieldList}\n\nSource headers: ${JSON.stringify(headers)}\n\nSample rows:\n${JSON.stringify(sampleRows, null, 2)}`,
      },
    ],
  })

  const parsed = columnMappingSchema.safeParse(extractToolInput(message, 'suggest_mapping'))
  if (!parsed.success) return {}

  const validKeys = new Set<string>(IMPORT_TARGET_FIELDS.map((f) => f.key))
  const mapping: Record<string, string | null> = {}
  for (const header of headers) {
    const value = parsed.data.mapping[header]
    mapping[header] = value && validKeys.has(value) ? value : null
  }
  return mapping
}

export async function extractWinesFromText(text: string, attempt = 0): Promise<ExtractedRow[]> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    tools: [
      {
        name: 'extract_wines',
        description:
          'Record structured wine data extracted from the source document. Include one entry per distinct wine line item found.',
        input_schema: {
          type: 'object',
          properties: {
            wines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  mappedData: {
                    type: 'object',
                    description: 'Wine fields extracted for this line item. Omit fields you cannot determine.',
                    properties: WINE_FIELD_PROPERTIES,
                  },
                  confidenceScores: {
                    type: 'object',
                    description: 'Confidence from 0 to 1 for each field present in mappedData.',
                    additionalProperties: { type: 'number' },
                  },
                },
                required: ['mappedData', 'confidenceScores'],
              },
            },
          },
          required: ['wines'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'extract_wines' },
    messages: [
      {
        role: 'user',
        content: `Extract every individual wine line item from this invoice/inventory text. For each wine, fill in as many fields as you can confidently determine and give a confidence score (0-1) for each field you populate. Omit fields you cannot determine rather than guessing.\n\nText:\n${text}`,
      },
    ],
  })

  const parsed = extractedRowsSchema.safeParse(extractToolInput(message, 'extract_wines'))
  if (!parsed.success) {
    if (attempt === 0) return extractWinesFromText(text, 1)
    return []
  }
  return parsed.data.wines
}

export async function extractWinesFromPdf(pages: string[], batchSize: number): Promise<ExtractedRow[]> {
  const results: ExtractedRow[] = []

  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize)
    const text = batch.join('\n\n--- Page break ---\n\n')
    if (!text.trim()) continue

    const extracted = await extractWinesFromText(text)
    results.push(...extracted)
  }

  return results
}

export async function extractWinesFromImage(
  base64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  attempt = 0
): Promise<ExtractedRow[]> {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    tools: [
      {
        name: 'extract_wines',
        description:
          'Record structured wine data extracted from an image. Include one entry per distinct wine found.',
        input_schema: {
          type: 'object',
          properties: {
            wines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  mappedData: {
                    type: 'object',
                    description: 'Wine fields identified for this wine. Omit fields you cannot determine.',
                    properties: WINE_FIELD_PROPERTIES,
                  },
                  confidenceScores: {
                    type: 'object',
                    description: 'Confidence from 0 to 1 for each field present in mappedData.',
                    additionalProperties: { type: 'number' },
                  },
                },
                required: ['mappedData', 'confidenceScores'],
              },
            },
          },
          required: ['wines'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'extract_wines' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64 },
          },
          {
            type: 'text',
            text: 'This image is one of: a photo of a wine label, a photo of a paper invoice or receipt, or a screenshot of an HTML invoice/order confirmation. Extract every distinct wine. A label photo is typically a single wine; an invoice or receipt may list several. For each wine, fill in as many fields as you can confidently determine (producer, wine name, vintage, country, region, varietal, classification, format, style, quantity, purchase price, purchase date, vendor, current estimated value, rating, drink window, tasting/pairing notes, wine ID, etc.) and give a confidence score (0-1) for each field you populate. Omit fields you cannot determine rather than guessing.',
          },
        ],
      },
    ],
  })

  const parsed = extractedRowsSchema.safeParse(extractToolInput(message, 'extract_wines'))
  if (!parsed.success) {
    if (attempt === 0) return extractWinesFromImage(base64, mimeType, 1)
    return []
  }
  return parsed.data.wines
}
