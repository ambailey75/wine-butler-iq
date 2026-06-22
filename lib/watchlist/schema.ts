import { z } from 'zod'

export const watchListSchema = z.object({
  producer: z.string().trim().min(1, 'Producer is required'),
  wineName: z.string().trim().optional(),
  vintage: z.union([z.coerce.number().int().min(1900).max(2100), z.nan()]).optional().transform((v) => (v != null && !isNaN(v) ? v : undefined)),
  notes: z.string().trim().optional(),
  targetDate: z.string().optional(),
})

export type WatchListFormValues = z.input<typeof watchListSchema>

export const watchListDefaults: WatchListFormValues = {
  producer: '',
  wineName: '',
  vintage: undefined,
  notes: '',
  targetDate: '',
}
