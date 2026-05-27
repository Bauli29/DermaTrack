'use client'

import 'react-datepicker/dist/react-datepicker.css'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import {
  fetchCorrelationChart,
  fetchPsycheSymptomsChart,
  fetchSymptomsChart,
} from '@/services/statistics'

import * as SC from './styles'
import {
  buildStatisticsCsv,
  buildStatisticsExportFileName,
  hasRenderableStatisticsChart,
} from './utils'

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

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
] as const

const MAIN_CATEGORIES = [
  { value: 'care-products', label: 'Care products' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'contact-factors', label: 'Contact factors' },
  { value: 'health-factors', label: 'Health factors' },
] as const

const downloadTextFile = (
  fileName: string,
  content: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}

const parseStatisticsDate = (value: string): Date | null => {
  if (!value) return null
  const [yearText, monthText, dayText] = value.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

const StatisticsTemplate = () => {
  const { setTitle } = usePageTitle()
  const todayDate = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => formatDateInput(todayDate), [todayDate])

  const getPresetRange = (days: number) => {
    const start = new Date(todayDate)
    start.setDate(start.getDate() - days + 1)
    return { startDate: formatDateInput(start), endDate: todayStr }
  }

  const [startDate, setStartDate] = useState<string>(
    () => getPresetRange(7).startDate
  )
  const [endDate, setEndDate] = useState<string>(todayStr)
  const [activePreset, setActivePreset] = useState<number | null>(7)
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
    if (!startDate || !endDate) {
      return
    }

    let active = true

    const loadStatistics = async () => {
      setIsLoading(true)
      setError(null)
      setStatistics(null)
      const requestParams = {
        startDate,
        endDate,
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
                from: startDate,
                to: endDate,
              },
            },
      })
      setIsLoading(false)
    }

    void loadStatistics()

    return () => {
      active = false
    }
  }, [startDate, endDate, selectedMainCategory, reloadKey])

  const applyPreset = (days: number) => {
    const { startDate: s, endDate: e } = getPresetRange(days)
    setStartDate(s)
    setEndDate(e)
    setActivePreset(days)
  }

  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start ? formatDateInput(start) : '')
    setEndDate(end ? formatDateInput(end) : '')
    setActivePreset(null)
  }

  const pickerStart = useMemo(() => parseStatisticsDate(startDate), [startDate])
  const pickerEnd = useMemo(() => parseStatisticsDate(endDate), [endDate])
  const retryStatisticsLoad = () => setReloadKey(current => current + 1)
  const selectedMainCategoryLabel =
    MAIN_CATEGORIES.find(category => category.value === selectedMainCategory)
      ?.label ?? 'Care products'
  const exportableCharts = useMemo(
    () =>
      statistics
        ? [
            {
              title: 'Psyche & Symptoms',
              chart: statistics.psycheSymptoms,
            },
            {
              title: 'Symptoms',
              chart: statistics.symptoms,
            },
            {
              title: `Correlation - ${selectedMainCategoryLabel}`,
              chart: statistics.correlation,
            },
          ]
        : [],
    [selectedMainCategoryLabel, statistics]
  )
  const canExportCsv = exportableCharts.some(({ chart }) =>
    hasRenderableStatisticsChart(chart)
  )
  const csvExportRange =
    exportableCharts.find(({ chart }) => hasRenderableStatisticsChart(chart))
      ?.chart.dateRange ?? null

  const exportLoadedStatisticsCsv = () => {
    if (!canExportCsv || !csvExportRange) {
      return
    }

    downloadTextFile(
      buildStatisticsExportFileName(
        'dermatrack-statistics',
        csvExportRange.from,
        csvExportRange.to,
        'csv'
      ),
      buildStatisticsCsv(exportableCharts),
      'text/csv;charset=utf-8'
    )
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
        <SC.FilterRow>
          <SC.RangePickerRoot>
            <DatePicker
              selectsRange
              startDate={pickerStart}
              endDate={pickerEnd}
              onChange={handleRangeChange}
              maxDate={todayDate}
              dateFormat='dd.MM.yyyy'
              placeholderText='DD.MM.YYYY – DD.MM.YYYY'
              className='stats-range-picker__input'
              calendarClassName='stats-range-picker__calendar'
              popperClassName='stats-range-picker__popper'
              popperPlacement='bottom-start'
              showPopperArrow={false}
            />
          </SC.RangePickerRoot>
          <SC.PresetGroup>
            {PRESETS.map(preset => (
              <Button
                key={preset.label}
                type='button'
                variant={
                  activePreset === preset.days ? 'primary' : 'ghost-outline'
                }
                size='sm'
                onClick={() => applyPreset(preset.days)}
                aria-pressed={activePreset === preset.days}
              >
                {preset.label}
              </Button>
            ))}
          </SC.PresetGroup>
        </SC.FilterRow>
        {statistics && (
          <SC.ToolbarActions>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={exportLoadedStatisticsCsv}
              disabled={!canExportCsv}
            >
              <Icon name='download' color='inherit' aria-hidden='true' />
              <Text as='span' size='small' color='text' noSpacing>
                Export CSV
              </Text>
            </Button>
          </SC.ToolbarActions>
        )}
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

      {isLoading && !statistics && (
        <SC.StatePanel aria-live='polite'>
          <Text size='small' color='textSecondary' noSpacing>
            Loading statistics...
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

      {statistics && (
        <SC.ChartStack>
          <StatisticsChartCard
            chart={statistics.psycheSymptoms}
            title='Psyche & Symptoms'
            description='Mental strain, stress level, sleep and weighted symptoms.'
            exportFileName={buildStatisticsExportFileName(
              'psyche-symptoms',
              statistics.psycheSymptoms.dateRange.from,
              statistics.psycheSymptoms.dateRange.to,
              'chart'
            ).replace(/\.chart$/, '')}
          />
          <StatisticsChartCard
            chart={statistics.symptoms}
            title='Symptoms'
            description='Itchiness, dryness and inflammation.'
            exportFileName={buildStatisticsExportFileName(
              'symptoms',
              statistics.symptoms.dateRange.from,
              statistics.symptoms.dateRange.to,
              'chart'
            ).replace(/\.chart$/, '')}
          />
          <StatisticsChartCard
            chart={statistics.correlation}
            title='Correlation'
            description='Correlation between selected main category and symptoms.'
            exportFileName={buildStatisticsExportFileName(
              `correlation-${selectedMainCategoryLabel}`,
              statistics.correlation.dateRange.from,
              statistics.correlation.dateRange.to,
              'chart'
            ).replace(/\.chart$/, '')}
            emptyMessage={
              correlationNoData ??
              'No chart data is available for the selected window.'
            }
            headerAction={
              <SC.CorrelationCategoryControl>
                <Text as='span' size='small' weight={600} noSpacing>
                  Category
                </Text>
                <SC.MainCategorySelect
                  aria-label='Main category'
                  value={selectedMainCategory}
                  onChange={e => setSelectedMainCategory(e.target.value)}
                >
                  {MAIN_CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </SC.MainCategorySelect>
              </SC.CorrelationCategoryControl>
            }
            note={
              <SC.CorrelationScaleNote>
                <SC.CorrelationScaleItem $positive={false}>
                  <SC.CorrelationScaleDot $positive={false} />
                  <span>
                    <strong>−1</strong> factor may help
                  </span>
                </SC.CorrelationScaleItem>
                <SC.CorrelationScaleItem $positive={null}>
                  <SC.CorrelationScaleDot $positive={null} />
                  <span>
                    <strong>0</strong> no link
                  </span>
                </SC.CorrelationScaleItem>
                <SC.CorrelationScaleItem $positive>
                  <SC.CorrelationScaleDot $positive />
                  <span>
                    <strong>+1</strong> factor may worsen
                  </span>
                </SC.CorrelationScaleItem>
              </SC.CorrelationScaleNote>
            }
          />
        </SC.ChartStack>
      )}
    </SC.PageWrapper>
  )
}

export default StatisticsTemplate
