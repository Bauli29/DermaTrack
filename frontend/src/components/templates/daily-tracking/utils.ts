import { formatDateInput } from '@/lib/date'
import {
  validateRequest,
  type TValidationResult,
} from '@/lib/validation-helper'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'

import { DiaryEntrySchema, type TDiaryEntryInput } from '@/validation/diary'

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
  notes: string
}

export const DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS = 700
export const DAILY_TRACKING_SUCCESS_MESSAGE = 'Entry saved successfully.'
export const DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT =
  'Discard changes? Your input will be lost.'

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
}

interface IDailyTrackingValidationOptions {
  date: string
  images: File[]
  today?: Date
}

interface IDailyTrackingSubmissionOptions {
  values: IDailyTrackingFormValues
  images: File[]
  today?: Date
}

export interface IDailyTrackingSubmissionSuccess {
  success: true
  data: TDiaryEntryInput
}

export interface IDailyTrackingSubmissionFailure {
  success: false
  error: string
}

export type TDailyTrackingSubmissionResult =
  | IDailyTrackingSubmissionSuccess
  | IDailyTrackingSubmissionFailure

export const PSYCHE_FACTOR_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [
    { key: 'stressLevel', label: 'Stress Severity' },
    { key: 'sleep', label: 'Sleep Quality' },
    { key: 'mentalHealth', label: 'Mental Wellbeing' },
  ]

export const SYMPTOM_FIELD_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [
    { key: 'itchiness', label: 'Itchiness' },
    { key: 'inflammation', label: 'Inflammation' },
    { key: 'dryness', label: 'Dryness' },
  ]

export const SYMPTOM_CHECKBOX_OPTIONS = [
  { value: 'scratch', label: 'Scratching' },
  { value: 'weepingSkin', label: 'Weeping Skin' },
  { value: 'skinCracks', label: 'Skin Cracks' },
] as const

export const CONTACT_FACTOR_OPTIONS = [
  { value: 'shower', label: 'Shower' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'animal-contact', label: 'Animal Contact' },
] as const

export const NUTRITION_FACTOR_OPTIONS = [
  { value: 'nuts', label: 'Nuts' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'gluten', label: 'Gluten' },
] as const

export const CARE_FACTOR_OPTIONS = [
  { value: 'skin care', label: 'Skin Care' },
  { value: 'hair products', label: 'Hair Products' },
  { value: 'soapShampoo', label: 'Soap & Shampoo' },
  { value: 'cosmetics', label: 'Cosmetics' },
] as const

export const HEALTH_FACTOR_OPTIONS = [
  { value: 'allergies', label: 'Allergies' },
  { value: 'infections', label: 'Infections' },
] as const

export const createInitialDailyTrackingValues = (
  today: Date = new Date()
): IDailyTrackingFormValues => ({
  id: undefined,
  date: formatDateInput(today),
  allergies: undefined,
  infections: undefined,
  stressLevel: 0,
  sleep: 0,
  nutrition: 0,
  mentalHealth: 0,
  contactFactors: [],
  contactFactorDetails: {},
  nutritionFactors: [],
  nutritionFactorDetails: {},
  careFactors: [],
  careFactorDetails: {},
  healthFactors: [],
  healthFactorDetails: {},
  itchiness: 0,
  inflammation: 0,
  dryness: 0,
  scratch: undefined,
  weepingSkin: undefined,
  skinCracks: undefined,
  notes: '',
})

export const isFutureDailyTrackingDate = (
  date: string,
  today: Date = new Date()
): boolean => {
  const selected = new Date(date)

  if (Number.isNaN(selected.getTime()) || Number.isNaN(today.getTime())) {
    return false
  }

  const selectedYmd = formatDateInput(selected)
  const todayYmd = formatDateInput(today)
  return selectedYmd > todayYmd
}

export const appendSelectedImages = (
  currentImages: File[],
  selectedImages: File[]
): File[] => {
  const nextImages = [...currentImages]

  for (const image of selectedImages) {
    if (nextImages.length >= MAX_IMAGES) {
      break
    }

    nextImages.push(image)
  }

  return nextImages
}

export const removeSelectedImage = (
  currentImages: File[],
  indexToRemove: number
): File[] =>
  currentImages.filter((_, imageIndex) => imageIndex !== indexToRemove)

const validateSelectedImages = (images: File[]): string | null => {
  if (images.length > MAX_IMAGES) {
    return `You can select up to ${MAX_IMAGES} images.`
  }

  const acceptedImageTypes = new Set(ACCEPTED_IMAGE_TYPES as readonly string[])

  for (const image of images) {
    if (!acceptedImageTypes.has(image.type)) {
      return 'Only JPEG and PNG images are allowed.'
    }

    const sizeMb = image.size / (1024 * 1024)
    if (sizeMb > MAX_IMAGE_MB) {
      return `Each image must be <= ${MAX_IMAGE_MB}MB.`
    }
  }

  return null
}

export const validateDailyTrackingForm = ({
  date,
  images,
  today = new Date(),
}: IDailyTrackingValidationOptions): string | null => {
  if (isFutureDailyTrackingDate(date, today)) {
    return 'Date must not be in the future.'
  }

  return validateSelectedImages(images)
}

const mapCareFactorToField = (careFactor: string): string => {
  switch (careFactor) {
    case 'skin care':
      return 'skinCare'
    case 'hair products':
      return 'hairProducts'
    case 'soapShampoo':
      return 'soapShampoo'
    case 'cosmetics':
      return 'cosmetics'
    default:
      return careFactor
  }
}
const mapHealthFactorToField = (factor: string): string => {
  switch (factor) {
    case 'allergies':
      return 'otherAllergies'
    case 'infections':
      return 'infections'
    default:
      return factor
  }
}

export const buildDiaryEntryInput = ({
  date,
  stressLevel,
  sleep,
  mentalHealth,
  contactFactors,
  contactFactorDetails,
  nutritionFactors,
  nutritionFactorDetails,
  careFactors,
  careFactorDetails,
  healthFactors,
  healthFactorDetails,
  itchiness,
  inflammation,
  dryness,
  scratch,
  weepingSkin,
  skinCracks,
  notes,
}: IDailyTrackingFormValues): TDiaryEntryInput => {
  const psyche = {
    stressLevel: stressLevel ?? undefined,
    sleep: sleep ?? undefined,
    mentalStrain: mentalHealth ?? undefined,
  }

  // Build contact factors object from selected factors and details
  const contactFactorsObj: { [key: string]: string } = {}
  contactFactors.forEach(factor => {
    const key = factor === 'animal-contact' ? 'animalContact' : factor
    const detail = contactFactorDetails[factor]
    if (detail) {
      contactFactorsObj[key] = detail
    }
  })

  // Build nutrition factors object from selected factors and details
  const nutritionObj: { [key: string]: string } = {}
  nutritionFactors.forEach(factor => {
    const detail = nutritionFactorDetails[factor]
    if (detail) {
      nutritionObj[factor.toLowerCase()] = detail
    }
  })

  // Build care products object from selected factors and details
  const careProductsObj: { [key: string]: string } = {}
  careFactors.forEach(factor => {
    const key = mapCareFactorToField(factor)
    const detail = careFactorDetails[factor]
    if (detail) {
      careProductsObj[key] = detail
    }
  })

  const healthObj: { [key: string]: string } = {}
  healthFactors.forEach(factor => {
    const detail = healthFactorDetails[factor]
    if (detail) {
      const key = mapHealthFactorToField(factor)
      healthObj[key] = detail
    }
  })

  /*const health = {
    otherAllergies: allergies ? allergies.toString() : undefined,
    infections: infections ?? undefined,
  }*/

  const symptomsObj = {
    itchiness: itchiness ?? undefined,
    inflammation: inflammation ?? undefined,
    dryness: dryness ?? undefined,
    scratch: scratch ?? undefined,
    weepingSkin: weepingSkin ?? undefined,
    skinCracks: skinCracks ?? undefined,
  }

  const tracking = {
    psyche: Object.values(psyche).some(v => v !== undefined)
      ? psyche
      : undefined,
    contactFactors:
      Object.keys(contactFactorsObj).length > 0 ? contactFactorsObj : undefined,
    nutrition: Object.keys(nutritionObj).length > 0 ? nutritionObj : undefined,
    careProducts:
      Object.keys(careProductsObj).length > 0 ? careProductsObj : undefined,
    health: Object.keys(healthObj).length > 0 ? healthObj : undefined,
    symptoms: Object.values(symptomsObj).some(v => v !== undefined)
      ? symptomsObj
      : undefined,
  }

  return {
    entryDate: date,
    tracking,
    notes,
  }
}

export const validateDailyTrackingPayload = (
  values: IDailyTrackingFormValues
): TValidationResult<TDiaryEntryInput> =>
  validateRequest(DiaryEntrySchema, buildDiaryEntryInput(values))

export const prepareDailyTrackingSubmission = ({
  values,
  images,
  today = new Date(),
}: IDailyTrackingSubmissionOptions): TDailyTrackingSubmissionResult => {
  const validationError = validateDailyTrackingForm({
    date: values.date,
    images,
    today,
  })

  if (validationError) {
    return {
      success: false,
      error: validationError,
    }
  }

  const payloadValidation = validateDailyTrackingPayload(values)
  if (!payloadValidation.success) {
    return {
      success: false,
      error:
        payloadValidation.error.details[0] ?? payloadValidation.error.error,
    }
  }

  return {
    success: true,
    data: payloadValidation.data,
  }
}

export const hasPendingDailyTrackingChanges = (
  values: IDailyTrackingFormValues,
  images: File[],
  initialValues: IDailyTrackingFormValues
): boolean =>
  images.length > 0 ||
  (Object.keys(initialValues) as (keyof IDailyTrackingFormValues)[]).some(
    key => values[key] !== initialValues[key]
  )

// Maps backend response → frontend form values
export const mapDiaryResponseToForm = (
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
): IDailyTrackingFormValues => {
  const tracking = data.tracking ?? {}
  return {
    id: data.id,
    date: data.entryDate,

    stressLevel: tracking.psyche?.stressLevel ?? 0,
    sleep: tracking.psyche?.sleep ?? 0,
    mentalHealth: tracking.psyche?.mentalStrain ?? 0,

    contactFactors: Object.keys(tracking.contactFactors ?? {}).filter(
      k => k !== 'customContactFactors' && tracking.contactFactors?.[k] !== null
    ),

    contactFactorDetails: tracking.contactFactors ?? {},

    nutritionFactors: Object.keys(tracking.nutrition ?? {}).filter(
      k => k !== 'customNutritionFactors' && tracking.nutrition?.[k] !== null
    ),

    nutritionFactorDetails: tracking.nutrition ?? {},

    careFactors: Object.keys(tracking.careProducts ?? {}).filter(
      k => k !== 'customCareProducts' && tracking.careProducts?.[k] !== null
    ),

    careFactorDetails: tracking.careProducts ?? {},

    healthFactors: Object.keys(tracking.health ?? {}).filter(
      k => tracking.health?.[k] !== null
    ),

    healthFactorDetails: tracking.health ?? {},

    itchiness: tracking.symptoms?.itchiness ?? 0,
    inflammation: tracking.symptoms?.inflammation ?? 0,
    dryness: tracking.symptoms?.dryness ?? 0,
    scratch: tracking.symptoms?.scratch ?? false,
    weepingSkin: tracking.symptoms?.weepingSkin ?? false,
    skinCracks: tracking.symptoms?.skinCracks ?? false,

    notes: data.notes ?? '',
  }
}
