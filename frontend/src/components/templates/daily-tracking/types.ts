import type { TDiaryEntryInput } from '@/validation/diary'

export interface IDailyTrackingFormValues {
  id?: string
  date: string
  allergies?: number
  infections?: number
  stressLevel: number
  sleep: number
  nutrition?: number
  mentalHealth: number
  contactFactors: string[]
  contactFactorDetails: { [key: string]: string }
  nutritionFactors: string[]
  nutritionFactorDetails: { [key: string]: string }
  careFactors: string[]
  careFactorDetails: { [key: string]: string }
  healthFactors: string[]
  healthFactorDetails: { [key: string]: string }
  itchiness: number
  inflammation: number
  dryness: number
  scratch?: boolean
  weepingSkin?: boolean
  skinCracks?: boolean
  spreadPhotoUrls: string[]
  notes: string
}

export type TDailyTrackingSliderFieldKey =
  | 'allergies'
  | 'infections'
  | 'stressLevel'
  | 'sleep'
  | 'mentalHealth'
  | 'itchiness'
  | 'inflammation'
  | 'dryness'

export type TContactFactor = 'shower' | 'clothing' | 'animal-contact'

export type TNutritionFactor =
  | 'Nuts'
  | 'Fruits'
  | 'Shellfish'
  | 'Dairy'
  | 'Gluten'

export type TCareFactor =
  | 'skin care'
  | 'hair products'
  | 'soapShampoo'
  | 'cosmetics'

export type THealthFactor = 'other allergies' | 'infection'

export interface IDailyTrackingSliderFieldDefinition {
  key: TDailyTrackingSliderFieldKey
  label: string
  helperText: string
}

export interface IDailyTrackingValidationOptions {
  date: string
  images: File[]
  existingImageCount?: number
  today?: Date
}

export interface IDailyTrackingSubmissionOptions {
  values: IDailyTrackingFormValues
  images: File[]
  today?: Date
}

export interface IDailyTrackingSubmissionSuccess {
  success: true
  data: TDiaryEntryInput & { id?: string }
}

export interface IDailyTrackingSubmissionFailure {
  success: false
  error: string
}

export type TDailyTrackingSubmissionResult =
  | IDailyTrackingSubmissionSuccess
  | IDailyTrackingSubmissionFailure
