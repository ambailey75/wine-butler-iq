import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'

interface RouteParams {
  params: { id: string }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alert = await prisma.cellarAlert.findFirst({
    where: { id: params.id, userId: user.id },
  })
  if (!alert) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.cellarAlert.update({
    where: { id: params.id },
    data: { dismissedAt: new Date() },
  })

  revalidatePath('/dashboard/alerts')
  return NextResponse.json({ success: true })
}
