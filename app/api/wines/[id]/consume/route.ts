import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'

interface RouteParams {
  params: { id: string }
}

export async function POST(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const wine = await prisma.wine.findFirst({ where: { id: params.id, userId: user.id } })
  if (!wine) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const quantity = Math.max(1, Math.min(body.quantity ?? 1, wine.quantity - wine.consumedQuantity))

  if (quantity <= 0) {
    return NextResponse.json({ error: 'No bottles remaining to consume' }, { status: 400 })
  }

  const newConsumedQuantity = wine.consumedQuantity + quantity
  const isFullyConsumed = newConsumedQuantity >= wine.quantity

  await prisma.$transaction([
    prisma.consumptionLog.create({
      data: {
        wineId: wine.id,
        userId: user.id,
        quantity,
        consumedDate: body.consumedDate ? new Date(body.consumedDate) : new Date(),
        occasion: body.occasion ?? null,
        notes: body.notes ?? null,
        rating: body.rating ?? null,
      },
    }),
    prisma.wine.update({
      where: { id: wine.id },
      data: { consumedQuantity: newConsumedQuantity, isFullyConsumed },
    }),
  ])

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/cellar')
  revalidatePath(`/dashboard/cellar/${wine.id}`)

  return NextResponse.json({ success: true })
}
