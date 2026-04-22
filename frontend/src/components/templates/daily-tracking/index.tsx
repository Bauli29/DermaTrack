'use client'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Button from '@/components/atoms/Button'
import Slider from '@/components/atoms/Slider'
import Text from '@/components/atoms/Text'
import DateCalendarPicker from '@/components/organisms/DateCalendarPicker'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import { createDiaryEntry } from '@/services/diary'

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'

import * as SC from './styles'
import {
  appendSelectedImages,
  createInitialDailyTrackingValues,
  DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT,
  DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS,
  DAILY_TRACKING_SUCCESS_MESSAGE,
  FACTOR_FIELD_DEFINITIONS,
  hasPendingDailyTrackingChanges,
  IDailyTrackingFormValues,
  IDailyTrackingSliderFieldDefinition,
  isFutureDailyTrackingDate,
  prepareDailyTrackingSubmission,
  removeSelectedImage,
  SYMPTOM_FIELD_DEFINITIONS,
} from './utils'

const DEFAULT_SLIDER_PROPS = {
  min: 0,
  max: 10,
  step: 1,
  width: '100%',
} as const

const DailyTrackingTemplate = () => {
  const router = useRouter()
  const { setTitle } = usePageTitle()
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setTitle('Daily Tracking')
  }, [setTitle])

  const [baselineFormValues, setBaselineFormValues] =
    useState<IDailyTrackingFormValues>(() => createInitialDailyTrackingValues())
  const [formValues, setFormValues] =
    useState<IDailyTrackingFormValues>(baselineFormValues)
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { date, notes } = formValues
  const isFutureDate = isFutureDailyTrackingDate(date)
  const hasPendingChanges = hasPendingDailyTrackingChanges(
    formValues,
    images,
    baselineFormValues
  )

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
    setFormValues(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const renderSliderField = ({
    key,
    label,
  }: IDailyTrackingSliderFieldDefinition) => {
    const value = formValues[key] ?? 0

    return (
      <SC.FieldRow key={key}>
        <SC.Label>{label}</SC.Label>
        <Slider
          {...DEFAULT_SLIDER_PROPS}
          value={value}
          onChange={nextValue => updateFormValue(key, nextValue)}
          aria-label={label}
        />
        <SC.SliderValue>{value}</SC.SliderValue>
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
    <SC.PageWrapper>
      <SC.Card>
        {/* Date section: UI-only validation to prevent future dates */}
        <SC.Section>
          <Text size='small' color='textSecondary'>
            Date
          </Text>
          <DateCalendarPicker
            value={date}
            maxDate={formatDateInput(new Date())}
            onChange={nextDate => updateFormValue('date', nextDate)}
            ariaInvalid={isFutureDate}
            ariaDescribedBy='date-helper'
          />
          <SC.HelperText id='date-helper'>
            You can fill for today or a past date. Actual server timestamp is
            set automatically.
          </SC.HelperText>
          {isFutureDate && (
            <SC.ErrorText>Date must not be in the future.</SC.ErrorText>
          )}
        </SC.Section>

        <SC.Section>
          <Text size='medium' weight={600}>
            Factors
          </Text>
          {FACTOR_FIELD_DEFINITIONS.map(renderSliderField)}
        </SC.Section>

        <SC.Section>
          <Text size='medium' weight={600}>
            Symptoms
          </Text>
          {SYMPTOM_FIELD_DEFINITIONS.map(renderSliderField)}
        </SC.Section>

        <SC.Section>
          <Text size='medium' weight={600}>
            Notes
          </Text>
          <SC.NoteTextarea
            placeholder='Optional: add any context (medication, weather, triggers, etc.)'
            value={notes}
            onChange={event => updateFormValue('notes', event.target.value)}
          />
        </SC.Section>

        <SC.Section>
          <Text size='medium' weight={600}>
            Images
          </Text>
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
              JPEG/PNG only, up to {MAX_IMAGES} images, max {MAX_IMAGE_MB}MB
              each. Images are not uploaded yet.
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
        </SC.Section>

        {success && (
          <SC.SuccessText aria-live='polite'>{success}</SC.SuccessText>
        )}
        {error && <SC.ErrorText role='alert'>{error}</SC.ErrorText>}

        <SC.Actions>
          <Button
            variant='secondary-outline'
            size='md'
            onClick={onDiscard}
            disabled={
              isSubmitting || (!hasPendingChanges && !error && !success)
            }
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
          By saving you agree that your entry is stored securely. You can edit
          or delete entries later (once edit UI is available).
        </SC.HelperText>
      </SC.Card>
    </SC.PageWrapper>
  )
}

export default DailyTrackingTemplate
