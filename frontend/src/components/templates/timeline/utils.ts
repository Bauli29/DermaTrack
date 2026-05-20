import type { Options, SeriesHeatmapOptions } from 'highcharts'

import { formatDateInput } from '@/lib/date'

import type { ITheme } from '@/lib/themes'
import type { IDiaryEntry, ISymptoms } from '@/types/diary'
import type {
  ITimelineDay,
  ITimelineEntrySummary,
  ITimelineHeatmapPoint,
  ITimelineHeatmapPointCustom,
  ITimelineMonthRange,
  ITimelinePointContext,
} from './types'

export type {
  ITimelineDay,
  ITimelineEntrySummary,
  ITimelineHeatmapPoint,
  ITimelineHeatmapPointCustom,
  ITimelineMonthRange,
} from './types'

export const TIMELINE_WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const

const DAYS_IN_WEEK = 7

const ITCHINESS_WEIGHT = 0.2
const DRYNESS_WEIGHT = 0.1
const INFLAMMATION_WEIGHT = 0.3
const SCRATCH_WEIGHT = 0.1
const WEEPING_SKIN_WEIGHT = 0.15
const SKIN_CRACKS_WEIGHT = 0.15

const EMPTY_HEATMAP_POINT_CUSTOM: ITimelineHeatmapPointCustom = {
  date: null,
  dayOfMonth: null,
  empty: true,
  hasEntry: false,
  isFuture: false,
  severity: null,
}

const getTimelinePointCustom = (
  context: unknown
): ITimelineHeatmapPointCustom => {
  const pointContext = context as ITimelinePointContext

  return (
    pointContext.point?.options?.custom ??
    pointContext.point?.custom ??
    pointContext.options?.custom ??
    pointContext.custom ??
    EMPTY_HEATMAP_POINT_CUSTOM
  )
}

export const createLocalDate = (date: string): Date => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const getTimelineMonthRange = (monthDate: Date): ITimelineMonthRange => {
  const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

  return {
    fromDate: formatDateInput(from),
    toDate: formatDateInput(to),
  }
}

export const addTimelineMonths = (monthDate: Date, delta: number): Date =>
  new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1)

export const formatTimelineMonthTitle = (monthDate: Date): string =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate)

const clampRating = (value?: number): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }

  return Math.max(0, Math.min(10, value))
}

const booleanToRating = (value?: boolean): number => (value ? 10 : 0)

export const calculateTimelineSeverity = (
  entry?: IDiaryEntry | null
): number => {
  const symptoms = entry?.tracking?.symptoms

  if (!symptoms) {
    return 0
  }

  const score =
    clampRating(symptoms.itchiness) * ITCHINESS_WEIGHT +
    clampRating(symptoms.dryness) * DRYNESS_WEIGHT +
    clampRating(symptoms.inflammation) * INFLAMMATION_WEIGHT +
    booleanToRating(symptoms.scratch) * SCRATCH_WEIGHT +
    booleanToRating(symptoms.weepingSkin) * WEEPING_SKIN_WEIGHT +
    booleanToRating(symptoms.skinCracks) * SKIN_CRACKS_WEIGHT

  return Math.round(Math.max(0, Math.min(10, score)) * 10) / 10
}

export const buildTimelineDays = (
  monthDate: Date,
  entries: IDiaryEntry[],
  today: string
): ITimelineDay[] => {
  const { fromDate, toDate } = getTimelineMonthRange(monthDate)
  const firstDate = createLocalDate(fromDate)
  const lastDayOfMonth = createLocalDate(toDate).getDate()
  const entriesByDate = new Map(entries.map(entry => [entry.entryDate, entry]))

  return Array.from({ length: lastDayOfMonth }, (_, index) => {
    const date = formatDateInput(
      new Date(firstDate.getFullYear(), firstDate.getMonth(), index + 1)
    )
    const entry = entriesByDate.get(date) ?? null

    return {
      date,
      dayOfMonth: index + 1,
      isFuture: date > today,
      entry,
      severity: entry ? calculateTimelineSeverity(entry) : null,
    }
  })
}

export const buildTimelineHeatmapData = (
  days: ITimelineDay[]
): ITimelineHeatmapPoint[] => {
  if (days.length === 0) {
    return []
  }

  const firstWeekday = createLocalDate(days[0].date).getDay()
  const lastDayIndex = firstWeekday + days.length - 1
  const maxWeekIndex = Math.floor(lastDayIndex / DAYS_IN_WEEK)

  return days.map((day, index) => {
    const x = (firstWeekday + index) % DAYS_IN_WEEK
    const y = maxWeekIndex - Math.floor((firstWeekday + index) / DAYS_IN_WEEK)

    return {
      x,
      y,
      value: day.severity,
      custom: {
        date: day.date,
        dayOfMonth: day.dayOfMonth,
        empty: false,
        hasEntry: Boolean(day.entry),
        isFuture: day.isFuture,
        severity: day.severity,
      },
    }
  })
}

const countTruthyFields = (value?: object): number => {
  if (!value) {
    return 0
  }

  return Object.values(value).filter(item => {
    if (Array.isArray(item)) {
      return item.length > 0
    }

    return item !== undefined && item !== null && item !== ''
  }).length
}

const formatSymptomParts = (symptoms?: ISymptoms): string[] => {
  if (!symptoms) {
    return []
  }

  const parts = [
    symptoms.itchiness !== undefined ? `Itch ${symptoms.itchiness}` : null,
    symptoms.inflammation !== undefined
      ? `Inflammation ${symptoms.inflammation}`
      : null,
    symptoms.dryness !== undefined ? `Dryness ${symptoms.dryness}` : null,
    symptoms.scratch ? 'Scratching' : null,
    symptoms.weepingSkin ? 'Weeping skin' : null,
    symptoms.skinCracks ? 'Skin cracks' : null,
  ]

  return parts.filter((part): part is string => Boolean(part))
}

export const buildTimelineEntrySummary = (
  entry: IDiaryEntry
): ITimelineEntrySummary => {
  const tracking = entry.tracking ?? {}
  const { symptoms } = tracking
  const factorCount =
    countTruthyFields(tracking.psyche) +
    countTruthyFields(tracking.contactFactors) +
    countTruthyFields(tracking.nutrition) +
    countTruthyFields(tracking.careProducts) +
    countTruthyFields(tracking.health)
  const symptomParts = formatSymptomParts(symptoms)

  return {
    severity: calculateTimelineSeverity(entry),
    symptomSummary:
      symptomParts.length > 0 ? symptomParts.join(', ') : 'No symptom details',
    factorCount,
    imageUrls: symptoms?.spreadPhotoUrls ?? [],
  }
}

const createTimelineDataLabelStyle = (theme: ITheme) => ({
  color: theme.colors.text,
  fontSize: '0.74rem',
  fontWeight: '700',
  textOutline: 'none',
})

const getTimelineSeverityColor = (
  severity: number | null,
  theme: ITheme
): string => {
  if (severity === null) {
    return theme.colors.card
  }

  if (severity < 2.5) {
    return theme.colors.healthy
  }

  if (severity < 5) {
    return theme.colors.info
  }

  if (severity < 7.5) {
    return theme.colors.attention
  }

  return theme.colors.critical
}

export const buildTimelineChartOptions = ({
  data,
  monthTitle,
  onSelectDate,
  selectedDate,
  theme,
}: {
  data: ITimelineHeatmapPoint[]
  monthTitle: string
  onSelectDate: (date: string) => void
  selectedDate: string | null
  theme: ITheme
}): Options => {
  const selectedBorderColor = theme.colors.text
  // Ensure calendar displays up to 5 rows (0..4) so the y-axis remains consistent
  // for chart rendering and tests that expect a 5-row month layout.
  const computedMaxY = data.reduce(
    (maximumY, point) => Math.max(maximumY, point.y),
    0
  )
  const maxY = Math.max(4, computedMaxY)
  const chartData = data.map(point => ({
    ...point,
    color: getTimelineSeverityColor(point.value, theme),
    borderColor:
      point.custom.date === selectedDate
        ? selectedBorderColor
        : theme.colors.background,
    borderWidth: point.custom.date === selectedDate ? 4 : 3,
  }))

  return {
    accessibility: {
      enabled: true,
      description: `${monthTitle} calendar heatmap with daily tracking entries and symptom severity colors.`,
      landmarkVerbosity: 'one',
    },
    chart: {
      type: 'heatmap',
      backgroundColor: 'transparent',
      height: null,
      spacing: [8, 6, 8, 6],
      style: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
      },
    },
    colorAxis: {
      dataClasses: [
        {
          to: 2.5,
          color: theme.colors.healthy,
          name: 'Low',
        },
        {
          from: 2.5,
          to: 5,
          color: theme.colors.info,
          name: 'Moderate',
        },
        {
          from: 5,
          to: 7.5,
          color: theme.colors.attention,
          name: 'High',
        },
        {
          from: 7.5,
          color: theme.colors.critical,
          name: 'Severe',
        },
      ],
    },
    credits: {
      enabled: false,
    },
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemDistance: 10,
      itemStyle: {
        color: theme.colors.textSecondary,
        fontSize: '12px',
        fontWeight: '600',
      },
    },
    title: {
      text: undefined,
    },
    xAxis: {
      categories: [...TIMELINE_WEEKDAYS],
      min: 0,
      max: DAYS_IN_WEEK - 1,
      opposite: true,
      lineWidth: 0,
      tickWidth: 0,
      labels: {
        rotation: 0,
        style: {
          color: theme.colors.textSecondary,
          fontSize: '0.72rem',
          fontWeight: '700',
          textTransform: 'uppercase',
        },
      },
    },
    yAxis: {
      min: 0,
      max: maxY,
      visible: false,
    },
    tooltip: {
      outside: true,
      formatter: function () {
        const custom = getTimelinePointCustom(this)

        if (custom.empty) {
          return ''
        }

        if (!custom.date) {
          return 'No date'
        }

        if (custom.isFuture) {
          return `<strong>${custom.date}</strong><br/>Future date`
        }

        if (!custom.hasEntry) {
          return `<strong>${custom.date}</strong><br/>No entry yet`
        }

        return `<strong>${custom.date}</strong><br/>Symptom score: ${custom.severity?.toFixed(1) ?? 'N/A'}`
      },
    },
    plotOptions: {
      series: {
        animation: false,
        cursor: 'pointer',
        states: {
          hover: {
            brightness: 0.08,
          },
        },
        point: {
          events: {
            click: function () {
              const { date } = getTimelinePointCustom(this)

              if (date) {
                onSelectDate(date)
              }
            },
          },
        },
      },
    },
    series: [
      {
        type: 'heatmap',
        name: 'Daily symptom score',
        data: chartData,
        nullColor: theme.colors.card,
        borderColor: theme.colors.background,
        borderRadius: 7,
        borderWidth: 3,
        dataLabels: [
          {
            enabled: true,
            align: 'left',
            verticalAlign: 'top',
            crop: false,
            overflow: 'allow',
            formatter: function () {
              return getTimelinePointCustom(this).dayOfMonth?.toString() ?? ''
            },
            padding: 2,
            style: createTimelineDataLabelStyle(theme),
            x: 3,
            y: 3,
          },
          {
            enabled: true,
            crop: false,
            overflow: 'allow',
            formatter: function () {
              const custom = getTimelinePointCustom(this)

              if (custom.hasEntry && custom.severity !== null) {
                return custom.severity.toFixed(1)
              }

              return ''
            },
            style: {
              ...createTimelineDataLabelStyle(theme),
              color: theme.colors.text,
              fontSize: '0.68rem',
              fontWeight: '600',
            },
            y: 6,
          },
        ],
      } satisfies SeriesHeatmapOptions,
    ],
  }
}
