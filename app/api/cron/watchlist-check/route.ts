import { NextRequest, NextResponse } from 'next/server'
import { verifyCronSecret } from '@/lib/cron/auth'
import { prisma } from '@/lib/prisma/client'
import { sendEmail } from '@/lib/email/send'
import { watchListReminderEmail } from '@/lib/email/templates'

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const dueItems = await prisma.watchListItem.findMany({
    where: {
      notified: false,
      targetDate: {
        gte: now,
        lte: sevenDaysOut,
      },
    },
    include: { user: true },
  })

  if (dueItems.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const byUser = new Map<string, typeof dueItems>()
  for (const item of dueItems) {
    const existing = byUser.get(item.userId) || []
    existing.push(item)
    byUser.set(item.userId, existing)
  }

  let sent = 0
  for (const [userId, items] of byUser) {
    const user = items[0].user
    const html = watchListReminderEmail(items)

    try {
      await sendEmail(user.email, 'Watch List Reminder - Wine Butler AI', html)

      await prisma.watchListItem.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { notified: true },
      })

      for (const item of items) {
        await prisma.cellarAlert.create({
          data: {
            userId,
            alertType: 'WATCH_LIST_REMINDER',
            message: `${item.producer}${item.wineName ? ` ${item.wineName}` : ''} target date approaching`,
            triggerDate: item.targetDate!,
          },
        })
      }

      sent++
    } catch (err) {
      console.error(`Failed to send watchlist email to ${user.email}:`, err)
    }
  }

  return NextResponse.json({ sent, items: dueItems.length })
}
