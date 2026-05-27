import { expect, test } from '@playwright/test'

import {
  buildDiaryEntry,
  createFakeAccessToken,
  formatDateInput,
  mockSessionLoggedIn,
} from './test-utils'

const getDateDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateInput(date)
}

test.describe('Dashboard page', () => {
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
    const twoDaysAgo = getDateDaysAgo(2)
    const fourDaysAgo = getDateDaysAgo(4)
    const weekStart = getDateDaysAgo(6)

    const entries = [
      buildDiaryEntry({
        date: today,
        itchiness: 8,
        inflammation: 6,
        dryness: 7,
        scratch: true,
        weepingSkin: false,
        skinCracks: false,
        notes: 'Today entry',
      }),
      buildDiaryEntry({
        date: twoDaysAgo,
        itchiness: 4,
        inflammation: 3,
        dryness: 2,
        scratch: false,
        weepingSkin: false,
        skinCracks: false,
        notes: 'Two days ago entry',
      }),
      buildDiaryEntry({
        date: fourDaysAgo,
        itchiness: 5,
        inflammation: 5,
        dryness: 4,
        scratch: true,
        weepingSkin: false,
        skinCracks: false,
        notes: 'Four days ago entry',
      }),
    ]

    await page.route('**/api/diary*', route => {
      const url = new URL(route.request().url())
      if (
        url.pathname === '/api/diary' &&
        url.searchParams.get('fromDate') === weekStart &&
        url.searchParams.get('toDate') === today
      ) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(entries),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/')
  })

  test('renders dashboard summary and last-week cards', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Last week/i })
    ).toBeVisible()
    await expect(page.getByText('3 tracked days')).toBeVisible()
    await expect(page.getByText('Tracking active')).toBeVisible()
    await expect(page.getByRole('link', { name: /New entry/i })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Entry recorded' })
    ).toBeVisible()
  })

  test('shows notice when selecting an empty date and navigates on repeat click', async ({
    page,
  }) => {
    const emptyDayCard = page.locator('button:has-text("No entry")').first()

    await emptyDayCard.click()
    await expect(page.getByText('No entry yet for this day.')).toBeVisible()

    await emptyDayCard.click()
    await expect(page).toHaveURL(/\/tracking\/daily\?date=/)
  })

  test('opens daily tracking when a week date is double clicked', async ({
    page,
  }) => {
    const today = formatDateInput(new Date())

    const entryDayCard = page.getByTestId(`week-day-${today}`)

    await expect(entryDayCard).toBeVisible()
    await entryDayCard.dblclick()
    await expect(page).toHaveURL(/\/tracking\/daily\?date=/)
  })
})
