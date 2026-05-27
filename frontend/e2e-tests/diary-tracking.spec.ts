import { expect, test, type Page } from '@playwright/test'

import {
  buildDiaryEntry,
  formatDateInput,
  mockSessionLoggedIn,
} from './test-utils'

const today = () => formatDateInput(new Date())

const mockDiaryEntryApi = async (page: Page, entryDate: string) => {
  await page.route('**/api/diary*', async route => {
    const request = route.request()
    const url = new URL(request.url())

    if (request.method() === 'GET' && url.pathname === '/api/diary') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          buildDiaryEntry({
            date: entryDate,
            itchiness: 6,
            inflammation: 4,
            dryness: 7,
            scratch: true,
            notes: 'Existing diary note',
          }),
        ]),
      })
      return
    }

    if (request.method() === 'POST' && url.pathname === '/api/diary') {
      const payload = request.postDataJSON()

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 42,
          entryDate: payload.entryDate,
          tracking: payload.tracking,
          notes: payload.notes,
        }),
      })
      return
    }

    await route.continue()
  })
}

test.describe('Daily tracking page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSessionLoggedIn(page)
  })

  test('shows the diary tracking form for the selected date', async ({
    page,
  }) => {
    const entryDate = today()
    await mockDiaryEntryApi(page, entryDate)

    await page.goto(`/tracking/daily?date=${entryDate}`)

    await expect(
      page.getByText('Factors', { exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByText('Symptoms', { exact: true }).first()
    ).toBeVisible()
    await expect(
      page.getByPlaceholder(
        'Optional: add any context (medication, weather, triggers, etc.)'
      )
    ).toBeVisible()
  })

  test('validates required factor details before saving', async ({ page }) => {
    const entryDate = today()
    await mockDiaryEntryApi(page, entryDate)

    await page.goto(`/tracking/daily?date=${entryDate}`)
    await page.getByRole('checkbox', { name: 'Shower' }).check()
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(
      page.getByText('Please provide details about Shower.')
    ).toBeVisible()
  })

  test('saves a diary entry with symptom, factor and note data', async ({
    page,
  }) => {
    const entryDate = today()
    let submittedPayload: { [key: string]: unknown } | undefined

    await mockDiaryEntryApi(page, entryDate)
    await page.route('**/api/diary', async route => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }

      submittedPayload = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(submittedPayload),
      })
    })

    await page.goto(`/tracking/daily?date=${entryDate}`)
    await page.getByRole('checkbox', { name: 'Shower' }).check()
    await page
      .getByLabel('Details about Shower *')
      .fill('Short lukewarm shower')
    await page.getByRole('checkbox', { name: 'Skin Cracks' }).check()
    await page
      .getByPlaceholder(
        'Optional: add any context (medication, weather, triggers, etc.)'
      )
      .fill('New diary note from e2e test')

    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Entry saved successfully.')).toBeVisible()
    expect(submittedPayload).toMatchObject({
      entryDate,
      notes: 'New diary note from e2e test',
    })
    expect(submittedPayload?.tracking).toMatchObject({
      symptoms: {
        skinCracks: true,
      },
      contactFactors: {
        shower: true,
        showerNotes: 'Short lukewarm shower',
      },
    })
  })
})
