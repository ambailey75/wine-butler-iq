import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { tastingNoteSchema } from '@/lib/tastings/schema'

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const note = await prisma.tastingNote.findFirst({
    where: { id: params.id, userId: user.id },
  })

  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(note)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.tastingNote.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const parsed = tastingNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { producer, wineName, vintage, rating, liked, notes, occasion, tastedDate } = parsed.data

  const updated = await prisma.tastingNote.update({
    where: { id: params.id },
    data: {
      producer,
      wineName,
      vintage: vintage ?? null,
      rating: rating ?? null,
      liked: liked ?? null,
      notes: notes || null,
      occasion: occasion || null,
      tastedDate: tastedDate ? new Date(tastedDate) : undefined,
    },
  })

  revalidatePath('/dashboard/tastings')
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.tastingNote.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.tastingNote.delete({ where: { id: params.id } })

  revalidatePath('/dashboard/tastings')
  return NextResponse.json({ success: true })
}
