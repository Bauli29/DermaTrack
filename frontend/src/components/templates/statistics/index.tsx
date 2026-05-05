'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Select from '@/components/atoms/Select'
import Text from '@/components/atoms/Text'

import DateCalendarPicker from '@/components/organisms/DateCalendarPicker'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import {
  fetchFactorImpacts,
  fetchPsycheSymptomsChart,
  fetchSymptomsChart,
} from '@/services/statistics'
import type {
  TColumnStatisticsChart,
  TFactorImpactStatistics,
  TLineStatisticsChart,
  TStatisticsPeriod,
} from '@/services/statistics/types'

import * as SC from './styles'
import type { IFactorDistributionChartCardProps } from './factor-distribution-chart-card'
import type { IStatisticsChartCardProps } from './statistics-chart-card'
import {
  buildStatisticsExportCsv,
  formatStatisticsCorrelation,
  formatStatisticsPercent,
  formatStatisticsRange,
  formatStatisticsScore,
  formatStatisticsSignedScore,
  getFactorImpactTone,
  getStatisticsPeriodLabel,
  STATISTICS_PERIOD_OPTIONS,
} from './utils'

const StatisticsChartCard = dynamic<IStatisticsChartCardProps>(
  () => import('./statistics-chart-card'),
  {
    ssr: false,
    loading: () => (
      <SC.ChartCard>
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            Loading chart...
          </Text>
        </SC.StatePanel>
      </SC.ChartCard>
    ),
  }
)

const FactorDistributionChartCard = dynamic<IFactorDistributionChartCardProps>(
  () => import('./factor-distribution-chart-card'),
  {
    ssr: false,
    loading: () => (
      <SC.ChartCard>
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            Loading chart...
          </Text>
        </SC.StatePanel>
      </SC.ChartCard>
    ),
  }
)

interface IStatisticsViewState {
  psycheSymptoms: TLineStatisticsChart
  symptoms: TColumnStatisticsChart
  factorImpacts: TFactorImpactStatistics
}

const WEIGHTED_SYMPTOM_WEIGHTS = [
  'Itchiness 20%',
  'Dryness 10%',
  'Inflammation 30%',
  'Scratching 10%',
  'Weeping skin 15%',
  'Skin cracks 15%',
]

type TFactorCategoryFilter = 'all' | 'Contact' | 'Nutrition' | 'Care' | 'Health'
type TFactorSignalFilter = 'all' | 'higher' | 'lower' | 'neutral'
type TStatisticsPeriodMode = TStatisticsPeriod | 'custom'

const FACTOR_CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'Contact', label: 'Contact' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Care', label: 'Care' },
  { value: 'Health', label: 'Health' },
] as const

const FACTOR_SIGNAL_FILTER_OPTIONS = [
  { value: 'all', label: 'All signals' },
  { value: 'higher', label: 'Higher score' },
  { value: 'lower', label: 'Lower score' },
  { value: 'neutral', label: 'Neutral' },
] as const

const getDefaultCustomStartDate = (): string => {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return formatDateInput(date)
}

const StatisticsTemplate = () => {
  const { setTitle } = usePageTitle()
  const today = useMemo(() => formatDateInput(new Date()), [])
  const defaultCustomStartDate = useMemo(() => getDefaultCustomStartDate(), [])

  const [selectedEndDate, setSelectedEndDate] = useState<string>(today)
  const [selectedPeriodMode, setSelectedPeriodMode] =
    useState<TStatisticsPeriodMode>('30d')
  const [customStartDate, setCustomStartDate] = useState<string>(
    defaultCustomStartDate
  )
  const [factorCategoryFilter, setFactorCategoryFilter] =
    useState<TFactorCategoryFilter>('all')
  const [factorSignalFilter, setFactorSignalFilter] =
    useState<TFactorSignalFilter>('all')
  const [statistics, setStatistics] = useState<IStatisticsViewState | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setTitle('Statistics')
  }, [setTitle])

  useEffect(() => {
    if (customStartDate > selectedEndDate) {
      setCustomStartDate(selectedEndDate)
    }
  }, [customStartDate, selectedEndDate])

  useEffect(() => {
    let active = true

    const loadStatistics = async () => {
      setIsLoading(true)
      setError(null)
      setStatistics(null)
      const effectiveCustomStartDate =
        customStartDate > selectedEndDate ? selectedEndDate : customStartDate
      const requestParams =
        selectedPeriodMode === 'custom'
          ? {
              fromDate: effectiveCustomStartDate,
              endDate: selectedEndDate,
            }
          : {
              endDate: selectedEndDate,
              period: selectedPeriodMode,
            }

      const [psycheResult, symptomsResult, factorImpactsResult] =
        await Promise.all([
          fetchPsycheSymptomsChart(requestParams),
          fetchSymptomsChart(requestParams),
          fetchFactorImpacts(requestParams),
        ])

      if (!active) {
        return
      }

      if (
        !psycheResult.success ||
        !symptomsResult.success ||
        !factorImpactsResult.success
      ) {
        let failureMessage = 'Failed to load statistics.'

        if (!psycheResult.success) {
          failureMessage = psycheResult.error
        } else if (!symptomsResult.success) {
          failureMessage = symptomsResult.error
        } else if (!factorImpactsResult.success) {
          failureMessage = factorImpactsResult.error
        }

        setStatistics(null)
        setError(failureMessage)
        setIsLoading(false)
        return
      }

      setStatistics({
        psycheSymptoms: psycheResult.data,
        symptoms: symptomsResult.data,
        factorImpacts: factorImpactsResult.data,
      })
      setIsLoading(false)
    }

    void loadStatistics()

    return () => {
      active = false
    }
  }, [customStartDate, selectedEndDate, selectedPeriodMode, reloadKey])

  const activeRange = statistics?.psycheSymptoms.dateRange
  const topFactorImpacts = useMemo(() => {
    if (!statistics) {
      return []
    }

    return statistics.factorImpacts.factors
      .filter(factor => factor.occurrenceCount > 0)
      .filter(factor => {
        if (factorCategoryFilter === 'all') {
          return true
        }

        return factor.category === factorCategoryFilter
      })
      .filter(factor => {
        if (factorSignalFilter === 'all') {
          return true
        }

        return (
          getFactorImpactTone(factor.weightedSymptomDelta) ===
          factorSignalFilter
        )
      })
      .slice(0, 6)
  }, [factorCategoryFilter, factorSignalFilter, statistics])
  const selectedPeriodLabel =
    selectedPeriodMode === 'custom'
      ? 'Custom range'
      : getStatisticsPeriodLabel(selectedPeriodMode)
  const dataQuality = statistics?.factorImpacts.dataQuality
  const retryStatisticsLoad = () => setReloadKey(current => current + 1)
  const exportStatisticsCsv = () => {
    if (!statistics) {
      return
    }

    const csv = buildStatisticsExportCsv(statistics)
    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const csvUrl = URL.createObjectURL(csvBlob)
    const link = document.createElement('a')
    const { from, to } = statistics.factorImpacts.dateRange

    link.href = csvUrl
    link.download = `dermatrack-statistics-${from}-to-${to}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(csvUrl)
  }

  return (
    <SC.PageWrapper>
      <SC.PageHeader>
        <Headline as='h2' variant='h3' noSpacing>
          Statistics
        </Headline>
        <Text size='small' color='textSecondary' noSpacing>
          Psyche, symptom weight and symptom scores across selectable periods.
        </Text>
      </SC.PageHeader>

      <SC.Toolbar>
        <SC.FilterPanel>
          <SC.FilterGroup>
            <Text as='span' size='small' weight={600} noSpacing>
              End date
            </Text>
            <SC.DateControls>
              <DateCalendarPicker
                value={selectedEndDate}
                maxDate={today}
                onChange={setSelectedEndDate}
              />
              <Button
                variant='ghost-outline'
                size='md'
                onClick={() => setSelectedEndDate(formatDateInput(new Date()))}
                disabled={selectedEndDate === today}
                aria-label='Use today as end date'
                title='Use today as end date'
              >
                <Icon name='today' color='textSecondary' />
                <Text as='span' size='small' color='textSecondary' noSpacing>
                  Today
                </Text>
              </Button>
            </SC.DateControls>
          </SC.FilterGroup>

          <SC.FilterGroup>
            <Text as='span' size='small' weight={600} noSpacing>
              Period
            </Text>
            <SC.PeriodControls role='group' aria-label='Statistics period'>
              {STATISTICS_PERIOD_OPTIONS.map(option => {
                const isActivePeriod = selectedPeriodMode === option.value

                return (
                  <Button
                    key={option.value}
                    type='button'
                    variant={isActivePeriod ? 'primary' : 'ghost-outline'}
                    size='sm'
                    onClick={() => setSelectedPeriodMode(option.value)}
                    aria-pressed={isActivePeriod}
                  >
                    {option.label}
                  </Button>
                )
              })}
              <Button
                type='button'
                variant={
                  selectedPeriodMode === 'custom' ? 'primary' : 'ghost-outline'
                }
                size='sm'
                onClick={() => setSelectedPeriodMode('custom')}
                aria-pressed={selectedPeriodMode === 'custom'}
              >
                Custom
              </Button>
            </SC.PeriodControls>
          </SC.FilterGroup>

          {selectedPeriodMode === 'custom' && (
            <SC.FilterGroup>
              <Text as='span' size='small' weight={600} noSpacing>
                Start date
              </Text>
              <DateCalendarPicker
                value={customStartDate}
                maxDate={selectedEndDate}
                onChange={setCustomStartDate}
              />
            </SC.FilterGroup>
          )}
        </SC.FilterPanel>

        <SC.RangeSummary>
          <SC.SummaryPill>
            <SC.SummaryLabel>Period</SC.SummaryLabel>
            <SC.SummaryValue>{selectedPeriodLabel}</SC.SummaryValue>
          </SC.SummaryPill>
          <SC.SummaryPill>
            <SC.SummaryLabel>Selected end date</SC.SummaryLabel>
            <SC.SummaryValue>{selectedEndDate}</SC.SummaryValue>
          </SC.SummaryPill>
          <SC.SummaryPill>
            <SC.SummaryLabel>Window</SC.SummaryLabel>
            <SC.SummaryValue>
              {activeRange
                ? formatStatisticsRange(activeRange.from, activeRange.to)
                : selectedPeriodLabel}
            </SC.SummaryValue>
          </SC.SummaryPill>
        </SC.RangeSummary>
      </SC.Toolbar>

      {error && (
        <SC.ErrorBanner role='alert'>
          <SC.ErrorIcon>
            <Icon name='error_outline' color='error' aria-hidden='true' />
          </SC.ErrorIcon>
          <SC.ErrorContent>
            <Text as='span' size='small' color='error' noSpacing>
              {error}
            </Text>
          </SC.ErrorContent>
          <SC.ErrorAction>
            <Button
              variant='danger-outline'
              size='sm'
              onClick={retryStatisticsLoad}
              disabled={isLoading}
            >
              <Icon name='refresh' color='error' aria-hidden='true' />
              <Text as='span' size='small' color='error' noSpacing>
                Retry
              </Text>
            </Button>
          </SC.ErrorAction>
        </SC.ErrorBanner>
      )}

      {!error && dataQuality?.insufficientData && (
        <SC.WarningBanner role='status'>
          <Icon name='warning' color='warning' aria-hidden='true' />
          <Text as='span' size='small' color='textSecondary' noSpacing>
            Correlations may be less meaningful for this period because only{' '}
            {dataQuality.dataPointCount} of the recommended{' '}
            {dataQuality.minimumRecommendedDataPoints} data points are present.
          </Text>
        </SC.WarningBanner>
      )}

      {isLoading && (
        <SC.StatePanel aria-live='polite'>
          <Text size='small' color='textSecondary' noSpacing>
            Loading {selectedPeriodLabel} statistics...
          </Text>
        </SC.StatePanel>
      )}

      {!isLoading && !statistics && !error && (
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            Statistics are currently unavailable.
          </Text>
        </SC.StatePanel>
      )}

      {!isLoading && statistics && (
        <SC.ChartStack>
          <StatisticsChartCard
            chart={statistics.psycheSymptoms}
            title='Psyche & Symptoms'
            description='Mental strain, stress level, sleep and weighted symptoms.'
          />
          <StatisticsChartCard
            chart={statistics.symptoms}
            title='Symptoms'
            description='Itchiness, dryness and inflammation.'
          />
          <FactorDistributionChartCard
            factorImpacts={statistics.factorImpacts}
          />
          <SC.InsightsPanel>
            <SC.InsightsHeader>
              <SC.ChartTitleGroup>
                <Headline as='h3' variant='h4' noSpacing>
                  Factor Insights
                </Headline>
                <Text size='small' color='textSecondary' noSpacing>
                  Trigger comparison by weighted symptom score and Pearson
                  correlation.
                </Text>
              </SC.ChartTitleGroup>
              <SC.InsightsHeaderActions>
                <SC.RangeBadge>
                  {formatStatisticsRange(
                    statistics.factorImpacts.dateRange.from,
                    statistics.factorImpacts.dateRange.to
                  )}
                </SC.RangeBadge>
                <Button
                  type='button'
                  variant='ghost-outline'
                  size='sm'
                  onClick={exportStatisticsCsv}
                >
                  <Icon name='download' color='textSecondary' />
                  <Text as='span' size='small' color='textSecondary' noSpacing>
                    Export CSV
                  </Text>
                </Button>
              </SC.InsightsHeaderActions>
            </SC.InsightsHeader>

            <SC.InsightsFilters>
              <SC.FilterControl>
                <SC.FilterLabel htmlFor='factor-category-filter'>
                  Category
                </SC.FilterLabel>
                <Select
                  id='factor-category-filter'
                  options={FACTOR_CATEGORY_FILTER_OPTIONS}
                  value={factorCategoryFilter}
                  onChange={event =>
                    setFactorCategoryFilter(
                      event.target.value as TFactorCategoryFilter
                    )
                  }
                />
              </SC.FilterControl>
              <SC.FilterControl>
                <SC.FilterLabel htmlFor='factor-signal-filter'>
                  Signal
                </SC.FilterLabel>
                <Select
                  id='factor-signal-filter'
                  options={FACTOR_SIGNAL_FILTER_OPTIONS}
                  value={factorSignalFilter}
                  onChange={event =>
                    setFactorSignalFilter(
                      event.target.value as TFactorSignalFilter
                    )
                  }
                />
              </SC.FilterControl>
            </SC.InsightsFilters>

            <SC.WeightingNote>
              <Text size='small' weight={600} noSpacing>
                Weighted symptom score
              </Text>
              <SC.WeightList>
                {WEIGHTED_SYMPTOM_WEIGHTS.map(weight => (
                  <SC.WeightItem key={weight}>{weight}</SC.WeightItem>
                ))}
              </SC.WeightList>
            </SC.WeightingNote>

            <SC.FactorSummary>
              <SC.SummaryPill>
                <SC.SummaryLabel>Entries analyzed</SC.SummaryLabel>
                <SC.SummaryValue>
                  {statistics.factorImpacts.totalEntries}
                </SC.SummaryValue>
              </SC.SummaryPill>
              <SC.SummaryPill>
                <SC.SummaryLabel>Average symptom score</SC.SummaryLabel>
                <SC.SummaryValue>
                  {formatStatisticsScore(
                    statistics.factorImpacts.averageWeightedSymptomScore
                  )}
                </SC.SummaryValue>
              </SC.SummaryPill>
            </SC.FactorSummary>

            {topFactorImpacts.length === 0 ? (
              <SC.StatePanel>
                <Text size='small' color='textSecondary' noSpacing>
                  No factor signals match the current selection.
                </Text>
              </SC.StatePanel>
            ) : (
              <SC.FactorGrid>
                {topFactorImpacts.map(factor => {
                  const tone = getFactorImpactTone(factor.weightedSymptomDelta)

                  return (
                    <SC.FactorCard key={factor.key}>
                      <SC.FactorCardHeader>
                        <SC.FactorTitleGroup>
                          <SC.FactorCategory>
                            {factor.category}
                          </SC.FactorCategory>
                          <SC.FactorName>{factor.label}</SC.FactorName>
                        </SC.FactorTitleGroup>
                        <SC.FactorDelta $tone={tone}>
                          {formatStatisticsSignedScore(
                            factor.weightedSymptomDelta
                          )}
                        </SC.FactorDelta>
                      </SC.FactorCardHeader>
                      <SC.FactorMetricGrid>
                        <SC.FactorMetric>
                          <SC.SummaryLabel>Avg score</SC.SummaryLabel>
                          <SC.SummaryValue>
                            {formatStatisticsScore(
                              factor.averageWeightedSymptomScore
                            )}
                          </SC.SummaryValue>
                        </SC.FactorMetric>
                        <SC.FactorMetric>
                          <SC.SummaryLabel>Occurrence</SC.SummaryLabel>
                          <SC.SummaryValue>
                            {factor.occurrenceCount}/{factor.totalEntries}
                          </SC.SummaryValue>
                        </SC.FactorMetric>
                        <SC.FactorMetric>
                          <SC.SummaryLabel>Share</SC.SummaryLabel>
                          <SC.SummaryValue>
                            {formatStatisticsPercent(factor.occurrenceRate)}
                          </SC.SummaryValue>
                        </SC.FactorMetric>
                        <SC.FactorMetric>
                          <SC.SummaryLabel>Correlation</SC.SummaryLabel>
                          <SC.SummaryValue>
                            {formatStatisticsCorrelation(
                              factor.pearsonCorrelation
                            )}
                          </SC.SummaryValue>
                        </SC.FactorMetric>
                      </SC.FactorMetricGrid>
                    </SC.FactorCard>
                  )
                })}
              </SC.FactorGrid>
            )}
          </SC.InsightsPanel>
        </SC.ChartStack>
      )}
    </SC.PageWrapper>
  )
}

export default StatisticsTemplate
