import { z } from 'zod'

export const PsycheSchema = z
  .object({
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

    mentalStrain: z
      .number()
      .int('Mental strain must be a whole number')
      .min(0, 'Mental strain cannot be less than 0')
      .max(10, 'Mental strain cannot be greater than 10')
      .optional(),
  })
  .optional()

export const ContactFactorsSchema = z
  .object({
    shower: z.string().optional(),
    clothing: z.string().optional(),
    animalContact: z.string().optional(),
    customContactFactors: z.array(z.string()).optional(),
  })
  .optional()

export const NutritionSchema = z
  .object({
    nuts: z.string().optional(),
    fruits: z.string().optional(),
    shellfish: z.string().optional(),
    dairy: z.string().optional(),
    gluten: z.string().optional(),
    customNutritionFactors: z.array(z.string()).optional(),
  })
  .optional()

export const CareProductsSchema = z
  .object({
    skinCare: z.string().optional(),
    hairProducts: z.string().optional(),
    soapShampoo: z.string().optional(),
    cosmetics: z.string().optional(),
    customCareProducts: z.array(z.string()).optional(),
  })
  .optional()

export const HealthSchema = z
  .object({
    otherAllergies: z.string().optional(),
    infections: z
      .number()
      .int('Infections rating must be a whole number')
      .min(0, 'Infections rating cannot be less than 0')
      .max(10, 'Infections rating cannot be greater than 10')
      .optional(),
  })
  .optional()

export const SymptomsSchema = z
  .object({
    itchiness: z
      .number()
      .int('Itchiness rating must be a whole number')
      .min(0, 'Itchiness rating cannot be less than 0')
      .max(10, 'Itchiness rating cannot be greater than 10')
      .optional(),

    scratch: z.boolean().optional(),

    inflammation: z
      .number()
      .int('Inflammation rating must be a whole number')
      .min(0, 'Inflammation rating cannot be less than 0')
      .max(10, 'Inflammation rating cannot be greater than 10')
      .optional(),

    dryness: z
      .number()
      .int('Dryness rating must be a whole number')
      .min(0, 'Dryness rating cannot be less than 0')
      .max(10, 'Dryness rating cannot be greater than 10')
      .optional(),

    weepingSkin: z.boolean().optional(),
    skinCracks: z.boolean().optional(),
    spreadPhotoUrls: z.array(z.string()).optional(),
  })
  .optional()

export const DailyTrackingPayloadSchema = z
  .object({
    psyche: PsycheSchema,
    contactFactors: ContactFactorsSchema,
    nutrition: NutritionSchema,
    careProducts: CareProductsSchema,
    health: HealthSchema,
    symptoms: SymptomsSchema,
  })
  .strict()

export const DiaryEntryCreateSchema = z
  .object({
    entryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Entry date must be in YYYY-MM-DD format'),
    tracking: DailyTrackingPayloadSchema,
    notes: z
      .string()
      .max(5000, 'Notes cannot exceed 5000 characters')
      .optional(),
  })
  .strict()

export const DiaryEntrySchema = DiaryEntryCreateSchema

export type TDiaryEntryInput = z.infer<typeof DiaryEntrySchema>
