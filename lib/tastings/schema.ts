import { z } from 'zod'

export const tastingNoteSchema = z.object({
  producer: z.string().trim().min(1, 'Producer is required'),
  wineName: z.string().trim().min(1, 'Wine name is required'),
  vintage: z.union([z.coerce.number().int().min(1900).max(2100), z.nan()]).optional().transform((v) => (v != null && !isNaN(v) ? v : undefined)),
  rating: z.union([z.coerce.number().min(0).max(100), z.nan()]).optional().transform((v) => (v != null && !isNaN(v) ? v : undefined)),
  liked: z.boolean().optional(),
  notes: z.string().trim().optional(),
  occasion: z.string().trim().optional(),
  tastedDate: z.string().optional(),
})

export type TastingNoteFormValues = z.input<typeof tastingNoteSchema>

export const tastingNoteDefaults: TastingNoteFormValues = {
  producer: '',
  wineName: '',
  vintage: undefined,
  rating: undefined,
  liked: undefined,
  notes: '',
  occasion: '',
  tastedDate: new Date().toISOString().split('T')[0],
}
