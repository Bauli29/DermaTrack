import { lightTheme } from '@/lib/themes'

import {
  buildStatisticsAxisTickIndices,
  buildStatisticsChartOptions,
  buildStatisticsSeriesSnapshots,
  formatStatisticsAxisDate,
  formatStatisticsDate,
  formatStatisticsRange,
  formatStatisticsScore,
  hasRenderableStatisticsChart,
} from '../utils'

const sampleLineChart = {
  chartType: 'line' as const,
  categories: ['2026-04-23', '2026-04-24'],
  series: [
    { name: 'Mental Strain', data: [3, 4] },
    { name: 'Stress Level', data: [2, 5] },
  ],
  dateRange: {
    from: '2026-04-23',
    to: '2026-04-24',
  },
}

const sampleColumnChart = {
  chartType: 'column' as const,
  categories: ['2026-04-23', '2026-04-24'],
  series: [{ name: 'Itchiness', data: [6, 7] }],
  dateRange: {
    from: '2026-04-23',
    to: '2026-04-24',
  },
}

describe('statistics template utils', () => {
  it('formats api dates into readable labels', () => {
    expect(formatStatisticsDate('2026-04-29')).toBe('29 Apr 2026')
    expect(formatStatisticsAxisDate('2026-04-29')).toBe('29 Apr')
    expect(formatStatisticsRange('2026-04-23', '2026-04-29')).toBe(
      '23 Apr 2026 - 29 Apr 2026'
    )
  })

  it('formats chart score labels', () => {
    expect(formatStatisticsScore(4)).toBe('4')
    expect(formatStatisticsScore(4.25)).toBe('4.3')
    expect(formatStatisticsScore(null)).toBe('N/A')
  })

  it('builds sparse axis ticks for longer periods', () => {
    const categories = Array.from({ length: 30 }, (_, index) => {
      const day = `${index + 1}`.padStart(2, '0')
      return `2026-04-${day}`
    })

    expect(buildStatisticsAxisTickIndices(categories.length)).toEqual([
      0, 4, 8, 12, 17, 21, 25, 29,
    ])
  })

  it('builds latest recorded series snapshots', () => {
    const snapshots = buildStatisticsSeriesSnapshots(
      {
        ...sampleLineChart,
        series: [
          { name: 'Mental Strain', data: [null, 4.25] },
          { name: 'Stress Level', data: [2, null] },
        ],
      },
      lightTheme
    )

    expect(snapshots).toEqual([
      {
        name: 'Mental Strain',
        color: lightTheme.colors.primary,
        value: 4.25,
        date: '2026-04-24',
      },
      {
        name: 'Stress Level',
        color: lightTheme.colors.attention,
        value: 2,
        date: '2026-04-23',
      },
    ])
  })

  it('detects whether a chart is renderable', () => {
    expect(hasRenderableStatisticsChart(sampleLineChart)).toBe(true)
    expect(
      hasRenderableStatisticsChart({
        ...sampleLineChart,
        series: [{ name: 'Mental Strain', data: [null, null] }],
      })
    ).toBe(false)
  })

  it('builds line-chart options for Highcharts', () => {
    const options = buildStatisticsChartOptions(sampleLineChart, lightTheme)

    expect(options.chart?.type).toBe('line')
    expect(options.xAxis).toEqual(
      expect.objectContaining({
        tickPositions: [0, 1],
        labels: expect.objectContaining({
          enabled: true,
          reserveSpace: true,
        }),
      })
    )
    const xAxis = options.xAxis as {
      labels?: {
        formatter?: (this: {
          axis: { categories?: string[] }
          pos: number
          value: number | string
        }) => string
      }
    }

    expect(
      xAxis.labels?.formatter?.call({
        axis: { categories: sampleLineChart.categories },
        pos: 0,
        value: 0,
      })
    ).toBe('23<br/>Apr')
    expect(options.yAxis).toEqual(
      expect.objectContaining({
        min: -1,
        max: 10,
        tickPositions: [-1, 0, 2, 4, 6, 8, 10],
        plotLines: [
          expect.objectContaining({
            value: 0,
          }),
        ],
        showFirstLabel: true,
      })
    )
    const yAxis = options.yAxis as {
      labels?: {
        formatter?: (this: { value: number }) => string
      }
    }

    expect(yAxis.labels?.formatter?.call({ value: -1 })).toBe('')
    expect(yAxis.labels?.formatter?.call({ value: 0 })).toBe('0')
    expect(options.legend?.enabled).toBe(false)
    expect(options.plotOptions?.series).toEqual(
      expect.objectContaining({
        clip: false,
      })
    )
    expect(options.series).toEqual([
      expect.objectContaining({
        type: 'line',
        name: 'Mental Strain',
        data: [3, 4],
      }),
      expect.objectContaining({
        type: 'line',
        name: 'Stress Level',
        data: [2, 5],
      }),
    ])
  })

  it('builds column-chart options for Highcharts', () => {
    const options = buildStatisticsChartOptions(sampleColumnChart, lightTheme)

    expect(options.chart?.type).toBe('column')
    expect(options.plotOptions?.column).toEqual(
      expect.objectContaining({
        minPointLength: 3,
      })
    )
    expect(options.series).toEqual([
      expect.objectContaining({
        type: 'column',
        name: 'Itchiness',
        data: [6, 7],
      }),
    ])
  })
})
