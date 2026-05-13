import { lightTheme } from '@/lib/themes'
import type { IDiaryEntry } from '@/types/diary'

import {
  addTimelineMonths,
  buildTimelineChartOptions,
  buildTimelineDays,
  buildTimelineEntrySummary,
  buildTimelineHeatmapData,
  calculateTimelineSeverity,
  formatTimelineMonthTitle,
  getTimelineMonthRange,
} from '../utils'

interface IFormatterOption {
  formatter?: (this: unknown) => string
}

interface IChartSeriesWithDataLabels {
  data: { borderColor?: string }[]
  dataLabels?: IFormatterOption[]
}

interface IChartClickOptions {
  plotOptions?: {
    series?: {
      point?: {
        events?: {
          click?: (this: unknown) => void
        }
      }
    }
  }
}

const buildEntry = (
  entryDate: string,
  symptoms: IDiaryEntry['tracking']['symptoms']
): IDiaryEntry => ({
  id: `entry-${entryDate}`,
  entryDate,
  tracking: {
    psyche: {
      stressLevel: 4,
      sleep: 7,
      mentalStrain: 3,
    },
    contactFactors: {
      shower: true,
    },
    symptoms,
  },
  notes: 'Tracked after shower.',
})

describe('timeline template utils', () => {
  it('builds month ranges and labels from local dates', () => {
    const month = new Date(2026, 3, 15)

    expect(getTimelineMonthRange(month)).toEqual({
      fromDate: '2026-04-01',
      toDate: '2026-04-30',
    })
    expect(formatTimelineMonthTitle(month)).toBe('April 2026')
    expect(getTimelineMonthRange(addTimelineMonths(month, -1))).toEqual({
      fromDate: '2026-03-01',
      toDate: '2026-03-31',
    })
  })

  it('calculates the weighted symptom severity used by statistics', () => {
    expect(
      calculateTimelineSeverity(
        buildEntry('2026-04-23', {
          itchiness: 5,
          dryness: 2,
          inflammation: 6,
          scratch: true,
          weepingSkin: false,
          skinCracks: true,
        })
      )
    ).toBe(5.5)
  })

  it('builds timeline days with entries and future markers', () => {
    const entries = [
      buildEntry('2026-04-23', {
        itchiness: 4,
      }),
    ]

    const days = buildTimelineDays(new Date(2026, 3, 1), entries, '2026-04-24')

    expect(days).toHaveLength(30)
    expect(days[0]).toMatchObject({
      date: '2026-04-01',
      dayOfMonth: 1,
      entry: null,
      severity: null,
    })
    expect(days[22]).toMatchObject({
      date: '2026-04-23',
      dayOfMonth: 23,
      isFuture: false,
      entry: entries[0],
      severity: 0.8,
    })
    expect(days[24]).toMatchObject({
      date: '2026-04-25',
      isFuture: true,
    })
  })

  it('positions month days without non-month placeholder tiles', () => {
    const days = buildTimelineDays(new Date(2026, 3, 1), [], '2026-04-30')
    const data = buildTimelineHeatmapData(days)

    expect(data).toHaveLength(30)
    expect(data[0]).toMatchObject({
      x: 3,
      y: 4,
      value: null,
      custom: {
        date: '2026-04-01',
        dayOfMonth: 1,
        empty: false,
      },
    })
    expect(data[data.length - 1]).toMatchObject({
      x: 4,
      y: 0,
      custom: {
        date: '2026-04-30',
        dayOfMonth: 30,
        empty: false,
      },
    })
    expect(data.some(point => point.custom.empty)).toBe(false)
  })

  it('summarizes an entry for the detail panel', () => {
    const entry = buildEntry('2026-04-23', {
      itchiness: 5,
      inflammation: 4,
      dryness: 3,
      scratch: true,
      spreadPhotoUrls: ['https://example.com/p1.jpg'],
    })

    expect(buildTimelineEntrySummary(entry)).toEqual({
      severity: 3.5,
      symptomSummary: 'Itch 5, Inflammation 4, Dryness 3, Scratching',
      factorCount: 4,
      imageUrls: ['https://example.com/p1.jpg'],
    })
  })

  it('builds heatmap chart options with a selected point border', () => {
    const days = buildTimelineDays(
      new Date(2026, 3, 1),
      [
        buildEntry('2026-04-23', {
          itchiness: 4,
        }),
      ],
      '2026-04-30'
    )
    const data = buildTimelineHeatmapData(days)
    const options = buildTimelineChartOptions({
      data,
      monthTitle: 'April 2026',
      onSelectDate: jest.fn(),
      selectedDate: '2026-04-23',
      theme: lightTheme,
    })
    const series = options.series?.[0] as IChartSeriesWithDataLabels
    const selectedPoint = series.data.find(
      point =>
        (point as unknown as { custom: { date: string | null } }).custom
          .date === '2026-04-23'
    )

    expect(options.chart?.type).toBe('heatmap')
    expect(options.xAxis).toMatchObject({ min: 0, max: 6 })
    expect(options.yAxis).toMatchObject({ min: 0, max: 4 })
    expect(selectedPoint?.borderColor).toBe(lightTheme.colors.primary)
  })

  it('reads Highcharts point custom data from formatter and click contexts', () => {
    const onSelectDate = jest.fn()
    const days = buildTimelineDays(
      new Date(2026, 3, 1),
      [
        buildEntry('2026-04-23', {
          itchiness: 4,
        }),
      ],
      '2026-04-30'
    )
    const options = buildTimelineChartOptions({
      data: buildTimelineHeatmapData(days),
      monthTitle: 'April 2026',
      onSelectDate,
      selectedDate: null,
      theme: lightTheme,
    })
    const series = options.series?.[0] as IChartSeriesWithDataLabels
    const dataLabelContext = {
      point: {
        options: {
          custom: {
            date: '2026-04-23',
            dayOfMonth: 23,
            empty: false,
            hasEntry: true,
            isFuture: false,
            severity: 0.8,
          },
        },
      },
    }

    expect(series.dataLabels?.[0].formatter?.call(dataLabelContext)).toBe('23')
    expect(series.dataLabels?.[1].formatter?.call(dataLabelContext)).toBe('0.8')

    const clickHandler = (options as IChartClickOptions).plotOptions?.series
      ?.point?.events?.click
    clickHandler?.call({
      options: {
        custom: {
          date: '2026-04-23',
          dayOfMonth: 23,
          empty: false,
          hasEntry: true,
          isFuture: false,
          severity: 0.8,
        },
      },
    })

    expect(onSelectDate).toHaveBeenCalledWith('2026-04-23')
  })
})
