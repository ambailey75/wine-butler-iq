import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { applyColumnMapping } from '@/lib/import/excel'

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

  await Promise.all(
    importRecord.rows.map((row) => {
      const rawData = (row.rawData ?? {}) as unknown as Record<string, string>
      const { mappedData, confidenceScores } = applyColumnMapping(rawData, mapping)
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
