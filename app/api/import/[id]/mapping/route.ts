import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { applyColumnMapping } from '@/lib/import/excel'
import { splitRegionValue, splitCountryStateValue } from '@/lib/import/claude-extractor'
import type { MappedWineData } from '@/lib/import/constants'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await prisma.import.findFirst({
    where: { id: params.id, userId: user.id },
    include: { rows: true },
  })
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const mapping = body?.mapping
  if (!mapping || typeof mapping !== 'object') {
    return NextResponse.json({ error: 'mapping is required' }, { status: 400 })
  }

  const regionSplits: Record<string, string> = body?.regionSplits ?? {}
  const countryStateSplits: Record<string, string> = body?.countryStateSplits ?? {}

  await Promise.all(
    importRecord.rows.map((row) => {
      const rawData = (row.rawData ?? {}) as unknown as Record<string, string>
      const { mappedData, confidenceScores } = applyColumnMapping(rawData, mapping)

      for (const [header, separator] of Object.entries(regionSplits)) {
        const rawValue = rawData[header]?.trim()
        if (!rawValue) continue
        const { region, subRegion } = splitRegionValue(rawValue, separator)
        const typed = mappedData as MappedWineData
        typed.region = region
        if (subRegion) {
          typed.subRegion = subRegion
        }
      }

      for (const [header, separator] of Object.entries(countryStateSplits)) {
        const rawValue = rawData[header]?.trim()
        if (!rawValue) continue
        const { country, state } = splitCountryStateValue(rawValue, separator)
        const typed = mappedData as MappedWineData
        typed.country = country
        if (state) {
          typed.state = state
        }
      }

      return prisma.importRow.update({
        where: { id: row.id },
        data: {
          mappedData: mappedData as unknown as Prisma.InputJsonValue,
          confidenceScores: confidenceScores as unknown as Prisma.InputJsonValue,
        },
      })
    })
  )

  return NextResponse.json({ success: true })
}
