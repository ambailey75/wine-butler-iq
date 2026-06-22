import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth/current-user'
import { prisma } from '@/lib/prisma/client'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.cellarAlert.updateMany({
    where: { userId: user.id, dismissedAt: null },
    data: { dismissedAt: new Date() },
  })

  revalidatePath('/dashboard/alerts')
  return NextResponse.json({ success: true })
}
