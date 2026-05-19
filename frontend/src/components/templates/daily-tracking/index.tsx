'use client'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Button from '@/components/atoms/Button'
import Slider from '@/components/atoms/Slider'
import Text from '@/components/atoms/Text'

import CompoundCheckboxes from '@/components/molecules/CompoundCheckboxes'

import DateCalendarPicker from '@/components/organisms/DateCalendarPicker'

import {
  appendSelectedImages,
  CARE_FACTOR_OPTIONS,
  CONTACT_FACTOR_OPTIONS,
  createInitialDailyTrackingValues,
  DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT,
  DAILY_TRACKING_SUCCESS_MESSAGE,
  DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS,
  hasPendingDailyTrackingChanges,
  HEALTH_FACTOR_OPTIONS,
  IDailyTrackingFormValues,
  IDailyTrackingSliderFieldDefinition,
  isFutureDailyTrackingDate,
  mapDiaryResponseToForm,
  NUTRITION_FACTOR_OPTIONS,
  prepareDailyTrackingSubmission,
  PSYCHE_FACTOR_DEFINITIONS,
  removeSelectedImage,
  SYMPTOM_CHECKBOX_OPTIONS,
  SYMPTOM_FIELD_DEFINITIONS,
} from '@/components/templates/daily-tracking/utils'
import { ContentPageWrapper } from '@/components/templates/shared/styles'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'
import { createDiaryEntry, getDiaryEntryByDate } from '@/services/diary'

import * as SC from './styles'

const DEFAULT_SLIDER_PROPS = {
  min: 0,
  max: 10,
  step: 1,
  width: '100%',
} as const

const DATE_QUERY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const createInitialValuesForDate = (date: string) => ({
  ...createInitialDailyTrackingValues(),
  date,
})

const getDetailValidation = (
  isSelected: boolean,
  detail?: string
): 'none' | 'success' | 'error' => {
  if (!isSelected) {
    return 'none'
  }

  return detail?.trim().length ? 'success' : 'error'
}

const DailyTrackingTemplate = () => {
  const router = useRouter()
  const { setTitle } = usePageTitle()
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const today = formatDateInput(new Date())

  useEffect(() => {
    setTitle('Daily Tracking')
  }, [setTitle])
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [baselineFormValues, setBaselineFormValues] =
    useState<IDailyTrackingFormValues>(() => createInitialValuesForDate(today))
  const [formValues, setFormValues] = useState<IDailyTrackingFormValues>(() =>
    createInitialValuesForDate(today)
  )
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const requestedDate = new URLSearchParams(window.location.search).get(
      'date'
    )

    if (!requestedDate || !DATE_QUERY_PATTERN.test(requestedDate)) {
      return
    }

    if (isFutureDailyTrackingDate(requestedDate)) {
      setError('Date must not be in the future.')
      return
    }

    setSelectedDate(requestedDate)
    setBaselineFormValues(createInitialValuesForDate(requestedDate))
    setFormValues(createInitialValuesForDate(requestedDate))
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    let active = true

    const loadEntry = async () => {
      const result = await getDiaryEntryByDate(selectedDate)

      if (!active) {
        return
      }

      if (!result.success) {
        setError(result.error)
        return
      }

      const entry = Array.isArray(result.data)
        ? result.data.find(e => e.entryDate === selectedDate)
        : result.data

      if (!entry) {
        const empty = createInitialDailyTrackingValues()
        empty.date = selectedDate

        setBaselineFormValues(empty)
        setFormValues(empty)
        return
      }

      const mapped = mapDiaryResponseToForm(entry)

      setBaselineFormValues(mapped)
      setFormValues({
        ...mapped,
        date: selectedDate,
      })
    }

    loadEntry()

    return () => {
      active = false
    }
  }, [selectedDate])

  const { date, notes } = formValues
  const isFutureDate = isFutureDailyTrackingDate(date)
  const hasPendingChanges = hasPendingDailyTrackingChanges(
    formValues,
    images,
    baselineFormValues
  )
  const selectedSymptoms = SYMPTOM_CHECKBOX_OPTIONS.filter(
    (option: (typeof SYMPTOM_CHECKBOX_OPTIONS)[number]) =>
      formValues[option.value]
  ).map((option: (typeof SYMPTOM_CHECKBOX_OPTIONS)[number]) => option.value)

  const clearScheduledRedirect = useCallback(() => {
    if (redirectTimeoutRef.current === null) {
      return
    }

    clearTimeout(redirectTimeoutRef.current)
    redirectTimeoutRef.current = null
  }, [])

  useEffect(() => clearScheduledRedirect, [clearScheduledRedirect])

  const clearSuccessState = useCallback(() => {
    clearScheduledRedirect()
    setSuccess(null)
  }, [clearScheduledRedirect])

  const scheduleSuccessRedirect = useCallback(() => {
    clearScheduledRedirect()
    redirectTimeoutRef.current = setTimeout(() => {
      router.push('/')
    }, DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS)
  }, [clearScheduledRedirect, router])

  const updateFormValue = <TKey extends keyof IDailyTrackingFormValues>(
    key: TKey,
    value: IDailyTrackingFormValues[TKey]
  ) => {
    clearSuccessState()
    setFormValues((prev: IDailyTrackingFormValues) => ({
      ...prev,
      [key]: value,
    }))
  }

  const renderSliderField = ({
    key,
    label,
    helperText,
  }: IDailyTrackingSliderFieldDefinition) => {
    const value = formValues[key] ?? 0

    return (
      <SC.FieldRow key={key}>
        <SC.Label>{label}</SC.Label>
        <SC.SliderWithMeta>
          <Slider
            {...DEFAULT_SLIDER_PROPS}
            value={value}
            onChange={nextValue => updateFormValue(key, nextValue)}
            aria-label={label}
          />
          <SC.SliderFieldHelperText>{helperText}</SC.SliderFieldHelperText>
        </SC.SliderWithMeta>
      </SC.FieldRow>
    )
  }

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = event => {
    clearSuccessState()
    setError(null)
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      event.target.value = ''
      return
    }

    setImages(prev => appendSelectedImages(prev, files))
    event.target.value = ''
  }

  const handleSymptomChange = (values: string[]) => {
    setFormValues((prev: IDailyTrackingFormValues) => ({
      ...prev,
      scratch: values.includes('scratch'),
      weepingSkin: values.includes('weepingSkin'),
      skinCracks: values.includes('skinCracks'),
    }))

    clearSuccessState()
  }

  const removeImage = (index: number) => {
    clearSuccessState()
    setImages(prev => removeSelectedImage(prev, index))
  }

  const resetForm = () => {
    const nextFormValues = createInitialDailyTrackingValues()
    setBaselineFormValues(nextFormValues)
    setFormValues(nextFormValues)
    setImages([])
    setError(null)
  }

  const onDiscard = () => {
    if (hasPendingChanges) {
      const confirmed = window.confirm(DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT)

      if (!confirmed) {
        return
      }
    }

    clearSuccessState()
    resetForm()
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    })
  }

  const onSubmit = async () => {
    clearScheduledRedirect()
    setError(null)
    setSuccess(null)

    const submission = prepareDailyTrackingSubmission({
      values: formValues,
      images,
    })
    if (!submission.success) {
      setError(submission.error)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createDiaryEntry(submission.data)

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess(DAILY_TRACKING_SUCCESS_MESSAGE)
      resetForm()
    } finally {
      setIsSubmitting(false)
    }

    scheduleSuccessRedirect()
  }

  return (
    <ContentPageWrapper>
      {/* Date section: UI-only validation to prevent future dates */}
      <SC.Card>
        <Text size='small' color='textSecondary'>
          Date
        </Text>
        <DateCalendarPicker
          value={selectedDate}
          maxDate={formatDateInput(new Date())}
          onChange={nextDate => {
            if (!nextDate) return
            setSelectedDate(nextDate)
            updateFormValue('date', nextDate)
          }}
          ariaInvalid={isFutureDate}
          ariaDescribedBy='date-helper'
        />
        <SC.HelperText id='date-helper'>
          You can track today or a past date.
        </SC.HelperText>
        {isFutureDate && (
          <SC.ErrorText>Date must not be in the future.</SC.ErrorText>
        )}
      </SC.Card>

      <SC.Card>
        <SC.SectionTitle>Factors</SC.SectionTitle>
        <SC.SubsectionContainer>
          {PSYCHE_FACTOR_DEFINITIONS.map(renderSliderField)}
        </SC.SubsectionContainer>

        <SC.SubsectionContainer>
          <Text size='small' weight={500} margin='1rem 0 0.5rem 0'>
            Contact Factors
          </Text>
          <SC.HelperText>
            * Details are required when a factor is selected.
          </SC.HelperText>
          <CompoundCheckboxes
            name='contact-factors'
            options={CONTACT_FACTOR_OPTIONS.map(
              (option: (typeof CONTACT_FACTOR_OPTIONS)[number]) => {
                const isSelected = formValues.contactFactors.includes(
                  option.value
                )
                const detail = formValues.contactFactorDetails[option.value]
                const validation = getDetailValidation(isSelected, detail)

                return {
                  value: option.value,
                  label: option.label,
                  detailInput: {
                    label: `Details about ${option.label} *`,
                    placeholder: `Describe your ${option.label.toLowerCase()} contact...`,
                    value: detail ?? '',
                    validation,
                    onChange: (value: string) => {
                      setFormValues((prev: IDailyTrackingFormValues) => ({
                        ...prev,
                        contactFactorDetails: {
                          ...prev.contactFactorDetails,
                          [option.value]: value,
                        },
                      }))
                      clearSuccessState()
                    },
                  },
                }
              }
            )}
            values={formValues.contactFactors}
            onChange={(values: string[]) => {
              updateFormValue('contactFactors', values)
            }}
          />
        </SC.SubsectionContainer>

        <SC.SubsectionContainer>
          <Text size='small' weight={500} margin='1rem 0 0.5rem 0'>
            Nutrition
          </Text>
          <SC.HelperText>
            * Details are required when a factor is selected.
          </SC.HelperText>
          <CompoundCheckboxes
            name='nutrition-factors'
            options={NUTRITION_FACTOR_OPTIONS.map(
              (option: (typeof NUTRITION_FACTOR_OPTIONS)[number]) => {
                const isSelected = formValues.nutritionFactors.includes(
                  option.value
                )
                const detail = formValues.nutritionFactorDetails[option.value]
                const validation = getDetailValidation(isSelected, detail)

                return {
                  value: option.value,
                  label: option.label,
                  detailInput: {
                    label: `Details about ${option.label} *`,
                    placeholder: `Describe your ${option.label.toLowerCase()} nutrition...`,
                    value: detail ?? '',
                    validation,
                    onChange: (value: string) => {
                      setFormValues((prev: IDailyTrackingFormValues) => ({
                        ...prev,
                        nutritionFactorDetails: {
                          ...prev.nutritionFactorDetails,
                          [option.value]: value,
                        },
                      }))
                      clearSuccessState()
                    },
                  },
                }
              }
            )}
            values={formValues.nutritionFactors}
            onChange={(values: string[]) => {
              updateFormValue('nutritionFactors', values)
            }}
          />
        </SC.SubsectionContainer>

        <SC.SubsectionContainer>
          <Text size='small' weight={500} margin='1rem 0 0.5rem 0'>
            Care Products
          </Text>
          <SC.HelperText>
            * Details are required when a factor is selected.
          </SC.HelperText>
          <CompoundCheckboxes
            name='care-factors'
            options={CARE_FACTOR_OPTIONS.map(
              (option: (typeof CARE_FACTOR_OPTIONS)[number]) => {
                const isSelected = formValues.careFactors.includes(option.value)
                const detail = formValues.careFactorDetails[option.value]
                const validation = getDetailValidation(isSelected, detail)

                return {
                  value: option.value,
                  label: option.label,
                  detailInput: {
                    label: `Details about ${option.label} *`,
                    placeholder: `Describe your ${option.label.toLowerCase()} care product...`,
                    value: detail ?? '',
                    validation,
                    onChange: (value: string) => {
                      setFormValues((prev: IDailyTrackingFormValues) => ({
                        ...prev,
                        careFactorDetails: {
                          ...prev.careFactorDetails,
                          [option.value]: value,
                        },
                      }))
                      clearSuccessState()
                    },
                  },
                }
              }
            )}
            values={formValues.careFactors}
            onChange={(values: string[]) => {
              updateFormValue('careFactors', values)
            }}
          />
        </SC.SubsectionContainer>

        <SC.SubsectionContainer>
          <Text size='small' weight={500} margin='1rem 0 0.5rem 0'>
            Health Factor
          </Text>
          <SC.HelperText>
            * Details are required when a factor is selected.
          </SC.HelperText>
          <CompoundCheckboxes
            name='health-factors'
            options={HEALTH_FACTOR_OPTIONS.map(
              (option: (typeof HEALTH_FACTOR_OPTIONS)[number]) => {
                const isSelected = formValues.healthFactors.includes(
                  option.value
                )
                const detail = formValues.healthFactorDetails[option.value]
                const validation = getDetailValidation(isSelected, detail)

                return {
                  value: option.value,
                  label: option.label,
                  detailInput: {
                    label: `Details about ${option.label} *`,
                    placeholder: `Describe your ${option.label.toLowerCase()} ...`,
                    value: detail ?? '',
                    validation,
                    onChange: (value: string) => {
                      setFormValues((prev: IDailyTrackingFormValues) => ({
                        ...prev,
                        healthFactorDetails: {
                          ...prev.healthFactorDetails,
                          [option.value]: value,
                        },
                      }))
                      clearSuccessState()
                    },
                  },
                }
              }
            )}
            values={formValues.healthFactors}
            onChange={(values: string[]) => {
              updateFormValue('healthFactors', values)
            }}
          />
        </SC.SubsectionContainer>
      </SC.Card>

      <SC.Card>
        <SC.SectionTitle>Symptoms</SC.SectionTitle>
        <SC.SubsectionContainer>
          {SYMPTOM_FIELD_DEFINITIONS.map(renderSliderField)}
        </SC.SubsectionContainer>
        <SC.SubsectionContainer>
          <Text size='small' weight={500} margin='1rem 0 0.5rem 0'>
            Skin symptoms
          </Text>
          <CompoundCheckboxes
            name='symptoms'
            options={SYMPTOM_CHECKBOX_OPTIONS}
            values={selectedSymptoms}
            onChange={handleSymptomChange}
          />
        </SC.SubsectionContainer>
      </SC.Card>

      <SC.Card>
        <SC.SectionTitle>Notes</SC.SectionTitle>
        <SC.NoteTextarea
          placeholder='Optional: add any context (medication, weather, triggers, etc.)'
          value={notes}
          onChange={event => updateFormValue('notes', event.target.value)}
        />
      </SC.Card>

      <SC.Card>
        <SC.SectionTitle>Images</SC.SectionTitle>
        <SC.ImagePicker>
          <SC.FileInputLabel>
            Choose Images
            <input
              type='file'
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              multiple
              onChange={onPickImages}
            />
          </SC.FileInputLabel>
          <SC.HelperText>
            JPEG/PNG only, up to {MAX_IMAGES} images, max {MAX_IMAGE_MB}MB each.
            Images are not uploaded yet.
          </SC.HelperText>
          <SC.ImagePreviewGrid>
            {images.length === 0 && (
              <SC.ImagePreviewItem>No images selected</SC.ImagePreviewItem>
            )}
            {images.map((file, index) => (
              <SC.ImagePreviewItem key={`${file.name}-${file.size}-${index}`}>
                <SC.ImagePreviewContent>
                  <SC.ImagePreviewName>{file.name}</SC.ImagePreviewName>
                  <Button
                    size='sm'
                    variant='danger-outline'
                    onClick={() => removeImage(index)}
                  >
                    Remove
                  </Button>
                </SC.ImagePreviewContent>
              </SC.ImagePreviewItem>
            ))}
          </SC.ImagePreviewGrid>
        </SC.ImagePicker>
      </SC.Card>

      {success && <SC.SuccessText aria-live='polite'>{success}</SC.SuccessText>}
      {error && <SC.ErrorText role='alert'>{error}</SC.ErrorText>}

      <SC.Actions>
        <Button
          variant='secondary-outline'
          size='md'
          onClick={onDiscard}
          disabled={isSubmitting || (!hasPendingChanges && !error && !success)}
        >
          Discard
        </Button>
        <Button
          variant='primary'
          size='md'
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </SC.Actions>

      <SC.HelperText>
        By saving you agree that your entry is stored securely. You can edit or
        delete entries later (once edit UI is available).
      </SC.HelperText>
    </ContentPageWrapper>
  )
}

export default DailyTrackingTemplate
