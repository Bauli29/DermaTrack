import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

import { mockSessionLoggedIn } from './test-utils'

const DATE_RANGE = {
  from: '2026-05-21',
  to: '2026-05-27',
}

const mockStatisticsApis = async (page: Page) => {
  await page.route('**/api/statistics/psyche-symptoms**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        chartType: 'line',
        categories: ['2026-05-21', '2026-05-22'],
        series: [
          { name: 'Mental Strain', data: [3, 4] },
          { name: 'Stress Level', data: [2, 5] },
          { name: 'Sleep', data: [7, 6] },
          { name: 'Weighted Symptoms', data: [4.5, 5.2] },
        ],
        dateRange: DATE_RANGE,
      }),
    })
  )

  await page.route('**/api/statistics/symptoms**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        chartType: 'column',
        categories: ['2026-05-21', '2026-05-22'],
        series: [
          { name: 'Itchiness', data: [6, 7] },
          { name: 'Dryness', data: [4, 5] },
          { name: 'Inflammation', data: [3, 4] },
        ],
        dateRange: DATE_RANGE,
      }),
    })
  )

  await page.route('**/api/statistics/correlation**', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        chartType: 'column',
        categories: ['Nutrition', 'Care product'],
        series: [{ name: 'Correlation', data: [0.42, -0.23] }],
        dateRange: DATE_RANGE,
      }),
    })
  )
}

test.describe('Statistics page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSessionLoggedIn(page)
    await mockStatisticsApis(page)

    await page.goto('/statistics')
  })

  test('renders chart export actions for loaded statistics', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Statistics', level: 2 })
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'PNG', exact: true })
    ).toHaveCount(3)
    await expect(
      page.getByRole('button', { name: 'PDF', exact: true })
    ).toHaveCount(3)
    await expect(page.locator('.highcharts-contextbutton')).toHaveCount(0)
  })

  test('downloads the loaded statistics as csv', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.getByRole('button', { name: 'Export CSV' }).click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(
      'dermatrack-statistics-2026-05-21-to-2026-05-27.csv'
    )

    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()

    if (!downloadPath) {
      throw new Error('CSV download path was not available.')
    }

    const csv = await readFile(downloadPath, 'utf8')
    expect(csv).toContain('Chart,Category,Series,Value,From,To')
    expect(csv).toContain('Psyche & Symptoms,2026-05-21,Mental Strain,3')
    expect(csv).toContain('Correlation - Care products,Nutrition,Correlation')
  })

  test('downloads individual chart image and pdf exports', async ({ page }) => {
    const psycheExports = page.getByLabel('Psyche & Symptoms exports')

    const pngDownloadPromise = page.waitForEvent('download')
    await psycheExports
      .getByRole('button', { name: 'PNG', exact: true })
      .click()
    const pngDownload = await pngDownloadPromise
    expect(pngDownload.suggestedFilename()).toBe(
      'psyche-symptoms-2026-05-21-to-2026-05-27.png'
    )

    const pdfDownloadPromise = page.waitForEvent('download')
    await psycheExports
      .getByRole('button', { name: 'PDF', exact: true })
      .click()
    const pdfDownload = await pdfDownloadPromise
    expect(pdfDownload.suggestedFilename()).toBe(
      'psyche-symptoms-2026-05-21-to-2026-05-27.pdf'
    )
  })
})
