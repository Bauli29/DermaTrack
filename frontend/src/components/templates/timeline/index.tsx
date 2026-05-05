'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { formatDateInput } from '@/lib/date'

import { usePageTitle } from '@/hooks/use-page-title'

import { getDiaryEntries } from '@/services/diary'
import type { IDiaryEntry } from '@/types/diary'

import * as SC from './styles'
import type { ITimelineCalendarChartProps } from './timeline-calendar-chart'
import {
  addTimelineMonths,
  buildTimelineDays,
  buildTimelineEntrySummary,
  buildTimelineHeatmapData,
  formatTimelineMonthTitle,
  getTimelineMonthRange,
} from './utils'

const TimelineCalendarChart = dynamic<ITimelineCalendarChartProps>(
  () => import('./timeline-calendar-chart'),
  {
    ssr: false,
    loading: () => (
      <SC.StatePanel>
        <Text size='small' color='textSecondary' noSpacing>
          Loading calendar...
        </Text>
      </SC.StatePanel>
    ),
  }
)

const createMonthStart = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1)

const TimelineTemplate = () => {
  const router = useRouter()
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()
  const today = useMemo(() => formatDateInput(new Date()), [])
  const currentMonth = useMemo(() => createMonthStart(new Date()), [])

  const [visibleMonth, setVisibleMonth] = useState<Date>(currentMonth)
  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [entries, setEntries] = useState<IDiaryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    setTitle('Timeline')
    setBackLink(null)
    setParentTitle(null)
  }, [setTitle, setBackLink, setParentTitle])

  const monthRange = useMemo(
    () => getTimelineMonthRange(visibleMonth),
    [visibleMonth]
  )
  const monthTitle = useMemo(
    () => formatTimelineMonthTitle(visibleMonth),
    [visibleMonth]
  )
  const timelineDays = useMemo(
    () => buildTimelineDays(visibleMonth, entries, today),
    [entries, today, visibleMonth]
  )
  const heatmapData = useMemo(
    () => buildTimelineHeatmapData(timelineDays),
    [timelineDays]
  )
  const selectedDay = useMemo(
    () => timelineDays.find(day => day.date === selectedDate) ?? null,
    [selectedDate, timelineDays]
  )
  const selectedEntrySummary = useMemo(
    () =>
      selectedDay?.entry ? buildTimelineEntrySummary(selectedDay.entry) : null,
    [selectedDay]
  )
  const selectedDateStatus = (() => {
    if (selectedDay?.isFuture) {
      return 'Future date'
    }

    if (selectedDay?.entry) {
      return 'Entry recorded'
    }

    return 'No entry yet'
  })()
  const trackedDays = timelineDays.filter(day => day.entry).length
  const hasNextMonth =
    visibleMonth.getFullYear() < currentMonth.getFullYear() ||
    (visibleMonth.getFullYear() === currentMonth.getFullYear() &&
      visibleMonth.getMonth() < currentMonth.getMonth())

  useEffect(() => {
    let active = true

    const loadTimelineEntries = async () => {
      setIsLoading(true)
      setError(null)

      const result = await getDiaryEntries<IDiaryEntry>(monthRange)

      if (!active) {
        return
      }

      if (!result.success) {
        setEntries([])
        setError(result.error)
        setIsLoading(false)
        return
      }

      setEntries(result.data ?? [])
      setIsLoading(false)
    }

    void loadTimelineEntries()

    return () => {
      active = false
    }
  }, [monthRange, reloadKey])

  const moveToMonth = useCallback(
    (nextMonth: Date) => {
      const nextRange = getTimelineMonthRange(nextMonth)
      const nextSelectedDate =
        nextRange.fromDate <= today && today <= nextRange.toDate
          ? today
          : nextRange.fromDate

      setVisibleMonth(nextMonth)
      setSelectedDate(nextSelectedDate)
      setNotice(null)
    },
    [today]
  )

  const handleSelectDate = useCallback(
    (date: string) => {
      const day = timelineDays.find(candidate => candidate.date === date)

      setSelectedDate(date)
      setNotice(
        day?.isFuture
          ? 'Entries can only be made for today or a past date.'
          : null
      )
    },
    [timelineDays]
  )

  const openDailyTracking = () => {
    if (!selectedDate || selectedDay?.isFuture) {
      return
    }

    router.push(`/tracking/daily?date=${encodeURIComponent(selectedDate)}`)
  }

  return (
    <SC.PageWrapper>
      <SC.PageHeader>
        <Headline as='h2' variant='h3' noSpacing>
          Timeline
        </Headline>
        <Text size='small' color='textSecondary' noSpacing>
          Monthly tracking calendar with symptom severity and quick entry
          access.
        </Text>
      </SC.PageHeader>

      <SC.CalendarCard>
        <SC.CalendarHeader>
          <SC.MonthTitleGroup>
            <Headline as='h3' variant='h4' noSpacing>
              {monthTitle}
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              {trackedDays} tracked {trackedDays === 1 ? 'day' : 'days'} from{' '}
              {monthRange.fromDate} to {monthRange.toDate}
            </Text>
          </SC.MonthTitleGroup>
          <SC.MonthControls aria-label='Timeline month navigation'>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={() => moveToMonth(addTimelineMonths(visibleMonth, -1))}
              aria-label='Show previous month'
              title='Previous month'
            >
              <Icon name='chevron_left' color='textSecondary' />
              <Text as='span' size='small' color='textSecondary' noSpacing>
                Previous
              </Text>
            </Button>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={() => moveToMonth(currentMonth)}
              disabled={
                visibleMonth.getFullYear() === currentMonth.getFullYear() &&
                visibleMonth.getMonth() === currentMonth.getMonth()
              }
              aria-label='Show current month'
              title='Current month'
            >
              <Icon name='today' color='textSecondary' />
              <Text as='span' size='small' color='textSecondary' noSpacing>
                Today
              </Text>
            </Button>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={() => moveToMonth(addTimelineMonths(visibleMonth, 1))}
              disabled={!hasNextMonth}
              aria-label='Show next month'
              title='Next month'
            >
              <Text as='span' size='small' color='textSecondary' noSpacing>
                Next
              </Text>
              <Icon name='chevron_right' color='textSecondary' />
            </Button>
          </SC.MonthControls>
        </SC.CalendarHeader>

        {error && (
          <SC.ErrorBanner role='alert'>
            <SC.ErrorIcon>
              <Icon name='error_outline' color='error' aria-hidden='true' />
            </SC.ErrorIcon>
            <Text as='span' size='small' color='error' noSpacing>
              {error}
            </Text>
            <SC.ErrorAction>
              <Button
                variant='danger-outline'
                size='sm'
                onClick={() => setReloadKey(current => current + 1)}
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

        {isLoading ? (
          <SC.StatePanel aria-live='polite'>
            <Text size='small' color='textSecondary' noSpacing>
              Loading {monthTitle} entries...
            </Text>
          </SC.StatePanel>
        ) : (
          <TimelineCalendarChart
            data={heatmapData}
            monthTitle={monthTitle}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
      </SC.CalendarCard>

      {notice && (
        <SC.NoticePanel role='status'>
          <Icon name='info' color='warning' aria-hidden='true' />
          <Text size='small' color='textSecondary' noSpacing>
            {notice}
          </Text>
        </SC.NoticePanel>
      )}

      <SC.DetailGrid>
        <SC.DetailCard>
          <SC.DetailHeader>
            <Headline as='h3' variant='h4' noSpacing>
              {selectedDate}
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              {selectedDateStatus}
            </Text>
          </SC.DetailHeader>

          {selectedEntrySummary ? (
            <>
              <SC.MetricGrid>
                <SC.MetricTile>
                  <SC.MetricLabel>Symptom score</SC.MetricLabel>
                  <SC.MetricValue>
                    {selectedEntrySummary.severity.toFixed(1)}
                  </SC.MetricValue>
                </SC.MetricTile>
                <SC.MetricTile>
                  <SC.MetricLabel>Tracked factors</SC.MetricLabel>
                  <SC.MetricValue>
                    {selectedEntrySummary.factorCount}
                  </SC.MetricValue>
                </SC.MetricTile>
              </SC.MetricGrid>
              <Text size='small' color='textSecondary' noSpacing>
                {selectedEntrySummary.symptomSummary}
              </Text>
              {selectedDay?.entry?.notes && (
                <Text size='small' color='textSecondary' noSpacing>
                  {selectedDay.entry.notes}
                </Text>
              )}
              {selectedEntrySummary.imageUrls.length > 0 && (
                <SC.ImageGrid aria-label='Entry images'>
                  {selectedEntrySummary.imageUrls.map((url, index) => (
                    <SC.EntryImage
                      key={`${url}-${index}`}
                      src={url}
                      alt={`Tracking image for ${selectedDate}`}
                    />
                  ))}
                </SC.ImageGrid>
              )}
            </>
          ) : (
            <SC.StatePanel>
              <Text size='small' color='textSecondary' noSpacing>
                {selectedDay?.isFuture
                  ? 'Future dates are visible in the calendar, but entries can only be created for today or the past.'
                  : 'Create an entry for this date to make it visible in statistics and timeline views.'}
              </Text>
            </SC.StatePanel>
          )}

          <SC.ActionRow>
            <Button
              type='button'
              variant={selectedDay?.entry ? 'primary-outline' : 'primary'}
              size='md'
              onClick={openDailyTracking}
              disabled={Boolean(selectedDay?.isFuture)}
            >
              <Icon
                name={selectedDay?.entry ? 'edit_calendar' : 'add'}
                color={selectedDay?.entry ? 'primary' : 'inherit'}
              />
              {selectedDay?.entry ? 'Edit entry' : 'New entry'}
            </Button>
          </SC.ActionRow>
        </SC.DetailCard>

        <SC.DetailCard>
          <SC.DetailHeader>
            <Headline as='h3' variant='h4' noSpacing>
              Legend
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              Colored days use the same weighted symptom score as statistics.
            </Text>
          </SC.DetailHeader>
          <SC.StatePanel>
            <Text size='small' color='textSecondary' noSpacing>
              Green is low symptom severity, blue is moderate, yellow is high,
              and red is severe. Blank days have no saved entry.
            </Text>
          </SC.StatePanel>
        </SC.DetailCard>
      </SC.DetailGrid>
    </SC.PageWrapper>
  )
}

export default TimelineTemplate
