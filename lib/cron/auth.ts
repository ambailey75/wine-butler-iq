import type { NextRequest } from 'next/server'

export function verifyCronSecret(request: NextRequest): boolean {
  const header = request.headers.get('authorization')
  return header === `Bearer ${process.env.CRON_SECRET}`
}
