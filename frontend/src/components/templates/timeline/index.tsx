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

import * as SC from './styles'
import {
  addTimelineMonths,
  buildTimelineDays,
  buildTimelineEntrySummary,
  buildTimelineHeatmapData,
  formatTimelineMonthTitle,
  getTimelineMonthRange,
} from './utils'

import type { IDiaryEntry } from '@/types/diary'

import type { ITimelineCalendarChartProps } from './timeline-calendar-chart'

const historyDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

const formatHistoryDate = (date: string): string =>
  historyDateFormatter.format(new Date(`${date}T00:00:00`))

interface IActiveTimelineImage {
  src: string
  alt: string
  title: string
}

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
  const [activeImage, setActiveImage] = useState<IActiveTimelineImage | null>(
    null
  )

  useEffect(() => {
    setTitle('Timeline')
    setBackLink(null)
    setParentTitle(null)
  }, [setTitle, setBackLink, setParentTitle])

  useEffect(() => {
    if (!activeImage) {
      return undefined
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveImage(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeImage])

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
  // recentEntries removed — timeline only shows highlights (records)
  interface IHighlightItem {
    key: string
    label: string
    item: {
      date: string
      summary: ReturnType<typeof buildTimelineEntrySummary>
      notesLength: number
    }
  }

  const highlights = useMemo<IHighlightItem[]>(() => {
    const daysWithEntry = timelineDays.filter(d => d.entry)

    if (daysWithEntry.length === 0) return []

    const summaries = daysWithEntry.map(d => ({
      date: d.date,
      summary: buildTimelineEntrySummary(d.entry!),
      notesLength: (d.entry?.notes ?? '').length,
    }))

    const mostSevere = summaries.reduce(
      (best, cur) =>
        cur.summary.severity > best.summary.severity ? cur : best,
      summaries[0]
    )

    const leastSevere = summaries.reduce(
      (best, cur) =>
        cur.summary.severity < best.summary.severity ? cur : best,
      summaries[0]
    )

    const mostFactors = summaries.reduce(
      (best, cur) =>
        cur.summary.factorCount > best.summary.factorCount ? cur : best,
      summaries[0]
    )

    const bestDocumented = summaries.reduce(
      (best, cur) =>
        (cur.summary.imageUrls.length || 0) >
        (best.summary.imageUrls.length || 0)
          ? cur
          : best,
      summaries[0]
    )

    return [
      { key: 'most-severe', label: 'Most severe', item: mostSevere },
      { key: 'least-severe', label: 'Least severe', item: leastSevere },
      { key: 'most-factors', label: 'Most factors', item: mostFactors },
      {
        key: 'best-documented',
        label: 'Best documented',
        item: bestDocumented,
      },
    ]
  }, [timelineDays])
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
          Browse your day-by-day logbook, open a specific entry, and see the
          month in context.
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
                    <SC.EntryImageButton
                      key={`${url}-${index}`}
                      type='button'
                      aria-label={`View tracking image ${index + 1} for ${selectedDate}`}
                      onClick={() =>
                        setActiveImage({
                          src: url,
                          alt: `Tracking image ${index + 1} for ${selectedDate}`,
                          title: `Tracking image ${index + 1}`,
                        })
                      }
                    >
                      <SC.EntryImage
                        src={url}
                        alt={`Tracking image for ${selectedDate}`}
                      />
                    </SC.EntryImageButton>
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

        <SC.HistoryCard>
          <SC.DetailHeader>
            <Headline as='h3' variant='h4' noSpacing>
              Logbook highlights
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              Notable records from this month.
            </Text>
          </SC.DetailHeader>
          {highlights.length > 0 && (
            <>
              <Headline as='h4' variant='h5' noSpacing>
                Highlights
              </Headline>
              <SC.HistoryList>
                {highlights.map(h => (
                  <SC.HistoryEntryButton
                    key={h.key}
                    type='button'
                    onClick={() => handleSelectDate(h.item.date)}
                    aria-label={`${h.label} ${h.item.date}`}
                  >
                    <SC.HistoryEntryHeader>
                      <Headline as='h5' variant='h5' noSpacing>
                        {h.label}
                      </Headline>
                      <SC.HistoryEntryBadge>
                        {h.item.summary.severity.toFixed(1)}
                      </SC.HistoryEntryBadge>
                    </SC.HistoryEntryHeader>
                    <SC.HistoryEntrySummary>
                      {formatHistoryDate(h.item.date)} —{' '}
                      {h.item.summary.symptomSummary}
                    </SC.HistoryEntrySummary>
                  </SC.HistoryEntryButton>
                ))}
              </SC.HistoryList>
            </>
          )}

          {highlights.length === 0 && (
            <SC.StatePanel>
              <Text size='small' color='textSecondary' noSpacing>
                No notable records for this month yet.
              </Text>
            </SC.StatePanel>
          )}
        </SC.HistoryCard>
      </SC.DetailGrid>

      {activeImage && (
        <SC.LightboxBackdrop
          role='presentation'
          onClick={() => setActiveImage(null)}
        >
          <SC.LightboxDialog
            role='dialog'
            aria-modal='true'
            aria-label={activeImage.title}
            onClick={event => event.stopPropagation()}
          >
            <SC.LightboxHeader>
              <SC.LightboxTitle>{activeImage.title}</SC.LightboxTitle>
              <SC.LightboxCloseButton
                type='button'
                aria-label='Close image preview'
                onClick={() => setActiveImage(null)}
              >
                <Icon name='close' color='inherit' size='md' />
              </SC.LightboxCloseButton>
            </SC.LightboxHeader>
            <SC.LightboxImage src={activeImage.src} alt={activeImage.alt} />
          </SC.LightboxDialog>
        </SC.LightboxBackdrop>
      )}
    </SC.PageWrapper>
  )
}

export default TimelineTemplate
