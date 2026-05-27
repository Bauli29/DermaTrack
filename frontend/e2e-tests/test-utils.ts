'use strict'

import type { Page } from '@playwright/test'

export const VALID_USERNAME = 'testuser'
export const VALID_EMAIL = 'test@example.com'

export const createFakeAccessToken = (offsetSeconds = 3600): string => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: VALID_USERNAME,
      exp: Math.floor(Date.now() / 1000) + offsetSeconds,
    })
  ).toString('base64url')

  return `header.${payload}.signature`
}

export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const buildDiaryEntry = (options: {
  date: string
  itchiness?: number
  inflammation?: number
  dryness?: number
  scratch?: boolean
  weepingSkin?: boolean
  skinCracks?: boolean
  spreadPhotoUrls?: string[]
  notes?: string
}) => ({
  entryDate: options.date,
  tracking: {
    symptoms: {
      itchiness: options.itchiness ?? 5,
      inflammation: options.inflammation ?? 5,
      dryness: options.dryness ?? 5,
      scratch: options.scratch ?? false,
      weepingSkin: options.weepingSkin ?? false,
      skinCracks: options.skinCracks ?? false,
      spreadPhotoUrls: options.spreadPhotoUrls ?? [],
    },
  },
  notes: options.notes ?? '',
})

export const getMonthRange = (monthDate: Date) => {
  const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

  return {
    fromDate: formatDateInput(from),
    toDate: formatDateInput(to),
  }
}

export const getMonthTitle = (monthDate: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate)

export const addAuthCookie = async (
  page: Page,
  token = createFakeAccessToken()
) => {
  await page.context().addCookies([
    {
      name: 'dermatrack_access_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ])
}

export const mockSessionLoggedIn = async (
  page: Page,
  username = VALID_USERNAME
): Promise<void> => {
  await addAuthCookie(page)

  await page.route('**/api/auth/session', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        isLoggedIn: true,
        user: {
          id: '1',
          username,
          email: VALID_EMAIL,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      }),
    })
  )
}
