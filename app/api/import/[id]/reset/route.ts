import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'

interface RouteParams {
  params: { id: string }
}

// Resets column mapping back to the pre-mapping state so the user can remap
// without re-uploading — the original file already lives in Supabase Storage.
export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await prisma.import.findFirst({ where: { id: params.id, userId: user.id } })
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.importRow.updateMany({
    where: { importId: importRecord.id },
    data: {
      mappedData: Prisma.JsonNull,
      confidenceScores: Prisma.JsonNull,
      status: 'PENDING',
      wineId: null,
    },
  })

  await prisma.import.update({
    where: { id: importRecord.id },
    data: { status: 'REVIEW' },
  })

  return NextResponse.json({ success: true })
}
