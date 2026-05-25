'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { PageWrapper } from '@/components/templates/shared/styles'
import {
  buildTimelineEntrySummary,
  createLocalDate,
} from '@/components/templates/timeline/utils'

import { formatDateInput } from '@/lib/date'

import { useAuth } from '@/hooks/use-auth'
import { usePageTitle } from '@/hooks/use-page-title'

import { getDiaryEntries } from '@/services/diary'

import * as SC from './styles'

import type { IDiaryEntry } from '@/types/diary'
import type { TSeverityTone } from './types'

const formatGreeting = (date: Date): string => {
  const hour = date.getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

const formatUsernameForGreeting = (username: string): string => {
  const normalized = username
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()

  if (!normalized) {
    return ''
  }

  return normalized
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

const getSeverityTone = (severity: number | null): TSeverityTone => {
  if (severity === null) {
    return 'empty'
  }

  if (severity < 2.5) {
    return 'low'
  }

  if (severity < 5) {
    return 'moderate'
  }

  if (severity < 7.5) {
    return 'high'
  }

  return 'severe'
}

const DashboardTemplate = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { setTitle, setBackLink, setParentTitle } = usePageTitle()
  const today = useMemo(() => formatDateInput(new Date()), [])
  const greeting = useMemo(() => formatGreeting(new Date()), [])
  const greetingName = useMemo(
    () => formatUsernameForGreeting(user?.username ?? ''),
    [user?.username]
  )
  const greetingTitle = greetingName ? `${greeting}, ${greetingName}` : greeting
  const weekStart = useMemo(() => {
    const start = createLocalDate(today)
    start.setDate(start.getDate() - 6)
    return start
  }, [today])

  const [selectedDate, setSelectedDate] = useState<string>(today)
  const [entries, setEntries] = useState<IDiaryEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    setTitle('Dashboard')
    setBackLink(null)
    setParentTitle(null)
  }, [setTitle, setBackLink, setParentTitle])

  const selectedEntry = useMemo(
    () => entries.find(entry => entry.entryDate === selectedDate) ?? null,
    [entries, selectedDate]
  )
  const selectedEntrySummary = useMemo(
    () => (selectedEntry ? buildTimelineEntrySummary(selectedEntry) : null),
    [selectedEntry]
  )
  const todayEntry = useMemo(
    () => entries.find(entry => entry.entryDate === today) ?? null,
    [entries, today]
  )
  const todayEntrySummary = useMemo(
    () => (todayEntry ? buildTimelineEntrySummary(todayEntry) : null),
    [todayEntry]
  )
  const visibleEntries = useMemo(
    () => entries.filter(entry => entry.entryDate <= today),
    [entries, today]
  )
  const trackedDays = visibleEntries.length
  const latestEntry = useMemo(
    () =>
      [...entries].sort((left, right) =>
        right.entryDate.localeCompare(left.entryDate)
      )[0] ?? null,
    [entries]
  )
  const selectedDateLabel = selectedEntry ? 'Entry recorded' : 'No entry yet'
  const heroStatusText = todayEntrySummary
    ? `Today is recorded with severity ${todayEntrySummary.severity.toFixed(1)}.`
    : 'Today is still open. Use the quick action below to record a new entry.'

  const weekDays = useMemo(() => {
    const entriesByDate = new Map(
      entries.map(entry => [entry.entryDate, entry])
    )
    const weekdayFormatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
    })
    const dayFormatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
    })

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const dateValue = formatDateInput(date)
      const entry = entriesByDate.get(dateValue) ?? null
      const summary = entry ? buildTimelineEntrySummary(entry) : null

      return {
        date: dateValue,
        weekday: weekdayFormatter.format(date),
        dayOfMonth: dayFormatter.format(date),
        summary,
      }
    })
  }, [entries, weekStart])

  const currentStreak = useMemo(() => {
    const entryDates = new Set(entries.map(entry => entry.entryDate))
    let streak = 0
    const cursor = createLocalDate(today)

    while (entryDates.has(formatDateInput(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  }, [entries, today])

  const weekTrend = useMemo(() => {
    const severities = weekDays
      .map(day => day.summary?.severity ?? null)
      .filter((value): value is number => value !== null)

    if (severities.length < 4) {
      return null
    }

    const recent = severities.slice(-3)
    const previous = severities.slice(0, Math.max(1, severities.length - 3))
    const recentAverage =
      recent.reduce((total, value) => total + value, 0) / recent.length
    const previousAverage =
      previous.reduce((total, value) => total + value, 0) / previous.length
    const delta = recentAverage - previousAverage
    let direction: 'improving' | 'increasing' | 'stable' = 'stable'

    if (delta < -0.1) {
      direction = 'improving'
    } else if (delta > 0.1) {
      direction = 'increasing'
    }

    return {
      delta,
      direction,
    }
  }, [weekDays])

  useEffect(() => {
    let active = true

    const loadDashboardEntries = async () => {
      setIsLoading(true)
      setError(null)

      const result = await getDiaryEntries<IDiaryEntry>({
        fromDate: formatDateInput(weekStart),
        toDate: today,
      })

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

    void loadDashboardEntries()

    return () => {
      active = false
    }
  }, [today, weekStart])

  const handleSelectDate = (date: string) => {
    if (date === selectedDate) {
      router.push(`/tracking/daily?date=${encodeURIComponent(date)}`)
      return
    }

    setSelectedDate(date)
    const entry = entries.find(candidate => candidate.entryDate === date)
    setNotice(entry ? null : 'No entry yet for this day.')
  }

  const openDailyTracking = () => {
    if (!selectedDate) {
      return
    }

    router.push(`/tracking/daily?date=${encodeURIComponent(selectedDate)}`)
  }

  const hasEntries = entries.length > 0

  const emptyStateText =
    'Create an entry for this date to include it in your timeline and statistics.'

  return (
    <PageWrapper>
      <SC.HeroCard>
        <SC.HeroCopy>
          <Headline as='h1' variant='h2' noSpacing>
            {greetingTitle}
          </Headline>
          <Text size='medium' color='textSecondary' noSpacing>
            Here is your current tracking overview. Start a new entry, review
            the month, or jump straight to your statistics.
          </Text>
          <SC.BadgeRow>
            <SC.Badge>Last 7 days</SC.Badge>
            <SC.Badge>{trackedDays} tracked days</SC.Badge>
            <SC.Badge>
              {hasEntries ? 'Tracking active' : 'No entries yet'}
            </SC.Badge>
          </SC.BadgeRow>
          <SC.HeroNote>{heroStatusText}</SC.HeroNote>
        </SC.HeroCopy>

        <SC.HeroStats>
          <SC.StatTile>
            <SC.StatLabel>Today</SC.StatLabel>
            <SC.StatValue>
              {todayEntrySummary ? 'Recorded' : 'Open entry'}
            </SC.StatValue>
          </SC.StatTile>
          <SC.StatTile>
            <SC.StatLabel>Month average</SC.StatLabel>
            <SC.StatValue>
              {visibleEntries.length > 0
                ? (
                    visibleEntries.reduce(
                      (total, entry) =>
                        total + buildTimelineEntrySummary(entry).severity,
                      0
                    ) / visibleEntries.length
                  ).toFixed(1)
                : '0.0'}
            </SC.StatValue>
          </SC.StatTile>
          <SC.StatTile>
            <SC.StatLabel>Latest entry</SC.StatLabel>
            <SC.StatValue>{latestEntry?.entryDate ?? 'None'}</SC.StatValue>
          </SC.StatTile>
        </SC.HeroStats>
      </SC.HeroCard>

      <SC.MainGrid>
        <SC.CardGrid>
          <SC.CardPanel>
            <Headline as='h3' variant='h4' noSpacing>
              Weekly insights
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              A quick snapshot of your recent tracking consistency and symptom
              trend.
            </Text>

            <SC.InsightGrid>
              <SC.InsightMetric>
                <SC.InsightLabel>Current streak</SC.InsightLabel>
                <SC.InsightValue>
                  {currentStreak} day{currentStreak === 1 ? '' : 's'}
                </SC.InsightValue>
              </SC.InsightMetric>
              <SC.InsightMetric>
                <SC.InsightLabel>Weekly trend</SC.InsightLabel>
                <SC.InsightValue>
                  {weekTrend
                    ? `${weekTrend.direction} (${weekTrend.delta > 0 ? '+' : ''}${weekTrend.delta.toFixed(1)})`
                    : 'Not enough data'}
                </SC.InsightValue>
              </SC.InsightMetric>
            </SC.InsightGrid>
          </SC.CardPanel>

          <SC.CardPanel>
            <Headline as='h3' variant='h4' noSpacing>
              Quick actions
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              Fast access to the most important places in the app.
            </Text>

            <SC.ActionGrid>
              <SC.ActionLink
                href={`/tracking/daily?date=${encodeURIComponent(today)}`}
              >
                <SC.ActionIcon>
                  <Icon name='add' color='primary' />
                </SC.ActionIcon>
                <SC.ActionText>
                  <Text as='span' size='medium' weight={700} noSpacing>
                    New entry
                  </Text>
                  <SC.ActionMeta>
                    Open today and add a fresh tracking entry.
                  </SC.ActionMeta>
                </SC.ActionText>
              </SC.ActionLink>
            </SC.ActionGrid>
          </SC.CardPanel>
        </SC.CardGrid>

        <SC.CalendarCard>
          <SC.CardHeader>
            <Headline as='h2' variant='h4' noSpacing>
              Last week
            </Headline>
            <Text size='small' color='textSecondary' noSpacing>
              A compact view of the last seven days. Click any day to see the
              entry previously recorded. Double click to edit an existing entry
              or create a new one for that date.
            </Text>
          </SC.CardHeader>

          {(() => {
            if (error) {
              return (
                <SC.Panel role='alert'>
                  <Text size='small' color='error' noSpacing>
                    {error}
                  </Text>
                </SC.Panel>
              )
            }

            if (isLoading) {
              return (
                <SC.Panel aria-live='polite'>
                  <Text size='small' color='textSecondary' noSpacing>
                    Loading last week entries...
                  </Text>
                </SC.Panel>
              )
            }

            return (
              <SC.WeekSurface>
                <SC.WeekScroller>
                  <SC.WeekGrid>
                    {weekDays.map(day => (
                      <SC.WeekDayCard
                        key={day.date}
                        type='button'
                        $selected={day.date === selectedDate}
                        onClick={() => handleSelectDate(day.date)}
                        onDoubleClick={() =>
                          router.push(
                            `/tracking/daily?date=${encodeURIComponent(
                              day.date
                            )}`
                          )
                        }
                      >
                        <SC.WeekDayHeader>
                          <SC.WeekDayLabel>{day.weekday}</SC.WeekDayLabel>
                          <SC.WeekDayDate>{day.dayOfMonth}</SC.WeekDayDate>
                        </SC.WeekDayHeader>
                        <SC.WeekDayValue
                          $tone={getSeverityTone(day.summary?.severity ?? null)}
                        >
                          {day.summary
                            ? day.summary.severity.toFixed(1)
                            : 'No entry'}
                        </SC.WeekDayValue>
                      </SC.WeekDayCard>
                    ))}
                  </SC.WeekGrid>
                </SC.WeekScroller>

                <SC.WeekLegend>
                  <SC.WeekLegendItem>
                    <SC.WeekLegendDot $tone='low' /> Low
                  </SC.WeekLegendItem>
                  <SC.WeekLegendItem>
                    <SC.WeekLegendDot $tone='moderate' /> Moderate
                  </SC.WeekLegendItem>
                  <SC.WeekLegendItem>
                    <SC.WeekLegendDot $tone='high' /> High
                  </SC.WeekLegendItem>
                  <SC.WeekLegendItem>
                    <SC.WeekLegendDot $tone='severe' /> Severe
                  </SC.WeekLegendItem>
                </SC.WeekLegend>
              </SC.WeekSurface>
            )
          })()}

          {notice && (
            <SC.NoticePanel role='status'>
              <Icon name='info' color='warning' aria-hidden='true' />
              <Text size='small' color='textSecondary' noSpacing>
                {notice}
              </Text>
            </SC.NoticePanel>
          )}
        </SC.CalendarCard>

        <SC.CardPanel>
          <Headline as='h3' variant='h4' noSpacing>
            Entry recorded
          </Headline>
          <Text size='small' color='textSecondary' noSpacing>
            {selectedDate}
          </Text>
          <Text size='small' color='textSecondary' noSpacing>
            {selectedDateLabel}
          </Text>

          {selectedEntrySummary ? (
            <>
              <SC.BadgeRow>
                <SC.Badge>
                  Severity {selectedEntrySummary.severity.toFixed(1)}
                </SC.Badge>
                <SC.Badge>{selectedEntrySummary.factorCount} factors</SC.Badge>
              </SC.BadgeRow>
              <Text size='small' color='textSecondary' noSpacing>
                {selectedEntrySummary.symptomSummary}
              </Text>
            </>
          ) : (
            <SC.EmptyState>
              <Text size='small' color='textSecondary' noSpacing>
                {emptyStateText}
              </Text>
            </SC.EmptyState>
          )}

          <SC.ActionButtonRow>
            <Button
              type='button'
              variant={selectedEntry ? 'primary-outline' : 'primary'}
              size='md'
              onClick={openDailyTracking}
              disabled={false}
            >
              <Icon
                name={selectedEntry ? 'edit_calendar' : 'add'}
                color={selectedEntry ? 'primary' : 'inherit'}
              />
              {selectedEntry ? 'Edit entry' : 'New entry'}
            </Button>
          </SC.ActionButtonRow>
        </SC.CardPanel>
      </SC.MainGrid>
    </PageWrapper>
  )
}

export default DashboardTemplate
