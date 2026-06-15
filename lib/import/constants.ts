import type { ImportSourceType } from '@prisma/client'

export const IMPORTS_BUCKET = 'imports'
export const LABELS_BUCKET = 'labels'

export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB per CLAUDE.md
export const MAX_PDF_PAGES = 100
export const MAX_CSV_ROWS = 5000
export const PDF_PAGE_BATCH_SIZE = 15
export const LOW_CONFIDENCE_THRESHOLD = 0.6

export const ALLOWED_MIME_TYPES: Record<ImportSourceType, string[]> = {
  EXCEL: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ],
  CSV: ['text/csv', 'application/csv', 'application/vnd.ms-excel'],
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
}

const EXTENSION_SOURCE_TYPES: Record<string, ImportSourceType> = {
  csv: 'CSV',
  xlsx: 'EXCEL',
  xls: 'EXCEL',
  pdf: 'PDF',
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  png: 'IMAGE',
  webp: 'IMAGE',
  heic: 'IMAGE',
  heif: 'IMAGE',
}

export function detectSourceType(filename: string, mimeType: string): ImportSourceType | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext && ext in EXTENSION_SOURCE_TYPES) {
    return EXTENSION_SOURCE_TYPES[ext]
  }
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType === 'text/csv') return 'CSV'
  if (mimeType.includes('spreadsheet') || mimeType === 'application/vnd.ms-excel') return 'EXCEL'
  return null
}

export interface MappedWineData {
  producer?: string
  wineName?: string
  vintage?: number
  country?: string
  region?: string
  subRegion?: string
  classification?: string
  varietal?: string
  format?: string
  quantity?: number
  purchasePrice?: number
  purchaseDate?: string
  vendor?: string
  storageLocation?: string
  notes?: string
}

export type ConfidenceScores = Partial<Record<keyof MappedWineData, number>>

export interface ImportTargetField {
  key: keyof MappedWineData
  label: string
  type: 'string' | 'number' | 'date'
  required?: boolean
}

export const IMPORT_TARGET_FIELDS: ImportTargetField[] = [
  { key: 'producer', label: 'Producer', type: 'string', required: true },
  { key: 'wineName', label: 'Wine Name', type: 'string', required: true },
  { key: 'vintage', label: 'Vintage', type: 'number' },
  { key: 'country', label: 'Country', type: 'string' },
  { key: 'region', label: 'Region', type: 'string' },
  { key: 'subRegion', label: 'Sub-Region', type: 'string' },
  { key: 'classification', label: 'Classification', type: 'string' },
  { key: 'varietal', label: 'Varietal', type: 'string' },
  { key: 'format', label: 'Format', type: 'string' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'purchasePrice', label: 'Purchase Price', type: 'number' },
  { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
  { key: 'vendor', label: 'Vendor', type: 'string' },
  { key: 'storageLocation', label: 'Storage Location', type: 'string' },
  { key: 'notes', label: 'Notes', type: 'string' },
]
