/// <reference types="jest" />

import assert from 'node:assert'
import {
  DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT,
  DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS,
  DAILY_TRACKING_SUCCESS_MESSAGE,
  appendSelectedImages,
  buildDiaryEntryInput,
  createInitialDailyTrackingValues,
  mapDiaryResponseToForm,
  hasPendingDailyTrackingChanges,
  isFutureDailyTrackingDate,
  prepareDailyTrackingSubmission,
  removeSelectedImage,
  validateDailyTrackingForm,
  validateDailyTrackingPayload,
} from '@/components/templates/daily-tracking/utils'

const createMockFile = (
  name: string,
  type: string,
  sizeInBytes: number
): File => ({ name, type, size: sizeInBytes }) as File

describe('daily tracking utils', () => {
  it('creates stable initial form values from the provided date', () => {
    assert.deepStrictEqual(
      createInitialDailyTrackingValues(new Date('2026-04-21T10:00:00Z')),
      {
        id: undefined,
        date: '2026-04-21',
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
      }
    )
  })

  it('detects future dates and ignores invalid date strings', () => {
    const today = new Date('2026-04-21T10:00:00Z')

    assert.strictEqual(isFutureDailyTrackingDate('2026-04-22', today), true)
    assert.strictEqual(isFutureDailyTrackingDate('2026-04-21', today), false)
    assert.strictEqual(isFutureDailyTrackingDate('not-a-date', today), false)
  })

  it('validates image and date constraints for the form', () => {
    const today = new Date('2026-04-21T10:00:00Z')
    const oversizedImage = createMockFile(
      'large.png',
      'image/png',
      6 * 1024 * 1024
    )

    assert.strictEqual(
      validateDailyTrackingForm({
        date: '2026-04-22',
        images: [],
        today,
      }),
      'Date must not be in the future.'
    )

    assert.strictEqual(
      validateDailyTrackingForm({
        date: '2026-04-21',
        images: [oversizedImage],
        today,
      }),
      'Each image must be <= 5MB.'
    )
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

    assert.strictEqual(nextImages.length, 5)
    assert.strictEqual(nextImages.at(-1)?.name, 'new-1.png')
  })

  it('removes the selected image by index', () => {
    const currentImages = [
      createMockFile('first.png', 'image/png', 1024),
      createMockFile('second.png', 'image/png', 1024),
      createMockFile('third.png', 'image/png', 1024),
    ]

    assert.deepStrictEqual(
      removeSelectedImage(currentImages, 1).map((image: File) => image.name),
      ['first.png', 'third.png']
    )
  })

  it('builds a cleaned diary payload and validates it through the shared schema', () => {
    const payload = buildDiaryEntryInput({
      date: '2026-04-21',
      allergies: undefined,
      infections: 2,
      stressLevel: 4,
      sleep: 3,
      nutrition: 5,
      mentalHealth: 0,
      contactFactors: ['clothing'],
      contactFactorDetails: {
        clothing: 'Synthetic sweater',
      },
      nutritionFactors: ['nuts'],
      nutritionFactorDetails: {
        nuts: 'Peanut snack',
      },
      careFactors: ['soapShampoo'],
      careFactorDetails: {
        soapShampoo: 'Fragrance-free wash',
      },
      healthFactors: ['infections'],
      healthFactorDetails: {
        infections: 'Mild throat infection',
      },
      itchiness: 6,
      inflammation: 2,
      dryness: 1,
      scratch: true,
      weepingSkin: false,
      skinCracks: true,
      notes: 'More context',
    })

    assert.deepStrictEqual(payload, {
      entryDate: '2026-04-21',
      notes: 'More context',
      tracking: {
        careProducts: {
          skinCare: false,
          hairProducts: false,
          soapShampoo: true,
          soapShampooNotes: 'Fragrance-free wash',
          cosmetics: false,
        },
        contactFactors: {
          shower: false,
          clothing: true,
          clothingNotes: 'Synthetic sweater',
          animalContact: false,
        },
        health: {
          otherAllergies: false,
          infections: true,
          infectionsNotes: 'Mild throat infection',
        },
        nutrition: {
          nuts: true,
          nutsNotes: 'Peanut snack',
          fruits: false,
          shellfish: false,
          dairy: false,
          gluten: false,
        },
        psyche: {
          mentalStrain: 0,
          sleep: 3,
          stressLevel: 4,
        },
        symptoms: {
          itchiness: 6,
          inflammation: 2,
          dryness: 1,
          scratch: true,
          weepingSkin: false,
          skinCracks: true,
        },
      },
    })

    const validationResult = validateDailyTrackingPayload({
      date: '2026-04-21',
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

    assert.strictEqual(validationResult.success, true)
  })

  it('maps boolean-and-notes tracking data back into form values', () => {
    assert.deepStrictEqual(
      mapDiaryResponseToForm({
        id: 'entry-1',
        entryDate: '2026-04-21',
        notes: 'More context',
        tracking: {
          psyche: {
            stressLevel: 4,
            sleep: 3,
            mentalStrain: 0,
          },
          contactFactors: {
            shower: false,
            clothing: true,
            clothingNotes: 'Synthetic sweater',
            animalContact: false,
          },
          nutrition: {
            nuts: true,
            nutsNotes: 'Peanut snack',
            fruits: false,
            shellfish: false,
            dairy: false,
            gluten: false,
          },
          careProducts: {
            skinCare: false,
            hairProducts: false,
            soapShampoo: true,
            soapShampooNotes: 'Fragrance-free wash',
            cosmetics: false,
          },
          health: {
            otherAllergies: false,
            infections: true,
            infectionsNotes: 'Mild throat infection',
          },
          symptoms: {
            itchiness: 6,
            inflammation: 2,
            dryness: 1,
            scratch: true,
            weepingSkin: false,
            skinCracks: true,
          },
        },
      }),
      {
        id: 'entry-1',
        date: '2026-04-21',
        stressLevel: 4,
        sleep: 3,
        mentalHealth: 0,
        contactFactors: ['clothing'],
        contactFactorDetails: {
          clothing: 'Synthetic sweater',
        },
        nutritionFactors: ['nuts'],
        nutritionFactorDetails: {
          nuts: 'Peanut snack',
        },
        careFactors: ['soapShampoo'],
        careFactorDetails: {
          soapShampoo: 'Fragrance-free wash',
        },
        healthFactors: ['infections'],
        healthFactorDetails: {
          infections: 'Mild throat infection',
        },
        itchiness: 6,
        inflammation: 2,
        dryness: 1,
        scratch: true,
        weepingSkin: false,
        skinCracks: true,
        notes: 'More context',
      }
    )
  })

  it('uses a shared success redirect delay constant', () => {
    assert.strictEqual(DAILY_TRACKING_SUCCESS_REDIRECT_DELAY_MS, 700)
  })

  it('prepares valid diary submissions through one shared helper', () => {
    assert.deepStrictEqual(
      prepareDailyTrackingSubmission({
        values: {
          date: '2026-04-21',
          allergies: undefined,
          infections: 2,
          stressLevel: 4,
          sleep: 3,
          nutrition: 5,
          mentalHealth: 0,
          contactFactors: [],
          contactFactorDetails: {},
          nutritionFactors: [],
          nutritionFactorDetails: {},
          careFactors: [],
          careFactorDetails: {},
          healthFactors: [],
          healthFactorDetails: {},
          itchiness: 6,
          inflammation: 2,
          dryness: 1,
          scratch: true,
          weepingSkin: false,
          skinCracks: true,
          notes: 'More context',
        },
        images: [],
        today: new Date('2026-04-21T10:00:00Z'),
      }),
      {
        success: true,
        data: {
          entryDate: '2026-04-21',
          notes: 'More context',
          tracking: {
            careProducts: {
              skinCare: false,
              hairProducts: false,
              soapShampoo: false,
              cosmetics: false,
            },
            contactFactors: {
              shower: false,
              clothing: false,
              animalContact: false,
            },
            health: {
              otherAllergies: false,
              infections: false,
            },
            nutrition: {
              nuts: false,
              fruits: false,
              shellfish: false,
              dairy: false,
              gluten: false,
            },
            psyche: {
              mentalStrain: 0,
              sleep: 3,
              stressLevel: 4,
            },
            symptoms: {
              itchiness: 6,
              inflammation: 2,
              dryness: 1,
              scratch: true,
              weepingSkin: false,
              skinCracks: true,
            },
          },
        },
      }
    )
  })

  it('reports shared submission errors and pending changes consistently', () => {
    assert.deepStrictEqual(
      prepareDailyTrackingSubmission({
        values: {
          date: '2026-04-22',
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
        },
        images: [],
        today: new Date('2026-04-21T10:00:00Z'),
      }),
      {
        success: false,
        error: 'Date must not be in the future.',
      }
    )

    const initialValues = createInitialDailyTrackingValues(
      new Date('2026-04-21T10:00:00Z')
    )

    assert.strictEqual(
      hasPendingDailyTrackingChanges(initialValues, [], initialValues),
      false
    )
    assert.strictEqual(
      hasPendingDailyTrackingChanges(
        {
          ...initialValues,
          notes: 'Changed',
        },
        [],
        initialValues
      ),
      true
    )
    assert.strictEqual(
      hasPendingDailyTrackingChanges(
        initialValues,
        [createMockFile('new.png', 'image/png', 1024)],
        initialValues
      ),
      true
    )
  })

  it('uses shared copy constants for success and discard behavior', () => {
    assert.strictEqual(
      DAILY_TRACKING_SUCCESS_MESSAGE,
      'Entry saved successfully.'
    )
    assert.strictEqual(
      DAILY_TRACKING_DISCARD_CONFIRMATION_TEXT,
      'Discard changes? Your input will be lost.'
    )
  })
})
