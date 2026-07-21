// One-time population script for the region_authority table.
// Run with: npm run populate-region-authority
//
// Built as a local script instead of a deployed API route (2026-07-20)
// after the Vercel route hit repeated transient failures against
// Wikidata's public endpoint (a connection "terminated," then a real
// 502 Bad Gateway) — this project's own machine has had reliable
// internet all session, so running it here sidesteps whatever is
// making the connection unstable from Vercel specifically, and lets
// this be re-run instantly without a commit/push/redeploy cycle.
//
// Uses relative imports (not @/lib/...) so this runs standalone via
// ts-node outside Next's bundler — see scripts/tsconfig.json, same
// pattern as scripts/normalize-cellar.ts.
//
// Requires DATABASE_URL in the environment (same as any other script
// here — run `reload-env` first if it's been a while since it loaded).
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '../lib/prisma/client'
import { fetchFullRegionAuthorityTable } from '../lib/wines/region-hierarchy-checker'

const INSERT_BATCH_SIZE = 500
// Cache so a re-run (e.g. after fixing an unrelated insert-step bug)
// doesn't need to wait through another ~3-minute Wikidata fetch.
const CACHE_PATH = join(__dirname, '.region-authority-cache.json')

async function main() {
  const startedAt = Date.now()

  type Row = Awaited<ReturnType<typeof fetchFullRegionAuthorityTable>>[number]
  let rows: Row[]
  if (existsSync(CACHE_PATH)) {
    console.log(`Using cached fetch from ${CACHE_PATH} (delete this file to force a fresh Wikidata fetch)`)
    rows = JSON.parse(readFileSync(CACHE_PATH, 'utf-8'))
    console.log(`Loaded ${rows.length} cached rows`)
  } else {
    console.log('Fetching from Wikidata...')
    rows = await fetchFullRegionAuthorityTable()
    console.log(`Fetched ${rows.length} rows in ${Date.now() - startedAt}ms`)
    writeFileSync(CACHE_PATH, JSON.stringify(rows))
    console.log(`Cached to ${CACHE_PATH}`)
  }

  if (rows.length === 0) {
    console.error('fetchFullRegionAuthorityTable() returned zero rows — refusing to wipe existing data with an empty result.')
    process.exit(1)
  }

  console.log('Clearing prior WIKIDATA-sourced rows (WINERYMAP rows untouched)...')
  const deleted = await prisma.regionAuthority.deleteMany({
    where: { source: 'WIKIDATA' },
  })
  console.log(`Deleted ${deleted.count} prior WIKIDATA rows`)

  let inserted = 0
  const errors: string[] = []

  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + INSERT_BATCH_SIZE)
    try {
      const result = await prisma.regionAuthority.createMany({
        data: batch.map((r) => ({
          appellation: r.appellation,
          locatedIn: r.locatedIn,
          country: r.country,
          source: 'WIKIDATA' as const,
          externalId: r.wikidataId || null,
        })),
        skipDuplicates: true,
      })
      inserted += result.count
      console.log(`Batch ${i}-${i + batch.length}: inserted ${result.count}`)
    } catch (e) {
      const msg = `batch starting at row ${i}: ${e instanceof Error ? e.message : String(e)}`
      errors.push(msg)
      console.error(msg)
    }
  }

  console.log('---')
  console.log(`Done in ${Date.now() - startedAt}ms`)
  console.log(`Fetched: ${rows.length}, Deleted prior: ${deleted.count}, Inserted: ${inserted}`)
  if (errors.length > 0) {
    console.log(`Batch errors: ${errors.length}`)
    errors.forEach((e) => console.log(`  - ${e}`))
  }

  await prisma.$disconnect()
  process.exit(errors.length > 0 ? 1 : 0)
}

main().catch(async (e) => {
  console.error('Fatal error:', e instanceof Error ? e.message : String(e))
  await prisma.$disconnect()
  process.exit(1)
})
