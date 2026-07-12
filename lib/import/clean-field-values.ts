// Cleans stray separator symbols users often leave in spreadsheet/extracted
// data when they combined two values in one column, e.g. "Napa Valley >
// Spring Mountain" or "Bordeaux | Pauillac". Only separators padded with
// spaces on both sides are treated as delimiters, so compound names like
// "Châteauneuf-du-Pape" or varietal blends like "Cab / Merlot / P. verdot"
// are left untouched.
const SPLIT_SEPARATORS = [' > ', ' | ', ' / ', ' - ', ' . ']
const BARE_SEPARATOR_CHARS = ['>', '|', '/', '-', '.']

// Fields where a mid-value separator is treated as combining two distinct
// values rather than being part of the value itself.
const SPLITTABLE_FIELDS = new Set(['region', 'subRegion', 'country', 'state', 'vineyard', 'classification'])

// Of the splittable fields, only these two have a documented sibling field to
// receive the second half of the split.
const PAIRED_FIELD: Record<string, string> = {
  region: 'subRegion',
  country: 'state',
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function stripTrailingPunctuation(value: string): string {
  return value.replace(/[,;|]+$/g, '').trim()
}

function stripLeadingTrailingSeparators(value: string): string {
  let result = value.trim()
  let changed = true
  while (changed) {
    changed = false
    for (const sep of BARE_SEPARATOR_CHARS) {
      if (result.startsWith(sep)) {
        result = result.slice(sep.length).trim()
        changed = true
      }
      if (result.endsWith(sep)) {
        result = result.slice(0, -sep.length).trim()
        changed = true
      }
    }
  }
  return result
}

function isOnlySeparators(value: string): boolean {
  return value.length > 0 && /^[>|/.\-,;\s]+$/.test(value)
}

/**
 * Cleans a single field value: trims, collapses whitespace, strips stray
 * leading/trailing separator symbols and trailing punctuation, and — for
 * geographic fields — truncates to the first segment when a mid-value
 * separator combines two values (the second half is available via
 * `extractPairedValue` for the region -> subRegion / country -> state case).
 */
export function cleanFieldValue(value: string, fieldName: string): string {
  if (typeof value !== 'string') return value

  let result = collapseSpaces(value)
  if (!result) return ''

  if (SPLITTABLE_FIELDS.has(fieldName)) {
    for (const sep of SPLIT_SEPARATORS) {
      const idx = result.indexOf(sep)
      if (idx > -1) {
        result = result.slice(0, idx).trim()
        break
      }
    }
  }

  result = stripLeadingTrailingSeparators(result)
  result = stripTrailingPunctuation(result)
  result = collapseSpaces(result)

  if (!result || isOnlySeparators(result)) return ''

  return result
}

/**
 * Returns the second half of a "region > subRegion" / "country > state"
 * style combined value, or null if the field isn't a pairable field or has
 * no mid-value separator.
 */
export function extractPairedValue(value: string, fieldName: string): string | null {
  if (typeof value !== 'string') return null
  if (!(fieldName in PAIRED_FIELD)) return null

  const collapsed = collapseSpaces(value)
  for (const sep of SPLIT_SEPARATORS) {
    const idx = collapsed.indexOf(sep)
    if (idx > -1) {
      const second = stripLeadingTrailingSeparators(stripTrailingPunctuation(collapsed.slice(idx + sep.length)))
      return second && !isOnlySeparators(second) ? second : null
    }
  }
  return null
}

/**
 * Applies cleanFieldValue across an entire mapped-wine-data-shaped object.
 * Splittable fields (region, country) fill their paired field (subRegion,
 * state) with the second half of a combined value, but only when the paired
 * field is currently blank — an existing value is never overwritten.
 */
export function cleanMappedData<T extends object>(mapped: T): T {
  const result = { ...mapped } as Record<string, unknown>

  for (const [field, pairedField] of Object.entries(PAIRED_FIELD)) {
    const value = result[field]
    if (typeof value !== 'string') continue
    const pairedValue = extractPairedValue(value, field)
    if (pairedValue && !result[pairedField]) {
      result[pairedField] = pairedValue
    }
  }

  for (const [key, value] of Object.entries(result)) {
    if (typeof value !== 'string') continue
    const cleaned = cleanFieldValue(value, key)
    result[key] = cleaned || undefined
  }

  return result as T
}
