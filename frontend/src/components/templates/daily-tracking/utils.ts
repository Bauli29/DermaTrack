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
  date: string
  allergies?: number
  infections?: number
  stressLevel: number
  sleep: number
  nutrition: number
  symptoms: number
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
  | 'nutrition'
  | 'symptoms'

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

export const FACTOR_FIELD_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [
    { key: 'allergies', label: 'Allergies' },
    { key: 'infections', label: 'Infections' },
    { key: 'stressLevel', label: 'Stress level' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'nutrition', label: 'Nutrition' },
  ]

export const SYMPTOM_FIELD_DEFINITIONS: readonly IDailyTrackingSliderFieldDefinition[] =
  [{ key: 'symptoms', label: 'Symptoms' }]

export const createInitialDailyTrackingValues = (
  today: Date = new Date()
): IDailyTrackingFormValues => ({
  date: formatDateInput(today),
  allergies: undefined,
  infections: undefined,
  stressLevel: 0,
  sleep: 0,
  nutrition: 0,
  symptoms: 0,
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

export const buildDiaryEntryInput = ({
  allergies,
  infections,
  stressLevel,
  sleep,
  nutrition,
  symptoms,
  notes,
}: IDailyTrackingFormValues): TDiaryEntryInput =>
  Object.fromEntries(
    Object.entries({
      allergies,
      infections,
      stressLevel,
      sleep,
      nutrition,
      symptoms,
      miscellaneous: notes || undefined,
    }).filter(([, value]) => value !== undefined)
  ) as TDiaryEntryInput

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
