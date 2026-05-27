import { formatDateInput } from '@/lib/date'
import { validateRequest } from '@/lib/validation-helper'

import { DiaryEntrySchema } from '@/validation/diary'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'

import type { TValidationResult } from '@/lib/validation-helper'
import type { TDiaryEntryInput } from '@/validation/diary'
import type {
  IDailyTrackingFormValues,
  IDailyTrackingSliderFieldDefinition,
  IDailyTrackingSubmissionOptions,
  IDailyTrackingValidationOptions,
  TDailyTrackingSubmissionResult,
} from './types'

export type {
  IDailyTrackingFormValues,
  IDailyTrackingSliderFieldDefinition,
  IDailyTrackingSubmissionFailure,
  IDailyTrackingSubmissionSuccess,
  TDailyTrackingSubmissionResult,
  TDailyTrackingSliderFieldKey,
} from './types'

export const DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS = 700
export const DAILY_TRACKING_SUCCESS_MESSAGE = 'Entry saved successfully.'
export const DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT =
  'Discard changes? Your input will be lost.'

export const PSYCHE_FACTOR_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [
    {
      key: 'stressLevel',
      label: 'Stress Severity',
      helperText: '0 = no stress · 10 = extremely stressed (higher = worse)',
    },
    {
      key: 'sleep',
      label: 'Sleep Quality',
      helperText: '0 = worst sleep · 10 = best sleep (higher = better)',
    },
    {
      key: 'mentalHealth',
      label: 'Mental Wellbeing',
      helperText: '0 = very poor mood · 10 = excellent mood (higher = better)',
    },
  ]

export const SYMPTOM_FIELD_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [
    {
      key: 'itchiness',
      label: 'Itchiness',
      helperText: '0 = no itchiness · 10 = extremely itchy (higher = worse)',
    },
    {
      key: 'inflammation',
      label: 'Inflammation',
      helperText:
        '0 = no inflammation · 10 = severely inflamed (higher = worse)',
    },
    {
      key: 'dryness',
      label: 'Dryness',
      helperText: '0 = no dryness · 10 = extremely dry skin (higher = worse)',
    },
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
  spreadPhotoUrls: [],
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
  selectedImages: File[],
  existingImageCount = 0
): File[] => {
  const nextImages = [...currentImages]

  for (const image of selectedImages) {
    if (nextImages.length + existingImageCount >= MAX_IMAGES) {
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

export const validateSelectedImages = (
  images: File[],
  existingImageCount = 0
): string | null => {
  if (images.length + existingImageCount > MAX_IMAGES) {
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
  existingImageCount = 0,
  today = new Date(),
}: IDailyTrackingValidationOptions): string | null => {
  if (isFutureDailyTrackingDate(date, today)) {
    return 'Date must not be in the future.'
  }

  return validateSelectedImages(images, existingImageCount)
}

const getMissingFactorDetailError = (
  selectedFactors: string[],
  factorDetails: { [key: string]: string },
  options: readonly { value: string; label: string }[]
): string | null => {
  for (const factor of selectedFactors) {
    const detail = factorDetails[factor]

    if (typeof detail !== 'string' || detail.trim().length === 0) {
      const option = options.find(item => item.value === factor)
      const label = option?.label ?? factor
      return `Please provide details about ${label}.`
    }
  }

  return null
}

const validateRequiredFactorDetails = (
  values: IDailyTrackingFormValues
): string | null => {
  const contactError = getMissingFactorDetailError(
    values.contactFactors,
    values.contactFactorDetails,
    CONTACT_FACTOR_OPTIONS
  )
  if (contactError) {
    return contactError
  }

  const nutritionError = getMissingFactorDetailError(
    values.nutritionFactors,
    values.nutritionFactorDetails,
    NUTRITION_FACTOR_OPTIONS
  )
  if (nutritionError) {
    return nutritionError
  }

  const careError = getMissingFactorDetailError(
    values.careFactors,
    values.careFactorDetails,
    CARE_FACTOR_OPTIONS
  )
  if (careError) {
    return careError
  }

  const healthError = getMissingFactorDetailError(
    values.healthFactors,
    values.healthFactorDetails,
    HEALTH_FACTOR_OPTIONS
  )
  if (healthError) {
    return healthError
  }

  return null
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
  spreadPhotoUrls,
  notes,
}: IDailyTrackingFormValues): TDiaryEntryInput => {
  const psyche = {
    stressLevel: stressLevel ?? undefined,
    sleep: sleep ?? undefined,
    mentalStrain: mentalHealth ?? undefined,
  }

  const contactFactorsObj: { [key: string]: boolean | string } = {
    shower: false,
    clothing: false,
    animalContact: false,
  }
  contactFactors.forEach(factor => {
    const key = factor === 'animal-contact' ? 'animalContact' : factor
    contactFactorsObj[key] = true

    const detail = contactFactorDetails[factor]
    if (detail) {
      contactFactorsObj[`${key}Notes`] = detail
    }
  })

  const nutritionObj: { [key: string]: boolean | string } = {
    nuts: false,
    fruits: false,
    shellfish: false,
    dairy: false,
    gluten: false,
  }
  nutritionFactors.forEach(factor => {
    const key = factor.toLowerCase()
    nutritionObj[key] = true

    const detail = nutritionFactorDetails[factor]
    if (detail) {
      nutritionObj[`${key}Notes`] = detail
    }
  })

  const careProductsObj: { [key: string]: boolean | string } = {
    skinCare: false,
    hairProducts: false,
    soapShampoo: false,
    cosmetics: false,
  }
  careFactors.forEach(factor => {
    const key = mapCareFactorToField(factor)
    careProductsObj[key] = true

    const detail = careFactorDetails[factor]
    if (detail) {
      careProductsObj[`${key}Notes`] = detail
    }
  })

  const healthObj: { [key: string]: boolean | string } = {
    otherAllergies: false,
    infections: false,
  }
  healthFactors.forEach(factor => {
    const key = mapHealthFactorToField(factor)
    healthObj[key] = true

    const detail = healthFactorDetails[factor]
    if (detail) {
      healthObj[`${key}Notes`] = detail
    }
  })

  const symptomsObj: {
    itchiness?: number
    inflammation?: number
    dryness?: number
    scratch?: boolean
    weepingSkin?: boolean
    skinCracks?: boolean
    spreadPhotoUrls?: string[]
  } = {
    itchiness: itchiness ?? undefined,
    inflammation: inflammation ?? undefined,
    dryness: dryness ?? undefined,
    scratch: scratch ?? undefined,
    weepingSkin: weepingSkin ?? undefined,
    skinCracks: skinCracks ?? undefined,
  }

  if (spreadPhotoUrls.length > 0) {
    symptomsObj.spreadPhotoUrls = [...spreadPhotoUrls]
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
    existingImageCount: values.spreadPhotoUrls.length,
    today,
  })

  if (validationError) {
    return {
      success: false,
      error: validationError,
    }
  }

  const factorDetailValidationError = validateRequiredFactorDetails(values)
  if (factorDetailValidationError) {
    return {
      success: false,
      error: factorDetailValidationError,
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
    data: values.id
      ? { ...payloadValidation.data, id: values.id }
      : payloadValidation.data,
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

const extractFactorsAndNotes = (
  obj: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  keyMapping?: { [key: string]: string }
): { factors: string[]; details: { [key: string]: string } } => {
  const factors: string[] = []
  const details: { [key: string]: string } = {}

  for (const [key, value] of Object.entries(obj ?? {})) {
    if (
      key === 'customContactFactors' ||
      key === 'customNutritionFactors' ||
      key === 'customCareProducts'
    ) {
      continue
    }

    if (key.endsWith('Notes')) {
      const baseKey = key.slice(0, -5)
      if (typeof value === 'string') {
        const mappedKey = keyMapping?.[baseKey] ?? baseKey
        details[mappedKey] = value
      }
      continue
    }

    if (value === true) {
      const mappedKey = keyMapping?.[key] ?? key
      factors.push(mappedKey)
    }
  }

  return { factors, details }
}

export const mapDiaryResponseToForm = (
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
): IDailyTrackingFormValues => {
  const tracking = data.tracking ?? {}

  const contactFactorMapping = {
    animalContact: 'animal-contact',
  }

  const careFactorMapping = {
    skinCare: 'skin care',
    hairProducts: 'hair products',
  }

  const healthFactorMapping = {
    otherAllergies: 'allergies',
  }

  const { factors: contactFactors, details: contactFactorDetails } =
    extractFactorsAndNotes(tracking.contactFactors, contactFactorMapping)
  const { factors: nutritionFactors, details: nutritionFactorDetails } =
    extractFactorsAndNotes(tracking.nutrition)
  const { factors: careFactors, details: careFactorDetails } =
    extractFactorsAndNotes(tracking.careProducts, careFactorMapping)
  const { factors: healthFactors, details: healthFactorDetails } =
    extractFactorsAndNotes(tracking.health, healthFactorMapping)

  return {
    id: data.id,
    date: data.entryDate,

    stressLevel: tracking.psyche?.stressLevel ?? 0,
    sleep: tracking.psyche?.sleep ?? 0,
    mentalHealth: tracking.psyche?.mentalStrain ?? 0,

    contactFactors,
    contactFactorDetails,

    nutritionFactors,
    nutritionFactorDetails,

    careFactors,
    careFactorDetails,

    healthFactors,
    healthFactorDetails,

    itchiness: tracking.symptoms?.itchiness ?? 0,
    inflammation: tracking.symptoms?.inflammation ?? 0,
    dryness: tracking.symptoms?.dryness ?? 0,
    scratch: tracking.symptoms?.scratch ?? false,
    weepingSkin: tracking.symptoms?.weepingSkin ?? false,
    skinCracks: tracking.symptoms?.skinCracks ?? false,
    spreadPhotoUrls: tracking.symptoms?.spreadPhotoUrls ?? [],

    notes: data.notes ?? '',
  }
}
