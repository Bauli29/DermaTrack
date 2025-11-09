import { z } from 'zod'

export const DiaryEntrySchema = z.object({
  allergies: z.number().int().min(0).max(10).optional(),
  infections: z.number().int().min(0).max(10).optional(),
  stressLevel: z.number().int().min(0).max(10).optional(),
  sleep: z.number().int().min(0).max(10).optional(),
  nutrition: z.number().int().min(0).max(10).optional(),
  symptoms: z.number().int().min(0).max(10).optional(),
  miscellaneous: z.string().max(5000).optional(),
})
