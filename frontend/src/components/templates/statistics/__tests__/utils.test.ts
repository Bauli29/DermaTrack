import { lightTheme } from '@/lib/themes'

import {
  buildFactorDistributionChartOptions,
  buildFactorDistributionData,
  buildStatisticsExportCsv,
  buildStatisticsAxisTickIndices,
  buildStatisticsSeriesSnapshots,
  buildStatisticsChartOptions,
  buildStatisticsExportFilename,
  formatStatisticsAxisDate,
  formatStatisticsCorrelation,
  formatStatisticsDate,
  formatStatisticsPercent,
  formatStatisticsRange,
  formatStatisticsScore,
  formatStatisticsSignedScore,
  getFactorImpactTone,
  getStatisticsPeriodLabel,
  hasRenderableFactorDistribution,
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
  dataQuality: {
    dataPointCount: 2,
    minimumRecommendedDataPoints: 7,
    insufficientData: true,
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
  dataQuality: sampleLineChart.dataQuality,
}

const sampleFactorImpacts = {
  dateRange: {
    from: '2026-04-23',
    to: '2026-04-24',
  },
  totalEntries: 2,
  averageWeightedSymptomScore: 5.2,
  dataQuality: sampleLineChart.dataQuality,
  factors: [
    {
      key: 'nutrition.nuts',
      label: 'Nuts',
      category: 'Nutrition',
      totalEntries: 2,
      occurrenceCount: 1,
      occurrenceRate: 50,
      averageWeightedSymptomScore: 7.5,
      weightedSymptomDelta: 2.3,
      pearsonCorrelation: 0.8,
    },
    {
      key: 'nutrition.alcohol',
      label: 'Alcohol',
      category: 'Nutrition',
      totalEntries: 2,
      occurrenceCount: 1,
      occurrenceRate: 50,
      averageWeightedSymptomScore: 6.5,
      weightedSymptomDelta: 1.3,
      pearsonCorrelation: 0.5,
    },
    {
      key: 'contact.pollen',
      label: 'Pollen',
      category: 'Contact',
      totalEntries: 2,
      occurrenceCount: 1,
      occurrenceRate: 50,
      averageWeightedSymptomScore: 5.5,
      weightedSymptomDelta: 0.3,
      pearsonCorrelation: 0.2,
    },
  ],
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
    expect(formatStatisticsSignedScore(1.25)).toBe('+1.3')
    expect(formatStatisticsSignedScore(-0.25)).toBe('-0.3')
    expect(formatStatisticsSignedScore(0)).toBe('0')
    expect(formatStatisticsSignedScore(null)).toBe('N/A')
    expect(formatStatisticsPercent(42.86)).toBe('42.9%')
    expect(formatStatisticsCorrelation(0.538)).toBe('0.54')
    expect(formatStatisticsCorrelation(null)).toBe('N/A')
  })

  it('returns factor impact tone from weighted symptom deltas', () => {
    expect(getFactorImpactTone(0.2)).toBe('higher')
    expect(getFactorImpactTone(-0.2)).toBe('lower')
    expect(getFactorImpactTone(0.05)).toBe('neutral')
    expect(getFactorImpactTone(null)).toBe('neutral')
  })

  it('builds a CSV export for charts and factor insights', () => {
    const csv = buildStatisticsExportCsv({
      psycheSymptoms: sampleLineChart,
      symptoms: sampleColumnChart,
      factorImpacts: {
        ...sampleFactorImpacts,
        factors: [
          {
            ...sampleFactorImpacts.factors[0],
            label: 'Nuts, roasted',
          },
        ],
      },
    })

    expect(csv).toContain('section,date,series_or_factor,value')
    expect(csv).toContain('psyche_symptoms,2026-04-23,Mental Strain,3')
    expect(csv).toContain('symptoms,2026-04-24,Itchiness,7')
    expect(csv).toContain(
      'factor_impacts,,"Nuts, roasted",,Nutrition,1,2,50,7.5,2.3,0.8,2026-04-23 - 2026-04-24'
    )
  })

  it('builds stable export filenames', () => {
    expect(
      buildStatisticsExportFilename(
        'factor-distribution',
        '2026-04-23',
        '2026-04-24'
      )
    ).toBe('dermatrack-factor-distribution-2026-04-23-to-2026-04-24')
  })

  it('returns display labels for statistics periods', () => {
    expect(getStatisticsPeriodLabel('7d')).toBe('7 days')
    expect(getStatisticsPeriodLabel('30d')).toBe('30 days')
    expect(getStatisticsPeriodLabel('90d')).toBe('3 months')
    expect(getStatisticsPeriodLabel('6m')).toBe('6 months')
    expect(getStatisticsPeriodLabel('1y')).toBe('1 year')
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

  it('builds factor distribution data and detects renderable distributions', () => {
    expect(buildFactorDistributionData(sampleFactorImpacts)).toEqual([
      {
        name: 'Nutrition',
        y: 2,
      },
      {
        name: 'Contact',
        y: 1,
      },
    ])
    expect(hasRenderableFactorDistribution(sampleFactorImpacts)).toBe(true)
    expect(
      hasRenderableFactorDistribution({
        ...sampleFactorImpacts,
        totalEntries: 0,
        factors: [],
      })
    ).toBe(false)
  })

  it('builds line-chart options for Highcharts', () => {
    const options = buildStatisticsChartOptions(sampleLineChart, lightTheme)

    expect(options.chart?.type).toBe('line')
    expect(options.chart).toEqual(
      expect.objectContaining({
        panKey: 'shift',
        panning: expect.objectContaining({
          enabled: true,
          type: 'x',
        }),
        zooming: expect.objectContaining({
          type: 'x',
        }),
      })
    )
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
    expect(options.legend?.enabled).toBe(true)
    expect(options.exporting).toEqual(
      expect.objectContaining({
        enabled: false,
        fallbackToExportServer: false,
        filename: 'dermatrack-psyche-symptoms-2026-04-23-to-2026-04-24',
      })
    )
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

  it('builds factor distribution pie-chart options for Highcharts', () => {
    const options = buildFactorDistributionChartOptions(
      sampleFactorImpacts,
      lightTheme
    )

    expect(options.chart?.type).toBe('pie')
    expect(options.legend?.enabled).toBe(true)
    expect(options.exporting).toEqual(
      expect.objectContaining({
        enabled: false,
        fallbackToExportServer: false,
        filename: 'dermatrack-factor-distribution-2026-04-23-to-2026-04-24',
      })
    )
    expect(options.series).toEqual([
      expect.objectContaining({
        type: 'pie',
        name: 'Factor occurrences',
        data: [
          {
            name: 'Nutrition',
            y: 2,
          },
          {
            name: 'Contact',
            y: 1,
          },
        ],
      }),
    ])
  })
})
