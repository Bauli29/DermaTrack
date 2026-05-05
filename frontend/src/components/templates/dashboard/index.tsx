'use client'

import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { usePageTitle } from '@/hooks/use-page-title'

import { fetchDiaryEntries, type TDiaryEntryResponse } from '@/services/diary'
import {
  fetchFactorImpacts,
  fetchPsycheSymptomsChart,
} from '@/services/statistics'
import type {
  TFactorImpactStatistics,
  TLineStatisticsChart,
} from '@/services/statistics/types'

import * as SC from './styles'
import {
  buildDashboardSummary,
  formatDashboardDate,
  formatDashboardDelta,
  formatDashboardScore,
  formatTrackedDuration,
} from './utils'

interface IDashboardViewState {
  entries: TDiaryEntryResponse[]
  psycheSymptoms: TLineStatisticsChart
  factorImpacts: TFactorImpactStatistics
}

const DASHBOARD_STATISTICS_PERIOD = '30d'

const getSampleQualityText = (
  dataQuality: TFactorImpactStatistics['dataQuality'] | undefined
): string => {
  if (!dataQuality) {
    return 'Statistics sample is not available yet.'
  }

  if (dataQuality.insufficientData) {
    return `${dataQuality.dataPointCount} of ${dataQuality.minimumRecommendedDataPoints} recommended data points are available.`
  }

  return `${dataQuality.dataPointCount} data points are available for the 30-day statistics.`
}

const DashboardTemplate = () => {
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()
  const [dashboardData, setDashboardData] =
    useState<IDashboardViewState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setTitle('Dashboard')
    setBackLink(null)
    setParentTitle(null)
  }, [setBackLink, setParentTitle, setTitle])

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setIsLoading(true)
      setError(null)
      setDashboardData(null)

      const [entriesResult, psycheResult, factorImpactsResult] =
        await Promise.all([
          fetchDiaryEntries(),
          fetchPsycheSymptomsChart({ period: DASHBOARD_STATISTICS_PERIOD }),
          fetchFactorImpacts({ period: DASHBOARD_STATISTICS_PERIOD }),
        ])

      if (!active) {
        return
      }

      if (
        !entriesResult.success ||
        !psycheResult.success ||
        !factorImpactsResult.success
      ) {
        let failureMessage = 'Failed to load dashboard.'

        if (!entriesResult.success) {
          failureMessage = entriesResult.error
        } else if (!psycheResult.success) {
          failureMessage = psycheResult.error
        } else if (!factorImpactsResult.success) {
          failureMessage = factorImpactsResult.error
        }

        setDashboardData(null)
        setError(failureMessage)
        setIsLoading(false)
        return
      }

      setDashboardData({
        entries: entriesResult.data ?? [],
        psycheSymptoms: psycheResult.data,
        factorImpacts: factorImpactsResult.data,
      })
      setIsLoading(false)
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [reloadKey])

  const summary = useMemo(() => {
    if (!dashboardData) {
      return null
    }

    return buildDashboardSummary(dashboardData)
  }, [dashboardData])

  const retryDashboardLoad = () => setReloadKey(current => current + 1)
  const dataQuality = dashboardData?.factorImpacts.dataQuality
  const hasEntries = (dashboardData?.entries.length ?? 0) > 0
  const topTrigger = summary?.topTrigger ?? null
  const latestEntryText = summary
    ? formatDashboardDate(summary.latestEntryDate)
    : 'No entry yet'
  const missingDaysText =
    summary && summary.missingDaysInRange > 0
      ? `${summary.missingDaysInRange} missing day${
          summary.missingDaysInRange === 1 ? '' : 's'
        } in the tracked range.`
      : 'No gaps detected in the tracked range.'
  const sampleQualityText = getSampleQualityText(dataQuality)

  return (
    <SC.PageWrapper>
      <SC.PageHeader>
        <Headline as='h2' variant='h3' noSpacing>
          Dashboard
        </Headline>
        <Text size='small' color='textSecondary' noSpacing>
          Current tracking status, symptom trend and quick statistics signals.
        </Text>
      </SC.PageHeader>

      <SC.ActionBar aria-label='Dashboard actions'>
        <SC.ActionLink href='/tracking/daily' $prominent>
          <Icon name='add_circle' color='inherit' aria-hidden='true' />
          New Entry
        </SC.ActionLink>
        <SC.ActionLink href='/statistics'>
          <Icon name='bar_chart' color='inherit' aria-hidden='true' />
          Statistics
        </SC.ActionLink>
      </SC.ActionBar>

      {error && (
        <SC.ErrorBanner role='alert'>
          <Icon name='error_outline' color='error' aria-hidden='true' />
          <SC.ErrorContent>
            <Text as='span' size='small' color='error' noSpacing>
              {error}
            </Text>
          </SC.ErrorContent>
          <SC.ErrorAction>
            <Button
              variant='danger-outline'
              size='sm'
              onClick={retryDashboardLoad}
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
            Loading dashboard...
          </Text>
        </SC.StatePanel>
      )}

      {!isLoading && !error && !dashboardData && (
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            Dashboard data is currently unavailable.
          </Text>
        </SC.StatePanel>
      )}

      {!isLoading && !error && dashboardData && !hasEntries && (
        <SC.StatePanel>
          <Headline as='h3' variant='h5' noSpacing>
            No tracking entries yet
          </Headline>
          <Text size='small' color='textSecondary' noSpacing>
            The dashboard will show symptom trends and factor signals after
            daily tracking data exists.
          </Text>
        </SC.StatePanel>
      )}

      {!isLoading && !error && dashboardData && summary && hasEntries && (
        <>
          <SC.SummaryGrid aria-label='Dashboard key statistics'>
            <SC.SummaryCard>
              <SC.CardHeader>
                <SC.CardIcon>
                  <Icon name='calendar_month' color='primary' />
                </SC.CardIcon>
                <SC.CardLabel>Tracking history</SC.CardLabel>
              </SC.CardHeader>
              <SC.CardValue>
                {formatTrackedDuration(
                  summary.trackedDayCount,
                  summary.trackedWeekCount
                )}
              </SC.CardValue>
              <SC.CardMeta>{latestEntryText}</SC.CardMeta>
            </SC.SummaryCard>

            <SC.SummaryCard>
              <SC.CardHeader>
                <SC.CardIcon>
                  <Icon name='speed' color='info' />
                </SC.CardIcon>
                <SC.CardLabel>Average symptom score</SC.CardLabel>
              </SC.CardHeader>
              <SC.CardValue>
                {formatDashboardScore(summary.averageWeightedSymptomScore)}
              </SC.CardValue>
              <SC.CardMeta>
                {summary.analyzedEntries} entries analyzed
              </SC.CardMeta>
            </SC.SummaryCard>

            <SC.SummaryCard>
              <SC.CardHeader>
                <SC.CardIcon $tone={summary.trendTone}>
                  <Icon name='show_chart' color='inherit' />
                </SC.CardIcon>
                <SC.CardLabel>30-day trend</SC.CardLabel>
              </SC.CardHeader>
              <SC.CardValue $tone={summary.trendTone}>
                {summary.trendLabel}
              </SC.CardValue>
              <SC.CardMeta>
                {formatDashboardDelta(summary.trendDelta)} weighted points
              </SC.CardMeta>
            </SC.SummaryCard>

            <SC.SummaryCard>
              <SC.CardHeader>
                <SC.CardIcon>
                  <Icon name='warning' color='warning' />
                </SC.CardIcon>
                <SC.CardLabel>Potential trigger</SC.CardLabel>
              </SC.CardHeader>
              <SC.CardValue>{topTrigger?.label ?? 'None'}</SC.CardValue>
              <SC.CardMeta>
                {topTrigger
                  ? `${formatDashboardDelta(
                      topTrigger.weightedSymptomDelta
                    )} points, ${topTrigger.occurrenceCount} occurrence${
                      topTrigger.occurrenceCount === 1 ? '' : 's'
                    }`
                  : 'No factor signal yet'}
              </SC.CardMeta>
            </SC.SummaryCard>
          </SC.SummaryGrid>

          <SC.ContentGrid>
            <SC.Panel>
              <SC.PanelHeader>
                <Headline as='h3' variant='h4' noSpacing>
                  Quick Insights
                </Headline>
                <Text size='small' color='textSecondary' noSpacing>
                  Signals refreshed from the latest diary and statistics data.
                </Text>
              </SC.PanelHeader>
              <SC.InsightList>
                <SC.InsightRow>
                  <SC.InsightIcon>
                    <Icon name='event_available' color='primary' />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Latest entry</SC.InsightTitle>
                    <SC.InsightText>{latestEntryText}</SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>

                <SC.InsightRow>
                  <SC.InsightIcon>
                    <Icon name='fact_check' color='primary' />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Tracking continuity</SC.InsightTitle>
                    <SC.InsightText>{missingDaysText}</SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>

                <SC.InsightRow>
                  <SC.InsightIcon $tone={summary.trendTone}>
                    <Icon name='monitoring' color='inherit' />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Symptom trend</SC.InsightTitle>
                    <SC.InsightText>
                      {summary.trendLabel} by{' '}
                      {formatDashboardDelta(summary.trendDelta)} weighted points
                      in the 30-day window.
                    </SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>
              </SC.InsightList>
            </SC.Panel>

            <SC.Panel>
              <SC.PanelHeader>
                <Headline as='h3' variant='h4' noSpacing>
                  Statistics Preview
                </Headline>
                <Text size='small' color='textSecondary' noSpacing>
                  Sample quality and strongest factor signal for the current
                  30-day period.
                </Text>
              </SC.PanelHeader>
              <SC.InsightList>
                <SC.InsightRow>
                  <SC.InsightIcon>
                    <Icon
                      name={
                        dataQuality?.insufficientData
                          ? 'priority_high'
                          : 'check_circle'
                      }
                      color={
                        dataQuality?.insufficientData ? 'warning' : 'success'
                      }
                    />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Sample quality</SC.InsightTitle>
                    <SC.InsightText>{sampleQualityText}</SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>

                <SC.InsightRow>
                  <SC.InsightIcon>
                    <Icon name='flare' color='warning' />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Strongest factor signal</SC.InsightTitle>
                    <SC.InsightText>
                      {topTrigger
                        ? `${topTrigger.label} (${topTrigger.category}) appears with ${formatDashboardDelta(
                            topTrigger.weightedSymptomDelta
                          )} weighted points.`
                        : 'No recurring factor signal is available yet.'}
                    </SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>

                <SC.InsightRow>
                  <SC.InsightIcon>
                    <Icon name='open_in_new' color='primary' />
                  </SC.InsightIcon>
                  <SC.InsightContent>
                    <SC.InsightTitle>Full statistics</SC.InsightTitle>
                    <SC.InsightText>
                      Open Statistics for detailed charts, filters and exports.
                    </SC.InsightText>
                  </SC.InsightContent>
                </SC.InsightRow>
              </SC.InsightList>
            </SC.Panel>
          </SC.ContentGrid>
        </>
      )}
    </SC.PageWrapper>
  )
}

export default DashboardTemplate
