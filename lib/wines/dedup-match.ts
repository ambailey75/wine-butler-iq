// Cross-source dedup matching for wine_knowledge (Phase 2, Checklist #3).
// New logic, not a reuse of lib/import/find-merge-match.ts — that matcher
// does exact-text-only identity matching against a single user's own
// cellar; this does fuzzy similarity matching across sources (X-Wines,
// user imports, etc.) at 100,000+ row scale. Design per PHASE2_READINESS.md.
//
// Thresholds (0.92 auto-match / 0.75 review floor) are STARTING GUESSES,
// not yet proven — see validateDedupThresholds() below, which is the
// actual validation step this module exists to support.

const ABBREVIATIONS: Array<[RegExp, string]> = [
  [/\bch\.?\b/gi, 'chateau'],
  [/\bdom\.?\b/gi, 'domaine'],
  [/\bcave\.?\b/gi, 'cave'],
]

// Strips accents, lowercases, expands common abbreviations, collapses
// punctuation/whitespace. Same cleanup family used elsewhere in this
// project (region-hierarchy-checker's Greek handling, wine-knowledge's
// spelling corrections) but built fresh here for producer/wine-name text.
export function cleanName(raw: string): string {
  let s = raw.normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
  s = s.toLowerCase()
  for (const [pattern, replacement] of ABBREVIATIONS) {
    s = s.replace(pattern, replacement)
  }
  s = s.replace(/[^a-z0-9\s]/g, ' ') // punctuation -> space
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = new Array(n + 1)
  let curr = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j

  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + cost // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }
  return prev[n]
}

// 1.0 = identical after cleanup, 0.0 = completely different, scaled by
// the longer of the two cleaned strings so short names aren't unfairly
// penalized by a fixed-distance cutoff.
export function similarityScore(a: string, b: string): number {
  const cleanA = cleanName(a)
  const cleanB = cleanName(b)
  if (cleanA === cleanB) return 1
  const maxLen = Math.max(cleanA.length, cleanB.length)
  if (maxLen === 0) return 1
  const distance = levenshtein(cleanA, cleanB)
  return 1 - distance / maxLen
}

export const AUTO_MATCH_THRESHOLD = 0.92
export const REVIEW_FLOOR_THRESHOLD = 0.75

export interface MatchCandidate {
  producer: string
  wineName: string
  vintage: number | null // null = non-vintage (NV)
  format: string | null
}

export type MatchClassification = 'AUTO_MATCH' | 'REVIEW' | 'DIFFERENT'

export interface MatchResult {
  classification: MatchClassification
  score: number
  reason: string
}

// Combines producer + wine name into one comparison string, per the
// design in PHASE2_READINESS.md — cleanup then compare, not two separate
// scores, so "Domaine Leroy" vs "Domaine Leflaive" (same first word,
// different producer) doesn't get an inflated score from the shared
// "domaine" prefix.
export function classifyMatch(a: MatchCandidate, b: MatchCandidate): MatchResult {
  // Hard rule: NV and any specific vintage never auto-match, regardless
  // of score — different products, not a fuzzy-matching question.
  const oneIsNvOtherIsnt = (a.vintage === null) !== (b.vintage === null)
  const vintageMismatch = !oneIsNvOtherIsnt && a.vintage !== null && b.vintage !== null && a.vintage !== b.vintage
  const formatMismatch = !!a.format && !!b.format && cleanName(a.format) !== cleanName(b.format)

  const nameA = `${a.producer} ${a.wineName}`
  const nameB = `${b.producer} ${b.wineName}`
  const score = similarityScore(nameA, nameB)

  if (oneIsNvOtherIsnt) {
    return { classification: 'REVIEW', score, reason: 'NV vs. specific vintage — never auto-matched regardless of score' }
  }

  if (score >= AUTO_MATCH_THRESHOLD && !vintageMismatch && !formatMismatch) {
    return { classification: 'AUTO_MATCH', score, reason: `score ${score.toFixed(3)} >= ${AUTO_MATCH_THRESHOLD}, vintage/format match` }
  }

  if (score >= REVIEW_FLOOR_THRESHOLD) {
    const why = vintageMismatch
      ? 'high score but vintage differs'
      : formatMismatch
        ? 'high score but format differs'
        : `score ${score.toFixed(3)} between ${REVIEW_FLOOR_THRESHOLD} and ${AUTO_MATCH_THRESHOLD}`
    return { classification: 'REVIEW', score, reason: why }
  }

  return { classification: 'DIFFERENT', score, reason: `score ${score.toFixed(3)} < ${REVIEW_FLOOR_THRESHOLD}` }
}
