import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'
import { tastingNoteSchema } from '@/lib/tastings/schema'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notes = await prisma.tastingNote.findMany({
    where: { userId: user.id },
    orderBy: { tastedDate: 'desc' },
  })

  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = tastingNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { producer, wineName, vintage, rating, liked, notes, occasion, tastedDate } = parsed.data

  const note = await prisma.tastingNote.create({
    data: {
      userId: user.id,
      producer,
      wineName,
      vintage: vintage ?? null,
      rating: rating ?? null,
      liked: liked ?? null,
      notes: notes || null,
      occasion: occasion || null,
      tastedDate: tastedDate ? new Date(tastedDate) : new Date(),
    },
  })

  revalidatePath('/dashboard/tastings')
  return NextResponse.json(note, { status: 201 })
}
