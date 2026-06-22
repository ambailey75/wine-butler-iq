import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { watchListSchema } from '@/lib/watchlist/schema'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.watchListItem.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = watchListSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { producer, wineName, vintage, notes, targetDate } = parsed.data

  const updated = await prisma.watchListItem.update({
    where: { id: params.id },
    data: {
      producer,
      wineName: wineName || null,
      vintage: vintage ?? null,
      notes: notes || null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  })

  revalidatePath('/dashboard/watchlist')
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.watchListItem.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.watchListItem.delete({ where: { id: params.id } })

  revalidatePath('/dashboard/watchlist')
  return NextResponse.json({ success: true })
}
