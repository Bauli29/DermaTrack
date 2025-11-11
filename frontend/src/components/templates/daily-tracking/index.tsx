'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Button from '@/components/atoms/button'
import Headline from '@/components/atoms/Headline'
import Slider from '@/components/atoms/Slider'
import Text from '@/components/atoms/Text'

import * as SC from './styles'
import { DiaryEntrySchema, TDiaryEntryInput } from '@/validation/diary'
import { validateRequest } from '@/lib/validation-helper'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_MB,
  MAX_IMAGES,
} from '@/constants/uploads'
import { formatDateInput } from '@/lib/date'

const DailyTrackingTemplate = () => {
  const router = useRouter()

  // UI-only date field: Backend currently sets createdAt on server
  const [date, setDate] = useState<string>(formatDateInput(new Date()))

  // Sliders: use undefined for untouched to keep payload small
  const [allergies, setAllergies] = useState<number | undefined>(undefined)
  const [infections, setInfections] = useState<number | undefined>(undefined)
  const [stressLevel, setStressLevel] = useState<number>(0)
  const [sleep, setSleep] = useState<number>(0)
  const [nutrition, setNutrition] = useState<number>(0)
  const [symptoms, setSymptoms] = useState<number>(0)

  const [notes, setNotes] = useState<string>('')

  // Image selection is kept client-side for now. The backend DiaryEntry has no image fields yet.
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isFutureDate = useMemo(() => {
    try {
      const selected = new Date(date)
      const today = new Date()
      // Normalize to yyyy-MM-dd comparison
      const selectedYmd = formatDateInput(selected)
      const todayYmd = formatDateInput(today)
      return selectedYmd > todayYmd
    } catch {
      return false
    }
  }, [date])

  // Client-side validation aligned with FR-007 (UI-only checks)
  // Numeric ranges and required fields are validated with Zod (schema)
  const validate = useCallback((): string | null => {
    if (isFutureDate) return 'Date must not be in the future.'
    if (images.length > MAX_IMAGES)
      return `You can select up to ${MAX_IMAGES} images.`
    const accepted = new Set(ACCEPTED_IMAGE_TYPES as readonly string[])
    for (const f of images) {
      if (!accepted.has(f.type)) return 'Only JPEG and PNG images are allowed.'
      const sizeMb = f.size / (1024 * 1024)
      if (sizeMb > MAX_IMAGE_MB)
        return `Each image must be ≤ ${MAX_IMAGE_MB}MB.`
    }
    return null
  }, [isFutureDate, images])

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = e => {
    setError(null)
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const next = [...images]
    for (const f of files) {
      if (next.length >= MAX_IMAGES) break
      next.push(f)
    }
    setImages(next)
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const resetForm = () => {
    setDate(formatDateInput(new Date()))
    setAllergies(undefined)
    setInfections(undefined)
    setStressLevel(0)
    setSleep(0)
    setNutrition(0)
    setSymptoms(0)
    setNotes('')
    setImages([])
    setError(null)
  }

  const onDiscard = () => {
    // Minimal confirmation as per FR-007 alternative flow
    const confirmed = window.confirm(
      'Discard changes? Your input will be lost.'
    )
    if (confirmed) {
      resetForm()
      // Navigate back if possible, else to home
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/')
      }
    }
  }

  const onSubmit = async () => {
    setError(null)
    setSuccess(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    // Build typed raw object and strip undefined values before Zod validation
    const raw: TDiaryEntryInput = {
      allergies,
      infections,
      stressLevel,
      sleep,
      nutrition,
      symptoms,
      miscellaneous: notes || undefined,
    }

    const cleaned = Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined)
    ) as TDiaryEntryInput

    const result = validateRequest(DiaryEntrySchema, cleaned)
    if (!result.success) {
      setError(result.error.details[0] ?? result.error.error)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })

      if (!res.ok) {
        const text = await res.text()
        setError(text || `Request failed with status ${res.status}`)
        return
      }

      // Success: inline feedback and redirect
      setSuccess('Entry saved successfully.')
      resetForm()
      // TODO: route to timeline visualization once available (FR-006)
      setTimeout(() => router.push('/'), 700)
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error(e)
      setError(
        (e as Error)?.message || 'Failed to save entry. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SC.PageWrapper>
      <Headline variant='h2' align='left'>
        Daily Tracking
      </Headline>

      <SC.Card>
        {/* Date section: UI-only validation to prevent future dates */}
        <SC.Section>
          <Text size='small' color='textSecondary'>
            Date
          </Text>
          <SC.DateInput
            type='date'
            value={date}
            max={formatDateInput(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-invalid={isFutureDate}
            aria-describedby='date-helper'
          />
          <SC.HelperText id='date-helper'>
            You can fill for today or a past date. Actual server timestamp is
            set automatically.
          </SC.HelperText>
          {isFutureDate && (
            <SC.ErrorText>Date must not be in the future.</SC.ErrorText>
          )}
        </SC.Section>

        {/* Factors section */}
        <SC.Section>
          <Text size='medium' weight={600}>
            Factors
          </Text>

          <SC.FieldRow>
            <SC.Label>Allergies</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={allergies ?? 0}
              onChange={setAllergies}
              width='100%'
            />
            <SC.SliderValue>{allergies ?? 0}</SC.SliderValue>
          </SC.FieldRow>

          <SC.FieldRow>
            <SC.Label>Infections</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={infections ?? 0}
              onChange={setInfections}
              width='100%'
            />
            <SC.SliderValue>{infections ?? 0}</SC.SliderValue>
          </SC.FieldRow>

          <SC.FieldRow>
            <SC.Label>Stress level</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={stressLevel ?? 0}
              onChange={setStressLevel}
              width='100%'
            />
            <SC.SliderValue>{stressLevel ?? 0}</SC.SliderValue>
          </SC.FieldRow>

          <SC.FieldRow>
            <SC.Label>Sleep</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={sleep ?? 0}
              onChange={setSleep}
              width='100%'
            />
            <SC.SliderValue>{sleep ?? 0}</SC.SliderValue>
          </SC.FieldRow>

          <SC.FieldRow>
            <SC.Label>Nutrition</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={nutrition ?? 0}
              onChange={setNutrition}
              width='100%'
            />
            <SC.SliderValue>{nutrition ?? 0}</SC.SliderValue>
          </SC.FieldRow>
        </SC.Section>

        {/* Symptoms severity */}
        <SC.Section>
          <Text size='medium' weight={600}>
            Symptoms
          </Text>
          <SC.FieldRow>
            <SC.Label>Symptoms</SC.Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={symptoms ?? 0}
              onChange={setSymptoms}
              width='100%'
            />
            <SC.SliderValue>{symptoms ?? 0}</SC.SliderValue>
          </SC.FieldRow>
        </SC.Section>

        {/* Notes */}
        <SC.Section>
          <Text size='medium' weight={600}>
            Notes
          </Text>
          <SC.NoteTextarea
            placeholder='Optional: add any context (medication, weather, triggers, etc.)'
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </SC.Section>

        {/* Image picker (client-side only for now) */}
        <SC.Section>
          <Text size='medium' weight={600}>
            Images
          </Text>
          <SC.ImagePicker>
            <input
              type='file'
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              multiple
              onChange={onPickImages}
            />
            <SC.HelperText>
              JPEG/PNG only, up to {MAX_IMAGES} images, ≤ {MAX_IMAGE_MB}MB each.
              Images are not uploaded yet.
            </SC.HelperText>
            <SC.ImagePreviewGrid>
              {images.length === 0 && (
                <SC.ImagePreviewItem>No images selected</SC.ImagePreviewItem>
              )}
              {images.map((file, idx) => (
                <SC.ImagePreviewItem key={idx}>
                  {/* We avoid object URL preview for now to keep memory small; we just show filename */}
                  <div style={{ padding: 6 }}>
                    <div style={{ marginBottom: 4 }}>{file.name}</div>
                    <Button
                      size='sm'
                      variant='danger-outline'
                      onClick={() => removeImage(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </SC.ImagePreviewItem>
              ))}
            </SC.ImagePreviewGrid>
          </SC.ImagePicker>
        </SC.Section>

        {/* Global messages */}
        {success && (
          <SC.SuccessText aria-live='polite'>{success}</SC.SuccessText>
        )}
        {error && <SC.ErrorText role='alert'>{error}</SC.ErrorText>}

        <SC.Actions>
          <Button
            variant='secondary-outline'
            size='md'
            onClick={onDiscard}
            disabled={isSubmitting}
          >
            Discard
          </Button>
          <Button
            variant='primary'
            size='md'
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
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
