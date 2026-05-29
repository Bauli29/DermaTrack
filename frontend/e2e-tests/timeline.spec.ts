import { expect, test } from '@playwright/test'

import {
  buildDiaryEntry,
  createFakeAccessToken,
  formatDateInput,
  getMonthRange,
  mockSessionLoggedIn,
} from './test-utils'

const TRACKING_IMAGE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

const getDateDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateInput(date)
}

test.describe('Timeline page', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'dermatrack_access_token',
        value: createFakeAccessToken(),
        domain: 'localhost',
        path: '/',
      },
    ])
    await mockSessionLoggedIn(page)

    const today = formatDateInput(new Date())
    const threeDaysAgo = getDateDaysAgo(3)

    const thisMonth = new Date()
    const currentRange = getMonthRange(thisMonth)
    const previousMonth = new Date(
      thisMonth.getFullYear(),
      thisMonth.getMonth() - 1,
      1
    )
    const previousRange = getMonthRange(previousMonth)

    const currentEntries = [
      buildDiaryEntry({
        date: today,
        itchiness: 8,
        inflammation: 7,
        dryness: 6,
        scratch: true,
        weepingSkin: true,
        skinCracks: false,
        spreadPhotoUrls: [TRACKING_IMAGE_SRC],
        notes: 'Today note',
      }),
      buildDiaryEntry({
        date: threeDaysAgo,
        itchiness: 2,
        inflammation: 1,
        dryness: 3,
        scratch: false,
        weepingSkin: false,
        skinCracks: false,
        notes: 'Lower severity',
      }),
    ]

    const previousEntries = [
      buildDiaryEntry({
        date: previousRange.fromDate,
        itchiness: 5,
        inflammation: 5,
        dryness: 5,
        scratch: false,
        weepingSkin: false,
        skinCracks: false,
        notes: 'Previous month entry',
      }),
    ]

    await page.route('**/api/diary*', route => {
      const url = new URL(route.request().url())
      const fromDate = url.searchParams.get('fromDate')
      const toDate = url.searchParams.get('toDate')

      if (
        fromDate === currentRange.fromDate &&
        toDate === currentRange.toDate
      ) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(currentEntries),
        })
        return
      }

      if (
        fromDate === previousRange.fromDate &&
        toDate === previousRange.toDate
      ) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(previousEntries),
        })
        return
      }

      route.continue()
    })

    await page.goto('/timeline')
  })

  test('renders timeline header and highlights', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Timeline/i }).first()
    ).toBeVisible()
    await expect(page.getByText('Logbook highlights')).toBeVisible()
    await expect(page.getByText('Tracked factors')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Show previous month/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Show current month/i })
    ).toBeVisible()
  })

  test('navigates months and updates the month title', async ({ page }) => {
    const previousButton = page.getByRole('button', {
      name: /Show previous month/i,
    })
    const monthTitle = page.getByRole('heading', { name: /\w+ \d{4}/i }).first()

    const initialTitle = await monthTitle.textContent()

    expect(initialTitle).not.toBeNull()

    await previousButton.click()

    await expect(monthTitle).not.toHaveText(initialTitle!)
  })

  test('selects a highlight and opens daily tracking for that date', async ({
    page,
  }) => {
    await expect(page.getByText('Entry recorded')).toBeVisible()

    const highlightButton = page
      .getByRole('button', { name: /^Most severe/ })
      .first()
    await highlightButton.click()

    await expect(page.getByText('Edit entry')).toBeVisible()
    await page.getByRole('button', { name: /Edit entry/i }).click()
    await expect(page).toHaveURL(/\/tracking\/daily\?date=/)
  })

  test('opens timeline entry images in a full preview', async ({ page }) => {
    await page
      .getByRole('button', { name: /^View tracking image 1 for/ })
      .click()

    await expect(
      page.getByRole('dialog', { name: 'Tracking image 1' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Close image preview' }).click()

    await expect(
      page.getByRole('dialog', { name: 'Tracking image 1' })
    ).not.toBeVisible()
  })
})
