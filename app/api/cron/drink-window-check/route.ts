import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron/auth'
import { prisma } from '@/lib/prisma/client'
import { sendEmail } from '@/lib/email/send'
import { drinkWindowDigestEmail } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const currentYear = new Date().getFullYear()

  const wines = await prisma.wine.findMany({
    where: {
      isFullyConsumed: false,
      drinkWindowStart: { lte: currentYear },
      drinkWindowEnd: { gte: currentYear },
    },
    include: { user: true },
  })

  if (wines.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const existingAlerts = await prisma.cellarAlert.findMany({
    where: {
      alertType: 'DRINK_WINDOW',
      wineId: { in: wines.map((w) => w.id) },
      createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
    },
    select: { wineId: true },
  })
  const alreadyAlerted = new Set(existingAlerts.map((a) => a.wineId))

  const newWines = wines.filter((w) => !alreadyAlerted.has(w.id))
  if (newWines.length === 0) {
    return NextResponse.json({ sent: 0, skipped: wines.length })
  }

  const byUser = new Map<string, typeof newWines>()
  for (const wine of newWines) {
    const existing = byUser.get(wine.userId) || []
    existing.push(wine)
    byUser.set(wine.userId, existing)
  }

  let sent = 0
  for (const [userId, userWines] of byUser) {
    const user = userWines[0].user
    const html = drinkWindowDigestEmail(userWines)

    try {
      await sendEmail(user.email, 'Wines to Enjoy Now - Wine Butler AI', html)

      for (const wine of userWines) {
        await prisma.cellarAlert.create({
          data: {
            userId,
            wineId: wine.id,
            alertType: 'DRINK_WINDOW',
            message: `${wine.producer} ${wine.wineName} is in its drink window (${wine.drinkWindowStart}-${wine.drinkWindowEnd})`,
            triggerDate: new Date(),
          },
        })
      }

      sent++
    } catch (err) {
      console.error(`Failed to send drink window email to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, wines: newWines.length })
}
