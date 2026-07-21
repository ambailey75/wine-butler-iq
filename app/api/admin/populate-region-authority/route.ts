// TEMPORARY one-time population route — added 2026-07-20, safe to delete once run.
//
// Purpose: populate the region_authority table (schema live since migration
// 20260720180000_add_region_authority, zero rows so far) with real WIKIDATA
// rows via fetchFullRegionAuthorityTable(). Held back until now because
// query.wikidata.org's reachability from this project's real Vercel/Node
// runtime was unverified — that's resolved (see region-hierarchy-checker.ts
// file header, commit 08594f6). This is the first real run against production.
//
// Protected the same way the existing cron routes are (Bearer CRON_SECRET) —
// this writes real rows, so it should not be triggerable by anyone who finds
// the URL.
//
// Idempotent by design: deletes existing WIKIDATA-sourced rows before
// inserting, so re-running this after a fix or a data refresh doesn't
// create duplicates alongside stale rows. WINERYMAP-sourced rows (a
// different source, not touched by this route) are left alone.
//
// Delete this file once the table is confirmed populated and correct —
// same pattern as the debug route this replaces.
import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron/auth'
import { prisma } from '@/lib/prisma/client'
import { fetchFullRegionAuthorityTable } from '@/lib/wines/region-hierarchy-checker'

const INSERT_BATCH_SIZE = 500

// Gives Vercel up to 5 minutes for this one-time job (fetch + ~9,265-row
// batched insert) instead of the default timeout, which this could exceed.
export const maxDuration = 300

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()

  let rows: Awaited<ReturnType<typeof fetchFullRegionAuthorityTable>>
  try {
    rows = await fetchFullRegionAuthorityTable()
  } catch (e) {
    return NextResponse.json(
      {
        step: 'fetch',
        error: e instanceof Error ? e.message : String(e),
        elapsedMs: Date.now() - startedAt,
      },
      { status: 502 }
    )
  }

  if (rows.length === 0) {
    return NextResponse.json(
      {
        step: 'fetch',
        error: 'fetchFullRegionAuthorityTable() returned zero rows — refusing to wipe existing data with an empty result.',
        elapsedMs: Date.now() - startedAt,
      },
      { status: 502 }
    )
  }

  // Idempotent refresh: clear only WIKIDATA-sourced rows, leave WINERYMAP alone.
  const deleted = await prisma.regionAuthority.deleteMany({
    where: { source: 'WIKIDATA' },
  })

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
    } catch (e) {
      errors.push(
        `batch starting at row ${i}: ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }

  return NextResponse.json({
    step: 'done',
    fetchedRows: rows.length,
    deletedPriorWikidataRows: deleted.count,
    insertedRows: inserted,
    batchErrors: errors,
    elapsedMs: Date.now() - startedAt,
  })
}
