import { prisma } from '@/lib/prisma/client'
import type { Import, ImportRow } from '@prisma/client'

export async function listImports(userId: string): Promise<Import[]> {
  return prisma.import.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRecentImports(userId: string, limit = 5): Promise<Import[]> {
  return prisma.import.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getImport(
  userId: string,
  id: string
): Promise<(Import & { rows: ImportRow[] }) | null> {
  return prisma.import.findFirst({
    where: { id, userId },
    include: { rows: { orderBy: { id: 'asc' } } },
  })
}
