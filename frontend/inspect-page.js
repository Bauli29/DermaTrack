/* global Buffer, URL, console */
/* eslint-disable no-console */
import { chromium, devices } from 'playwright'

const BASE_URL = 'http://localhost:3000'

const createFakeAccessToken = (offsetSeconds = 3600) => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'testuser',
      exp: Math.floor(Date.now() / 1000) + offsetSeconds,
    })
  ).toString('base64url')

  return `header.${payload}.signature`
}

const formatDateInput = date => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const buildDiaryEntry = ({
  date,
  itchiness = 5,
  inflammation = 5,
  dryness = 5,
  scratch = false,
  weepingSkin = false,
  skinCracks = false,
  spreadPhotoUrls = [],
  notes = '',
}) => ({
  entryDate: date,
  tracking: {
    symptoms: {
      itchiness,
      inflammation,
      dryness,
      scratch,
      weepingSkin,
      skinCracks,
      spreadPhotoUrls,
    },
  },
  notes,
})

const getDateDaysAgo = days => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateInput(date)
}

const getMonthRange = monthDate => {
  const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
  return {
    fromDate: formatDateInput(from),
    toDate: formatDateInput(to),
  }
}

const mockSessionLoggedIn = async page => {
  await page.context().addCookies([
    {
      name: 'dermatrack_access_token',
      value: createFakeAccessToken(),
      domain: 'localhost',
      path: '/',
    },
  ])

  await page.route('**/api/auth/session', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        isLoggedIn: true,
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      }),
    })
  )
}

const mockDiaryRoutes = async page => {
  const today = formatDateInput(new Date())
  const twoDaysAgo = getDateDaysAgo(2)
  const fourDaysAgo = getDateDaysAgo(4)
  const weekStart = getDateDaysAgo(6)

  const thisMonth = new Date()
  const currentRange = getMonthRange(thisMonth)
  const previousMonth = new Date(
    thisMonth.getFullYear(),
    thisMonth.getMonth() - 1,
    1
  )
  const previousRange = getMonthRange(previousMonth)

  const dashboardEntries = [
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

  const timelineCurrentEntries = [
    buildDiaryEntry({
      date: today,
      itchiness: 8,
      inflammation: 7,
      dryness: 6,
      scratch: true,
      weepingSkin: true,
      skinCracks: false,
      notes: 'Today note',
    }),
    buildDiaryEntry({
      date: getDateDaysAgo(3),
      itchiness: 2,
      inflammation: 1,
      dryness: 3,
      scratch: false,
      weepingSkin: false,
      skinCracks: false,
      notes: 'Lower severity',
    }),
  ]

  const timelinePreviousEntries = [
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

    if (fromDate === weekStart && toDate === today) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dashboardEntries),
      })
      return
    }

    if (fromDate === currentRange.fromDate && toDate === currentRange.toDate) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(timelineCurrentEntries),
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
        body: JSON.stringify(timelinePreviousEntries),
      })
      return
    }

    route.continue()
  })
}

const inspectDashboard = async page => {
  console.log('\n--- Dashboard page ---')
  await page.goto(`${BASE_URL}/`)
  await page.waitForLoadState('networkidle')

  const headings = await page.getByRole('heading').allTextContents()
  console.log('Headings:', headings)

  const visibleCards = await page
    .getByText(/tracked days|Tracking active|Entry recorded/i)
    .allTextContents()
  console.log('Visible cards/texts:', visibleCards)

  const emptyDayCount = await page
    .locator('button:has-text("No entry")')
    .count()
  console.log('No entry buttons:', emptyDayCount)

  const entryDayTestIds = await page.$$eval(
    '[data-testid^="week-day-"]',
    nodes => nodes.map(node => node.getAttribute('data-testid'))
  )
  console.log('Week day test IDs:', entryDayTestIds.slice(0, 10))
}

const inspectTimeline = async page => {
  console.log('\n--- Timeline page ---')
  await page.goto(`${BASE_URL}/timeline`)
  await page.waitForLoadState('networkidle')

  const titles = await page.getByRole('heading').allTextContents()
  console.log('Timeline headings:', titles)

  const highlightText = await page
    .getByText(/Logbook highlights|Tracked factors/i)
    .allTextContents()
  console.log('Highlights panel text:', highlightText)

  const monthButtons = await page
    .getByRole('button', { name: /Show previous month|Show current month/i })
    .allTextContents()
  console.log('Month buttons:', monthButtons)
}

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    ...devices['Pixel 7'],
    baseURL: BASE_URL,
  })

  const page = await context.newPage()
  await mockSessionLoggedIn(page)
  await mockDiaryRoutes(page)

  await inspectDashboard(page)
  await inspectTimeline(page)

  await browser.close()
})()
