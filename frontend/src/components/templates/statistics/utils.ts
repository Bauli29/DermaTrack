import type {
  AxisLabelsFormatterContextObject,
  CSSObject,
  Options,
  SeriesColumnOptions,
  SeriesLineOptions,
  SeriesPieOptions,
} from 'highcharts'

import type { ITheme } from '@/lib/themes'
import type {
  TStatisticsChart,
  TStatisticsPeriod,
  TFactorImpactStatistics,
} from '@/services/statistics/types'

const createLegendItemStyle = (theme: ITheme): CSSObject => ({
  color: theme.colors.text,
  fontSize: '12px',
  fontWeight: '500',
})

export interface IStatisticsSeriesSnapshot {
  name: string
  color: string
  value: number | null
  date: string | null
}

export interface IStatisticsPeriodOption {
  value: TStatisticsPeriod
  label: string
}

export interface IStatisticsExportData {
  psycheSymptoms: TStatisticsChart
  symptoms: TStatisticsChart
  factorImpacts: TFactorImpactStatistics
}

export interface IFactorDistributionPoint {
  name: string
  y: number
}

const MAX_DENSE_AXIS_TICKS = 10
const MAX_SPARSE_AXIS_TICKS = 8
const SCORE_AXIS_VISIBLE_MIN = -1
const SCORE_AXIS_MAX = 10
const SCORE_AXIS_PADDING_TICK = -1
const SCORE_AXIS_VISIBLE_TICKS = [0, 2, 4, 6, 8, 10]
const SCORE_AXIS_TICKS = [SCORE_AXIS_PADDING_TICK, ...SCORE_AXIS_VISIBLE_TICKS]
const CHART_EXPORT_SOURCE_WIDTH = 960
const CHART_EXPORT_SOURCE_HEIGHT = 540

const formatScoreAxisLabel = function (
  this: AxisLabelsFormatterContextObject
): string {
  return Number(this.value) < 0 ? '' : String(this.value)
}

const formatDateAxisLabel = function (
  this: AxisLabelsFormatterContextObject
): string {
  const categories = this.axis.categories as string[] | undefined
  const value =
    typeof this.value === 'string'
      ? this.value
      : (categories?.[this.pos] ?? String(this.value))
  const [day, month] = formatStatisticsAxisDate(value).split(' ')

  return month ? `${day}<br/>${month}` : day
}

export const STATISTICS_PERIOD_OPTIONS: IStatisticsPeriodOption[] = [
  {
    value: '7d',
    label: '7 days',
  },
  {
    value: '30d',
    label: '30 days',
  },
  {
    value: '90d',
    label: '3 months',
  },
  {
    value: '6m',
    label: '6 months',
  },
  {
    value: '1y',
    label: '1 year',
  },
]

export const getStatisticsPeriodLabel = (period: TStatisticsPeriod): string =>
  STATISTICS_PERIOD_OPTIONS.find(option => option.value === period)?.label ??
  '30 days'

export const getStatisticsSeriesColors = (
  chartType: TStatisticsChart['chartType'],
  theme: ITheme
): string[] =>
  chartType === 'line'
    ? [
        theme.colors.primary,
        theme.colors.attention,
        theme.colors.secondary,
        theme.colors.critical,
      ]
    : [theme.colors.primary, theme.colors.info, theme.colors.critical]

const buildSeriesOptions = (chart: TStatisticsChart): Options['series'] =>
  chart.series.map((series, index) => {
    const baseSeries = {
      id: `${chart.chartType}-${series.name}-${index}`,
      name: series.name,
      data: series.data,
    }

    return chart.chartType === 'line'
      ? ({
          ...baseSeries,
          type: 'line',
        } satisfies SeriesLineOptions)
      : ({
          ...baseSeries,
          type: 'column',
        } satisfies SeriesColumnOptions)
  })

export const buildStatisticsExportFilename = (
  section: string,
  from: string,
  to: string
): string => `dermatrack-${section}-${from}-to-${to}`

const buildChartExportOptions = (
  filename: string,
  theme: ITheme
): Options['exporting'] => ({
  enabled: false,
  fallbackToExportServer: false,
  filename,
  sourceHeight: CHART_EXPORT_SOURCE_HEIGHT,
  sourceWidth: CHART_EXPORT_SOURCE_WIDTH,
  chartOptions: {
    chart: {
      backgroundColor: theme.colors.surface,
    },
  },
})

export const formatStatisticsDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatStatisticsRange = (from: string, to: string): string =>
  `${formatStatisticsDate(from)} - ${formatStatisticsDate(to)}`

export const formatStatisticsAxisDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

export const formatStatisticsScore = (value: number | null): string => {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
  }).format(value)
}

export const formatStatisticsSignedScore = (value: number | null): string => {
  if (value === null) {
    return 'N/A'
  }

  const formatted = formatStatisticsScore(Math.abs(value))
  if (value > 0) {
    return `+${formatted}`
  }

  if (value < 0) {
    return `-${formatted}`
  }

  return '0'
}

export const formatStatisticsPercent = (value: number): string =>
  `${new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
  }).format(value)}%`

export const formatStatisticsCorrelation = (value: number | null): string => {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 2,
  }).format(value)
}

export const getFactorImpactTone = (
  delta: number | null
): 'higher' | 'lower' | 'neutral' => {
  if (delta === null || Math.abs(delta) < 0.1) {
    return 'neutral'
  }

  return delta > 0 ? 'higher' : 'lower'
}

const formatCsvValue = (value: string | number | null): string => {
  if (value === null) {
    return ''
  }

  const rawValue = String(value)
  if (
    rawValue.includes(',') ||
    rawValue.includes('"') ||
    rawValue.includes('\n')
  ) {
    return `"${rawValue.replaceAll('"', '""')}"`
  }

  return rawValue
}

const appendChartRows = (
  rows: (string | number | null)[][],
  section: string,
  chart: TStatisticsChart
) => {
  chart.series.forEach(series => {
    series.data.forEach((value, index) => {
      rows.push([
        section,
        chart.categories[index] ?? null,
        series.name,
        value,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ])
    })
  })
}

export const buildStatisticsExportCsv = (
  statistics: IStatisticsExportData
): string => {
  const rows: (string | number | null)[][] = [
    [
      'section',
      'date',
      'series_or_factor',
      'value',
      'category',
      'occurrence_count',
      'total_entries',
      'occurrence_rate_percent',
      'average_weighted_symptom_score',
      'weighted_symptom_delta',
      'pearson_correlation',
      'date_range',
    ],
  ]
  const factorDateRange = `${statistics.factorImpacts.dateRange.from} - ${statistics.factorImpacts.dateRange.to}`

  appendChartRows(rows, 'psyche_symptoms', statistics.psycheSymptoms)
  appendChartRows(rows, 'symptoms', statistics.symptoms)

  statistics.factorImpacts.factors.forEach(factor => {
    rows.push([
      'factor_impacts',
      null,
      factor.label,
      null,
      factor.category,
      factor.occurrenceCount,
      factor.totalEntries,
      factor.occurrenceRate,
      factor.averageWeightedSymptomScore,
      factor.weightedSymptomDelta,
      factor.pearsonCorrelation,
      factorDateRange,
    ])
  })

  return rows.map(row => row.map(formatCsvValue).join(',')).join('\r\n')
}

export const buildFactorDistributionData = (
  factorImpacts: TFactorImpactStatistics
): IFactorDistributionPoint[] => {
  const categoryTotals = new Map<string, number>()

  factorImpacts.factors.forEach(factor => {
    if (factor.occurrenceCount <= 0) {
      return
    }

    categoryTotals.set(
      factor.category,
      (categoryTotals.get(factor.category) ?? 0) + factor.occurrenceCount
    )
  })

  return Array.from(categoryTotals.entries())
    .map(([name, y]) => ({ name, y }))
    .sort(
      (left, right) => right.y - left.y || left.name.localeCompare(right.name)
    )
}

export const buildStatisticsAxisTickIndices = (
  categoryCount: number
): number[] => {
  if (categoryCount <= 0) {
    return []
  }

  if (categoryCount <= MAX_DENSE_AXIS_TICKS) {
    return Array.from({ length: categoryCount }, (_, index) => index)
  }

  const lastIndex = categoryCount - 1
  const selectedIndices = new Set<number>()

  for (let tickIndex = 0; tickIndex < MAX_SPARSE_AXIS_TICKS; tickIndex += 1) {
    selectedIndices.add(
      Math.round((tickIndex * lastIndex) / (MAX_SPARSE_AXIS_TICKS - 1))
    )
  }

  return Array.from(selectedIndices).sort((left, right) => left - right)
}

const findLatestRecordedPoint = (
  data: (number | null)[],
  categories: string[]
): Pick<IStatisticsSeriesSnapshot, 'value' | 'date'> => {
  for (let index = data.length - 1; index >= 0; index -= 1) {
    const value = data[index]

    if (value !== null) {
      return {
        value,
        date: categories[index] ?? null,
      }
    }
  }

  return {
    value: null,
    date: null,
  }
}

export const buildStatisticsSeriesSnapshots = (
  chart: TStatisticsChart,
  theme: ITheme
): IStatisticsSeriesSnapshot[] => {
  const colors = getStatisticsSeriesColors(chart.chartType, theme)

  return chart.series.map((series, index) => {
    const latestRecordedPoint = findLatestRecordedPoint(
      series.data,
      chart.categories
    )

    return {
      name: series.name,
      color: colors[index % colors.length],
      ...latestRecordedPoint,
    }
  })
}

export const hasRenderableStatisticsChart = (
  chart: TStatisticsChart
): boolean =>
  chart.categories.length > 0 &&
  chart.series.length > 0 &&
  chart.series.some(series => series.data.some(value => value !== null))

export const hasRenderableFactorDistribution = (
  factorImpacts: TFactorImpactStatistics
): boolean =>
  factorImpacts.totalEntries > 0 &&
  factorImpacts.factors.some(factor => factor.occurrenceCount > 0)

export const buildStatisticsChartOptions = (
  chart: TStatisticsChart,
  theme: ITheme
): Options => ({
  accessibility: {
    enabled: false,
  },
  chart: {
    type: chart.chartType,
    backgroundColor: 'transparent',
    height: null,
    spacing: [8, 8, 8, 0],
    panning: {
      enabled: true,
      type: 'x',
    },
    panKey: 'shift',
    style: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
    },
    zooming: {
      type: 'x',
    },
  },
  colors: getStatisticsSeriesColors(chart.chartType, theme),
  credits: {
    enabled: false,
  },
  exporting: buildChartExportOptions(
    buildStatisticsExportFilename(
      chart.chartType === 'line' ? 'psyche-symptoms' : 'symptoms',
      chart.dateRange.from,
      chart.dateRange.to
    ),
    theme
  ),
  legend: {
    enabled: true,
    align: 'left',
    verticalAlign: 'top',
    itemDistance: 12,
    itemStyle: createLegendItemStyle(theme),
  },
  title: {
    text: undefined,
  },
  xAxis: {
    categories: chart.categories,
    lineColor: theme.colors.border,
    maxPadding: 0.04,
    minPadding: 0.04,
    tickColor: theme.colors.border,
    tickPositions: buildStatisticsAxisTickIndices(chart.categories.length),
    labels: {
      enabled: true,
      formatter: formatDateAxisLabel,
      reserveSpace: true,
      style: {
        color: theme.colors.textSecondary,
        fontSize: '11px',
        lineHeight: '13px',
      },
    },
  },
  yAxis: {
    min: SCORE_AXIS_VISIBLE_MIN,
    max: SCORE_AXIS_MAX,
    tickPositions: SCORE_AXIS_TICKS,
    startOnTick: false,
    endOnTick: true,
    showFirstLabel: true,
    showLastLabel: true,
    gridLineColor: theme.colors.borderLight,
    plotLines: [
      {
        value: 0,
        color: theme.colors.border,
        width: 1,
        zIndex: 3,
      },
    ],
    title: {
      text: 'Score',
      style: {
        color: theme.colors.textSecondary,
        fontSize: '12px',
      },
    },
    labels: {
      formatter: formatScoreAxisLabel,
      overflow: 'allow',
      style: {
        color: theme.colors.textSecondary,
      },
    },
  },
  tooltip: {
    shared: true,
    valueDecimals: 1,
  },
  plotOptions: {
    series: {
      animation: false,
      lineWidth: chart.chartType === 'line' ? 2.5 : undefined,
      clip: false,
      marker:
        chart.chartType === 'line'
          ? {
              enabled: true,
              radius: 3,
            }
          : undefined,
    },
    column: {
      borderRadius: 4,
      groupPadding: 0.12,
      minPointLength: 3,
      pointPadding: 0.08,
    },
  },
  series: buildSeriesOptions(chart),
})

export const buildFactorDistributionChartOptions = (
  factorImpacts: TFactorImpactStatistics,
  theme: ITheme
): Options => {
  const data = buildFactorDistributionData(factorImpacts)

  return {
    accessibility: {
      enabled: false,
    },
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: null,
      spacing: [8, 8, 8, 0],
      style: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      },
    },
    colors: [
      theme.colors.primary,
      theme.colors.attention,
      theme.colors.success,
      theme.colors.info,
      theme.colors.secondary,
      theme.colors.warning,
      theme.colors.critical,
      theme.colors.error,
    ],
    credits: {
      enabled: false,
    },
    exporting: buildChartExportOptions(
      buildStatisticsExportFilename(
        'factor-distribution',
        factorImpacts.dateRange.from,
        factorImpacts.dateRange.to
      ),
      theme
    ),
    legend: {
      enabled: true,
      align: 'left',
      verticalAlign: 'top',
      itemDistance: 12,
      itemStyle: createLegendItemStyle(theme),
    },
    title: {
      text: undefined,
    },
    tooltip: {
      pointFormat: '<b>{point.y}</b> occurrences ({point.percentage:.1f}%)',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        borderColor: theme.colors.surface,
        borderWidth: 2,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          distance: 12,
          format: '{point.name}: {point.percentage:.1f}%',
          style: {
            color: theme.colors.textSecondary,
            fontSize: '11px',
            fontWeight: '500',
            textOutline: 'none',
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        type: 'pie',
        name: 'Factor occurrences',
        data,
      } satisfies SeriesPieOptions,
    ],
  }
}
