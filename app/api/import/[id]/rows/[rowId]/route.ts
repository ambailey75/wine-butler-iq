import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import type { Prisma } from '@prisma/client'

interface RouteParams {
  params: { id: string; rowId: string }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const importRecord = await prisma.import.findFirst({ where: { id: params.id, userId: user.id } })
  if (!importRecord) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const row = await prisma.importRow.findFirst({
    where: { id: params.rowId, importId: importRecord.id },
  })
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const data: Prisma.ImportRowUpdateInput = {}

  if (body.mappedData !== undefined && typeof body.mappedData === 'object') {
    data.mappedData = body.mappedData
  }

  if (body.status === 'PENDING' || body.status === 'SKIPPED') {
    data.status = body.status
  }

  const updated = await prisma.importRow.update({ where: { id: row.id }, data })

  return NextResponse.json(updated)
}
