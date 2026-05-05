import type { TDiaryEntryResponse } from '@/services/diary'
import type {
  TFactorImpact,
  TFactorImpactStatistics,
  TLineStatisticsChart,
} from '@/services/statistics/types'

export type TDashboardTrendTone =
  | 'improving'
  | 'stable'
  | 'worsening'
  | 'unknown'

export interface IDashboardSummary {
  totalEntries: number
  firstEntryDate: string | null
  latestEntryDate: string | null
  trackedDayCount: number
  trackedWeekCount: number
  missingDaysInRange: number
  analyzedEntries: number
  averageWeightedSymptomScore: number | null
  trendDelta: number | null
  trendTone: TDashboardTrendTone
  trendLabel: string
  latestWeightedSymptomScore: number | null
  topTrigger: TFactorImpact | null
}

const WEIGHTED_SYMPTOMS_SERIES_NAME = 'Weighted Symptoms'
const STABLE_TREND_THRESHOLD = 0.5

const toDate = (value: string): Date => new Date(`${value}T00:00:00`)

const getDayDifference = (from: string, to: string): number => {
  const fromTime = toDate(from).getTime()
  const toTime = toDate(to).getTime()

  if (Number.isNaN(fromTime) || Number.isNaN(toTime)) {
    return 0
  }

  return Math.max(0, Math.round((toTime - fromTime) / 86_400_000))
}

const getSortedEntryDates = (entries: TDiaryEntryResponse[]): string[] =>
  Array.from(new Set(entries.map(entry => entry.entryDate))).sort()

const findWeightedSymptomsSeries = (
  psycheSymptoms: TLineStatisticsChart
): (number | null)[] =>
  psycheSymptoms.series.find(
    series => series.name === WEIGHTED_SYMPTOMS_SERIES_NAME
  )?.data ?? []

const findFirstRecordedValue = (values: (number | null)[]): number | null =>
  values.find((value): value is number => value !== null) ?? null

const findLatestRecordedValue = (values: (number | null)[]): number | null => {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index]

    if (value !== null) {
      return value
    }
  }

  return null
}

export const getDashboardTrendTone = (
  trendDelta: number | null
): TDashboardTrendTone => {
  if (trendDelta === null) {
    return 'unknown'
  }

  if (trendDelta <= -STABLE_TREND_THRESHOLD) {
    return 'improving'
  }

  if (trendDelta >= STABLE_TREND_THRESHOLD) {
    return 'worsening'
  }

  return 'stable'
}

const getTrendLabel = (tone: TDashboardTrendTone): string => {
  switch (tone) {
    case 'improving':
      return 'Improving'
    case 'stable':
      return 'Stable'
    case 'worsening':
      return 'Worsening'
    case 'unknown':
      return 'No trend yet'
  }
}

const compareTopTriggerCandidates = (
  left: TFactorImpact,
  right: TFactorImpact
): number => {
  const deltaDifference =
    (right.weightedSymptomDelta ?? 0) - (left.weightedSymptomDelta ?? 0)

  if (Math.abs(deltaDifference) >= 0.1) {
    return deltaDifference
  }

  const correlationDifference =
    (right.pearsonCorrelation ?? 0) - (left.pearsonCorrelation ?? 0)

  if (Math.abs(correlationDifference) >= 0.01) {
    return correlationDifference
  }

  return right.occurrenceCount - left.occurrenceCount
}

export const findTopTrigger = (
  factorImpacts: TFactorImpactStatistics
): TFactorImpact | null => {
  const positiveSignals = factorImpacts.factors
    .filter(
      factor =>
        factor.occurrenceCount > 0 &&
        factor.weightedSymptomDelta !== null &&
        factor.weightedSymptomDelta > 0
    )
    .sort(compareTopTriggerCandidates)

  if (positiveSignals.length > 0) {
    return positiveSignals[0]
  }

  return (
    factorImpacts.factors
      .filter(factor => factor.occurrenceCount > 0)
      .sort((left, right) => right.occurrenceCount - left.occurrenceCount)[0] ??
    null
  )
}

export const buildDashboardSummary = ({
  entries,
  factorImpacts,
  psycheSymptoms,
}: {
  entries: TDiaryEntryResponse[]
  factorImpacts: TFactorImpactStatistics
  psycheSymptoms: TLineStatisticsChart
}): IDashboardSummary => {
  const sortedEntryDates = getSortedEntryDates(entries)
  const firstEntryDate = sortedEntryDates[0] ?? null
  const latestEntryDate = sortedEntryDates.at(-1) ?? null
  const trackedDayCount = sortedEntryDates.length
  const daysInRange =
    firstEntryDate && latestEntryDate
      ? getDayDifference(firstEntryDate, latestEntryDate) + 1
      : 0
  const missingDaysInRange =
    daysInRange > 0 ? Math.max(0, daysInRange - trackedDayCount) : 0
  const weightedSymptoms = findWeightedSymptomsSeries(psycheSymptoms)
  const firstWeightedScore = findFirstRecordedValue(weightedSymptoms)
  const latestWeightedSymptomScore = findLatestRecordedValue(weightedSymptoms)
  const trendDelta =
    firstWeightedScore !== null && latestWeightedSymptomScore !== null
      ? latestWeightedSymptomScore - firstWeightedScore
      : null
  const trendTone = getDashboardTrendTone(trendDelta)

  return {
    totalEntries: entries.length,
    firstEntryDate,
    latestEntryDate,
    trackedDayCount,
    trackedWeekCount:
      daysInRange > 0 ? Math.max(1, Math.ceil(daysInRange / 7)) : 0,
    missingDaysInRange,
    analyzedEntries: factorImpacts.totalEntries,
    averageWeightedSymptomScore: factorImpacts.averageWeightedSymptomScore,
    trendDelta,
    trendTone,
    trendLabel: getTrendLabel(trendTone),
    latestWeightedSymptomScore,
    topTrigger: findTopTrigger(factorImpacts),
  }
}

export const formatDashboardDate = (value: string | null): string => {
  if (!value) {
    return 'No entry yet'
  }

  const date = toDate(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatDashboardScore = (value: number | null): string => {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 1,
  }).format(value)
}

export const formatDashboardDelta = (value: number | null): string => {
  if (value === null) {
    return 'N/A'
  }

  const absoluteValue = formatDashboardScore(Math.abs(value))

  if (value > 0) {
    return `+${absoluteValue}`
  }

  if (value < 0) {
    return `-${absoluteValue}`
  }

  return '0'
}

export const formatTrackedDuration = (
  trackedDayCount: number,
  trackedWeekCount: number
): string => {
  if (trackedDayCount <= 0) {
    return 'No tracking yet'
  }

  if (trackedWeekCount <= 1) {
    return `${trackedDayCount} day${trackedDayCount === 1 ? '' : 's'}`
  }

  return `${trackedDayCount} days / ${trackedWeekCount} weeks`
}
