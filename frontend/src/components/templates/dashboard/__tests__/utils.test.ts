import type { TDiaryEntryResponse } from '@/services/diary'
import type {
  TFactorImpactStatistics,
  TLineStatisticsChart,
} from '@/services/statistics/types'

import {
  buildDashboardSummary,
  findTopTrigger,
  formatDashboardDate,
  formatDashboardDelta,
  formatDashboardScore,
  formatTrackedDuration,
  getDashboardTrendTone,
} from '../utils'

const sampleEntries: TDiaryEntryResponse[] = [
  {
    id: 'entry-1',
    userId: 'user-1',
    createdAt: '2026-04-01T10:00:00Z',
    entryDate: '2026-04-01',
    tracking: {
      psyche: {},
      contactFactors: {},
      nutrition: {},
      careProducts: {},
      health: {},
      symptoms: { itchiness: 5 },
    },
    notes: null,
  },
  {
    id: 'entry-2',
    userId: 'user-1',
    createdAt: '2026-04-03T10:00:00Z',
    entryDate: '2026-04-03',
    tracking: {
      psyche: {},
      contactFactors: {},
      nutrition: {},
      careProducts: {},
      health: {},
      symptoms: { itchiness: 4 },
    },
    notes: null,
  },
]

const samplePsycheSymptoms: TLineStatisticsChart = {
  chartType: 'line',
  categories: ['2026-04-01', '2026-04-02', '2026-04-03'],
  series: [
    {
      name: 'Weighted Symptoms',
      data: [6.5, null, 4.5],
    },
  ],
  dateRange: {
    from: '2026-04-01',
    to: '2026-04-03',
  },
  dataQuality: {
    dataPointCount: 2,
    minimumRecommendedDataPoints: 7,
    insufficientData: true,
  },
}

const sampleFactorImpacts: TFactorImpactStatistics = {
  dateRange: {
    from: '2026-04-01',
    to: '2026-04-03',
  },
  totalEntries: 2,
  averageWeightedSymptomScore: 5.5,
  dataQuality: samplePsycheSymptoms.dataQuality,
  factors: [
    {
      key: 'nutrition.nuts',
      label: 'Nuts',
      category: 'Nutrition',
      totalEntries: 2,
      occurrenceCount: 1,
      occurrenceRate: 50,
      averageWeightedSymptomScore: 7,
      weightedSymptomDelta: 1.5,
      pearsonCorrelation: 0.5,
    },
    {
      key: 'contact.clothing',
      label: 'Clothing',
      category: 'Contact',
      totalEntries: 2,
      occurrenceCount: 2,
      occurrenceRate: 100,
      averageWeightedSymptomScore: 5,
      weightedSymptomDelta: -0.5,
      pearsonCorrelation: -0.2,
    },
  ],
}

describe('dashboard template utils', () => {
  it('builds a dashboard summary from diary and statistics data', () => {
    expect(
      buildDashboardSummary({
        entries: sampleEntries,
        factorImpacts: sampleFactorImpacts,
        psycheSymptoms: samplePsycheSymptoms,
      })
    ).toEqual(
      expect.objectContaining({
        totalEntries: 2,
        firstEntryDate: '2026-04-01',
        latestEntryDate: '2026-04-03',
        trackedDayCount: 2,
        trackedWeekCount: 1,
        missingDaysInRange: 1,
        analyzedEntries: 2,
        averageWeightedSymptomScore: 5.5,
        latestWeightedSymptomScore: 4.5,
        trendDelta: -2,
        trendTone: 'improving',
        trendLabel: 'Improving',
        topTrigger: sampleFactorImpacts.factors[0],
      })
    )
  })

  it('classifies symptom trends by weighted symptom delta', () => {
    expect(getDashboardTrendTone(-0.6)).toBe('improving')
    expect(getDashboardTrendTone(0.6)).toBe('worsening')
    expect(getDashboardTrendTone(0.2)).toBe('stable')
    expect(getDashboardTrendTone(null)).toBe('unknown')
  })

  it('prefers positive trigger candidates over pure occurrence count', () => {
    expect(findTopTrigger(sampleFactorImpacts)).toBe(
      sampleFactorImpacts.factors[0]
    )
  })

  it('formats dashboard values', () => {
    expect(formatDashboardDate('2026-04-03')).toBe('03 Apr 2026')
    expect(formatDashboardDate(null)).toBe('No entry yet')
    expect(formatDashboardScore(4.25)).toBe('4.3')
    expect(formatDashboardScore(null)).toBe('N/A')
    expect(formatDashboardDelta(-1.25)).toBe('-1.3')
    expect(formatDashboardDelta(1.25)).toBe('+1.3')
    expect(formatDashboardDelta(null)).toBe('N/A')
    expect(formatTrackedDuration(0, 0)).toBe('No tracking yet')
    expect(formatTrackedDuration(1, 1)).toBe('1 day')
    expect(formatTrackedDuration(10, 2)).toBe('10 days / 2 weeks')
  })
})
