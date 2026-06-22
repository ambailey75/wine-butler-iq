import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { watchListSchema } from '@/lib/watchlist/schema'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.watchListItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = watchListSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { producer, wineName, vintage, notes, targetDate } = parsed.data

  const item = await prisma.watchListItem.create({
    data: {
      userId: user.id,
      producer,
      wineName: wineName || null,
      vintage: vintage ?? null,
      notes: notes || null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  })

  revalidatePath('/dashboard/watchlist')
  return NextResponse.json(item, { status: 201 })
}
