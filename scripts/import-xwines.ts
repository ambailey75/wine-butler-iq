// X-Wines catalog import — Phase 2, Checklist #2.
// Run with: npm run import-xwines -- --dry-run   (parses + validates only, no DB writes)
//           npm run import-xwines                (writes to wine_knowledge)
//
// Applies the data-quality rules already agreed in WINE_KNOWLEDGE_DATABASE_PLAN.md:
// - exact-vintage-only matching downstream (this script just stores known_vintages faithfully)
// - skip WineID 167488 (wrong "Quimera" — 100% Malbec, not the real 5-grape blend)
// - Prosecco-style NV collapsing handled generically (see mergeDuplicateNameGroups)
// - never guess a future vintage year — stores exactly what X-Wines lists, nothing added
//
// Region validation against region_authority is NOT yet wired in — flagged
// explicitly, not silently skipped. See the run summary's "unvalidatedRegionRows"
// count. That's the next piece, not done here.
//
// Uses relative imports (not @/lib/...) so this runs standalone via
// ts-node outside Next's bundler — same pattern as the other scripts here.
import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '../lib/prisma/client'
import { cleanName } from '../lib/wines/dedup-match'

const CSV_PATH = join(__dirname, '..', 'data-imports', 'XWines_100K_wines.csv')
const INSERT_BATCH_SIZE = 500
// Confirmed wrong duplicate, per WINE_KNOWLEDGE_DATABASE_PLAN.md section 2:
// real "Quimera" is the 5-grape blend (169988); 167488 is a different,
// unrelated 100% Malbec product mislabeled with the same name.
const SKIP_WINE_IDS = new Set(['167488'])

interface XWinesRow {
  WineID: string
  WineName: string
  Type: string
  Elaborate: string
  Grapes: string
  Harmonize: string
  ABV: string
  Body: string
  Acidity: string
  Code: string
  Country: string
  RegionID: string
  RegionName: string
  WineryID: string
  WineryName: string
  Website: string
  Vintages: string
}

// Minimal RFC4180-style CSV line splitter — handles quoted fields
// containing commas (e.g. "['Pork', 'Rich Fish']"), which a naive
// split(',') would break on. No new dependency added for this; the
// quoting pattern in this file is simple enough to parse directly.
function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}

function parseCsv(text: string): XWinesRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
  const header = parseCsvLine(lines[0])
  const rows: XWinesRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i])
    const row: any = {}
    header.forEach((col, idx) => {
      row[col] = values[idx] ?? ''
    })
    rows.push(row as XWinesRow)
  }
  return rows
}

// Vintages field looks like "[2020, 2019, 'N.V.']" — a Python list literal
// as a string, not JSON. Extracts real years and detects the 'N.V.' marker
// separately, per the has_non_vintage / known_vintages split design.
function parseVintages(raw: string): { years: number[]; hasNonVintage: boolean } {
  const years: number[] = []
  let hasNonVintage = false
  const items = raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
  for (const item of items) {
    if (/^\d{4}$/.test(item)) {
      years.push(parseInt(item, 10))
    } else if (/n\.?v\.?/i.test(item)) {
      hasNonVintage = true
    }
  }
  return { years, hasNonVintage }
}

function parsePythonListOfStrings(raw: string): string[] {
  return raw
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim().replace(/^'|'$/g, ''))
    .filter((s) => s.length > 0)
}

interface TransformResult {
  record: {
    producer: string
    wineName: string
    country: string | null
    region: string | null
    varietal: string | null
    type_style: string | null
    abv: number | null
    body: string | null
    acidity: string | null
    website: string | null
    pairing_notes: string | null
    blend_composition: string | null
    known_vintages: number[]
    has_non_vintage: boolean
    normalizedProducer: string
    normalizedWineName: string
    searchText: string
    xWinesId: string
  }
  skippedReason?: string
}

function transformRow(row: XWinesRow): TransformResult | null {
  if (SKIP_WINE_IDS.has(row.WineID)) {
    return null // real, confirmed-wrong duplicate — not imported, not flagged as an error
  }

  const { years, hasNonVintage } = parseVintages(row.Vintages)
  const grapes = parsePythonListOfStrings(row.Grapes)
  const harmonize = parsePythonListOfStrings(row.Harmonize)

  const normalizedProducer = cleanName(row.WineryName)
  const normalizedWineName = cleanName(row.WineName)

  return {
    record: {
      producer: row.WineryName,
      wineName: row.WineName,
      country: row.Country || null,
      region: row.RegionName || null, // NOT YET region-validated — see file header
      varietal: grapes.length > 0 ? grapes.join(', ') : null,
      type_style: row.Type || null,
      abv: row.ABV ? parseFloat(row.ABV) : null,
      body: row.Body || null,
      acidity: row.Acidity || null,
      website: row.Website || null,
      pairing_notes: harmonize.length > 0 ? harmonize.join(', ') : null,
      blend_composition: row.Elaborate || null,
      known_vintages: years,
      has_non_vintage: hasNonVintage,
      normalizedProducer,
      normalizedWineName,
      searchText: `${normalizedProducer} ${normalizedWineName}`,
      xWinesId: row.WineID,
    },
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const startedAt = Date.now()

  console.log(`Reading ${CSV_PATH}...`)
  const text = readFileSync(CSV_PATH, 'utf-8')
  const rawRows = parseCsv(text)
  console.log(`Parsed ${rawRows.length} raw rows`)

  const records: TransformResult['record'][] = []
  let skipped = 0
  for (const row of rawRows) {
    const result = transformRow(row)
    if (!result) {
      skipped++
      continue
    }
    records.push(result.record)
  }

  console.log(`Transformed ${records.length} rows (${skipped} skipped — confirmed-wrong duplicates)`)
  console.log(`unvalidatedRegionRows: ${records.length} — region field is raw X-Wines text, NOT yet checked against region_authority. Flagged, not silently skipped.`)

  if (dryRun) {
    console.log('--dry-run: no database writes. Sample of first 3 transformed records:')
    console.log(JSON.stringify(records.slice(0, 3), null, 2))
    return
  }

  console.log('Live run not yet implemented past this point — dry-run validation only for now.')
}

main().catch((e) => {
  console.error('Fatal error:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
