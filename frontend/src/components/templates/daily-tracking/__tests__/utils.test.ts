import {
  DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT,
  DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS,
  DAILY_TRACKING_SUCCESS_MESSAGE,
  appendSelectedImages,
  buildDiaryEntryInput,
  createInitialDailyTrackingValues,
  hasPendingDailyTrackingChanges,
  isFutureDailyTrackingDate,
  prepareDailyTrackingSubmission,
  removeSelectedImage,
  validateDailyTrackingForm,
  validateDailyTrackingPayload,
} from '../utils'

const createMockFile = (
  name: string,
  type: string,
  sizeInBytes: number
): File => ({ name, type, size: sizeInBytes }) as File

describe('daily tracking utils', () => {
  it('creates stable initial form values from the provided date', () => {
    expect(
      createInitialDailyTrackingValues(new Date('2026-04-21T10:00:00Z'))
    ).toEqual({
      date: '2026-04-21',
      allergies: undefined,
      infections: undefined,
      stressLevel: 0,
      sleep: 0,
      nutrition: 0,
      symptoms: 0,
      notes: '',
    })
  })

  it('detects future dates and ignores invalid date strings', () => {
    const today = new Date('2026-04-21T10:00:00Z')

    expect(isFutureDailyTrackingDate('2026-04-22', today)).toBe(true)
    expect(isFutureDailyTrackingDate('2026-04-21', today)).toBe(false)
    expect(isFutureDailyTrackingDate('not-a-date', today)).toBe(false)
  })

  it('validates image and date constraints for the form', () => {
    const today = new Date('2026-04-21T10:00:00Z')
    const oversizedImage = createMockFile(
      'large.png',
      'image/png',
      6 * 1024 * 1024
    )

    expect(
      validateDailyTrackingForm({
        date: '2026-04-22',
        images: [],
        today,
      })
    ).toBe('Date must not be in the future.')

    expect(
      validateDailyTrackingForm({
        date: '2026-04-21',
        images: [oversizedImage],
        today,
      })
    ).toBe('Each image must be <= 5MB.')
  })

  it('caps appended images at the configured maximum', () => {
    const currentImages = Array.from({ length: 4 }, (_, index) =>
      createMockFile(`existing-${index}.png`, 'image/png', 1024)
    )
    const selectedImages = [
      createMockFile('new-1.png', 'image/png', 1024),
      createMockFile('new-2.png', 'image/png', 1024),
    ]

    const nextImages = appendSelectedImages(currentImages, selectedImages)

    expect(nextImages).toHaveLength(5)
    expect(nextImages.at(-1)?.name).toBe('new-1.png')
  })

  it('removes the selected image by index', () => {
    const currentImages = [
      createMockFile('first.png', 'image/png', 1024),
      createMockFile('second.png', 'image/png', 1024),
      createMockFile('third.png', 'image/png', 1024),
    ]

    expect(
      removeSelectedImage(currentImages, 1).map(image => image.name)
    ).toEqual(['first.png', 'third.png'])
  })

  it('builds a cleaned diary payload and validates it through the shared schema', () => {
    const payload = buildDiaryEntryInput({
      date: '2026-04-21',
      allergies: undefined,
      infections: 2,
      stressLevel: 4,
      sleep: 3,
      nutrition: 5,
      symptoms: 6,
      notes: 'More context',
    })

    expect(payload).toEqual({
      infections: 2,
      stressLevel: 4,
      sleep: 3,
      nutrition: 5,
      symptoms: 6,
      miscellaneous: 'More context',
    })

    const validationResult = validateDailyTrackingPayload({
      date: '2026-04-21',
      allergies: undefined,
      infections: undefined,
      stressLevel: 0,
      sleep: 0,
      nutrition: 0,
      symptoms: 6,
      notes: '',
    })

    expect(validationResult.success).toBe(true)
  })

  it('uses a shared success redirect delay constant', () => {
    expect(DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS).toBe(700)
  })

  it('prepares valid diary submissions through one shared helper', () => {
    expect(
      prepareDailyTrackingSubmission({
        values: {
          date: '2026-04-21',
          allergies: undefined,
          infections: 2,
          stressLevel: 4,
          sleep: 3,
          nutrition: 5,
          symptoms: 6,
          notes: 'More context',
        },
        images: [],
        today: new Date('2026-04-21T10:00:00Z'),
      })
    ).toEqual({
      success: true,
      data: {
        infections: 2,
        stressLevel: 4,
        sleep: 3,
        nutrition: 5,
        symptoms: 6,
        miscellaneous: 'More context',
      },
    })
  })

  it('reports shared submission errors and pending changes consistently', () => {
    expect(
      prepareDailyTrackingSubmission({
        values: {
          date: '2026-04-22',
          allergies: undefined,
          infections: undefined,
          stressLevel: 0,
          sleep: 0,
          nutrition: 0,
          symptoms: 0,
          notes: '',
        },
        images: [],
        today: new Date('2026-04-21T10:00:00Z'),
      })
    ).toEqual({
      success: false,
      error: 'Date must not be in the future.',
    })

    const initialValues = createInitialDailyTrackingValues(
      new Date('2026-04-21T10:00:00Z')
    )

    expect(
      hasPendingDailyTrackingChanges(initialValues, [], initialValues)
    ).toBe(false)
    expect(
      hasPendingDailyTrackingChanges(
        {
          ...initialValues,
          notes: 'Changed',
        },
        [],
        initialValues
      )
    ).toBe(true)
    expect(
      hasPendingDailyTrackingChanges(
        initialValues,
        [createMockFile('new.png', 'image/png', 1024)],
        initialValues
      )
    ).toBe(true)
  })

  it('uses shared copy constants for success and discard behavior', () => {
    expect(DAILY_TRACKING_SUCCESS_MESSAGE).toBe('Entry saved successfully.')
    expect(DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT).toBe(
      'Discard changes? Your input will be lost.'
    )
  })
})
