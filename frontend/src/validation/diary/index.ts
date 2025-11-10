import { z } from 'zod'

export const DiaryEntrySchema = z
  .object({
    allergies: z
      .number()
      .int('Allergies rating must be a whole number')
      .min(0, 'Allergies rating cannot be less than 0')
      .max(10, 'Allergies rating cannot be greater than 10')
      .optional(),

    infections: z
      .number()
      .int('Infections rating must be a whole number')
      .min(0, 'Infections rating cannot be less than 0')
      .max(10, 'Infections rating cannot be greater than 10')
      .optional(),

    stressLevel: z
      .number()
      .int('Stress level must be a whole number')
      .min(0, 'Stress level cannot be less than 0')
      .max(10, 'Stress level cannot be greater than 10')
      .optional(),

    sleep: z
      .number()
      .int('Sleep rating must be a whole number')
      .min(0, 'Sleep rating cannot be less than 0')
      .max(10, 'Sleep rating cannot be greater than 10')
      .optional(),

    nutrition: z
      .number()
      .int('Nutrition rating must be a whole number')
      .min(0, 'Nutrition rating cannot be less than 0')
      .max(10, 'Nutrition rating cannot be greater than 10')
      .optional(),

    symptoms: z
      .number()
      .int('Symptoms rating must be a whole number')
      .min(0, 'Symptoms rating cannot be less than 0')
      .max(10, 'Symptoms rating cannot be greater than 10')
      .optional(),

    miscellaneous: z
      .string()
      .max(5000, 'Miscellaneous notes cannot exceed 5000 characters')
      .optional(),
  })
  .strict() // This rejects unknown keys like

export type TDiaryEntryInput = z.infer<typeof DiaryEntrySchema>
