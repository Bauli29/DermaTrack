'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import DateCalendarPicker from '@/components/organisms/DateCalendarPicker'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import {
  fetchCorrelationChart,
  fetchPsycheSymptomsChart,
  fetchSymptomsChart,
} from '@/services/statistics'

import * as SC from './styles'
import {
  formatStatisticsRange,
  getStatisticsPeriodLabel,
  STATISTICS_PERIOD_OPTIONS,
} from './utils'

import type { TStatisticsPeriod } from '@/services/statistics/types'

import type { IStatisticsViewState } from './types'

import type { IStatisticsChartCardProps } from './statistics-chart-card'

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

const StatisticsTemplate = () => {
  const { setTitle } = usePageTitle()
  const today = useMemo(() => formatDateInput(new Date()), [])

  const [selectedEndDate, setSelectedEndDate] = useState<string>(today)
  const [selectedPeriod, setSelectedPeriod] = useState<TStatisticsPeriod>('7d')
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<string>('care-products')
  const [statistics, setStatistics] = useState<IStatisticsViewState | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [correlationNoData, setCorrelationNoData] = useState<string | null>(
    null
  )
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setTitle('Statistics')
  }, [setTitle])

  useEffect(() => {
    let active = true

    const loadStatistics = async () => {
      setIsLoading(true)
      setError(null)
      setStatistics(null)
      const requestParams = {
        endDate: selectedEndDate,
        period: selectedPeriod,
        mainCategory: selectedMainCategory,
      }

      const [psycheResult, symptomsResult, correlationResult] =
        await Promise.all([
          fetchPsycheSymptomsChart(requestParams),
          fetchSymptomsChart(requestParams),
          fetchCorrelationChart(requestParams),
        ])

      if (!active) {
        return
      }

      if (!psycheResult.success || !symptomsResult.success) {
        let failureMessage = 'Failed to load statistics.'

        if (!psycheResult.success) {
          failureMessage = psycheResult.error
        } else if (!symptomsResult.success) {
          failureMessage = symptomsResult.error
        }

        setStatistics(null)
        setError(failureMessage)
        setIsLoading(false)
        return
      }

      // correlation-specific handling: show friendly message when backend reports 422
      if (!correlationResult.success && correlationResult.status === 422) {
        setCorrelationNoData('Not enough data for correlation calculation.')
      } else {
        setCorrelationNoData(null)
      }

      setStatistics({
        psycheSymptoms: psycheResult.data,
        symptoms: symptomsResult.data,
        correlation: correlationResult.success
          ? correlationResult.data
          : {
              chartType: 'column',
              categories: [],
              series: [],
              dateRange: {
                from: requestParams.endDate ?? '',
                to: requestParams.endDate ?? '',
              },
            },
      })
      setIsLoading(false)
    }

    void loadStatistics()

    return () => {
      active = false
    }
  }, [selectedEndDate, selectedPeriod, selectedMainCategory, reloadKey])

  const activeRange = statistics?.psycheSymptoms.dateRange
  const selectedPeriodLabel = getStatisticsPeriodLabel(selectedPeriod)
  const retryStatisticsLoad = () => setReloadKey(current => current + 1)

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
                const isActivePeriod = selectedPeriod === option.value

                return (
                  <Button
                    key={option.value}
                    type='button'
                    variant={isActivePeriod ? 'primary' : 'ghost-outline'}
                    size='sm'
                    onClick={() => setSelectedPeriod(option.value)}
                    aria-pressed={isActivePeriod}
                  >
                    {option.label}
                  </Button>
                )
              })}
            </SC.PeriodControls>
          </SC.FilterGroup>
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
          <SC.CorrelationCardWrapper>
            <SC.CorrelationHeader>
              <div>
                <Headline as='h3' variant='h4' noSpacing>
                  Correlation
                </Headline>
                <Text size='small' color='textSecondary' noSpacing>
                  Correlation between selected main category and symptoms.
                </Text>
              </div>
              <SC.CorrelationCategoryControl>
                <Text as='span' size='small' weight={600} noSpacing>
                  Category
                </Text>
                <SC.MainCategorySelect
                  aria-label='Main category'
                  value={selectedMainCategory}
                  onChange={e => setSelectedMainCategory(e.target.value)}
                >
                  <option value='care-products'>Care products</option>
                  <option value='nutrition'>Nutrition</option>
                  <option value='contact-factors'>Contact factors</option>
                  <option value='health-factors'>Health factors</option>
                </SC.MainCategorySelect>
              </SC.CorrelationCategoryControl>
            </SC.CorrelationHeader>
            {correlationNoData ? (
              <SC.StatePanel>
                <Text size='small' color='textSecondary' noSpacing>
                  {correlationNoData}
                </Text>
              </SC.StatePanel>
            ) : (
              <StatisticsChartCard
                chart={statistics.correlation}
                title=''
                description=''
              />
            )}
          </SC.CorrelationCardWrapper>
        </SC.ChartStack>
      )}
    </SC.PageWrapper>
  )
}

export default StatisticsTemplate
