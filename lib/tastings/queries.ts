import { prisma } from '@/lib/prisma/client'
import type { TastingNote } from '@prisma/client'

export type SerializedTastingNote = Omit<TastingNote, 'rating'> & {
  rating: number | null
}

export function serializeTastingNote(note: TastingNote): SerializedTastingNote {
  return {
    ...note,
    rating: note.rating ? note.rating.toNumber() : null,
  }
}

export function serializeTastingNotes(notes: TastingNote[]): SerializedTastingNote[] {
  return notes.map(serializeTastingNote)
}

export async function listTastingNotes(userId: string): Promise<TastingNote[]> {
  return prisma.tastingNote.findMany({
    where: { userId },
    orderBy: { tastedDate: 'desc' },
  })
}

export async function getTastingNote(userId: string, id: string): Promise<TastingNote | null> {
  return prisma.tastingNote.findFirst({
    where: { id, userId },
  })
}
