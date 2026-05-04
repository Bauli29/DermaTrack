'use client'

import type { ComponentType, HTMLAttributes, Ref } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { Chart, type HighchartsReactRefObject } from '@highcharts/react'
import type { Options } from 'highcharts'

import Headline from '@/components/atoms/Headline'
import Text from '@/components/atoms/Text'

import { useTheme } from '@/hooks/use-theme'

import type { TStatisticsChart } from '@/services/statistics/types'

import * as SC from './styles'
import {
  buildStatisticsSeriesSnapshots,
  buildStatisticsChartOptions,
  formatStatisticsDate,
  formatStatisticsRange,
  formatStatisticsScore,
  hasRenderableStatisticsChart,
} from './utils'

const HighchartsChart = Chart as unknown as ComponentType<{
  options: Options
  containerProps?: HTMLAttributes<HTMLDivElement>
  ref?: Ref<HighchartsReactRefObject>
}>

export interface IStatisticsChartCardProps {
  chart: TStatisticsChart
  title: string
  description: string
}

const StatisticsChartCard = ({
  chart,
  title,
  description,
}: IStatisticsChartCardProps) => {
  const { theme } = useTheme()
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<HighchartsReactRefObject | null>(null)
  const options = useMemo(
    () => buildStatisticsChartOptions(chart, theme),
    [chart, theme]
  )
  const seriesSnapshots = useMemo(
    () => buildStatisticsSeriesSnapshots(chart, theme),
    [chart, theme]
  )

  useEffect(() => {
    const surface = chartSurfaceRef.current

    if (!surface) {
      return
    }

    let frameId: number | null = null

    const syncChartSize = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }

      frameId = window.requestAnimationFrame(() => {
        const chartInstance = chartRef.current?.chart
        const { height, width } = surface.getBoundingClientRect()

        if (chartInstance && width > 0 && height > 0) {
          chartInstance.setSize(Math.round(width), Math.round(height), false)
        }
      })
    }

    syncChartSize()

    const resizeObserver = new ResizeObserver(syncChartSize)
    resizeObserver.observe(surface)

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }

      resizeObserver.disconnect()
    }
  }, [options])

  if (!hasRenderableStatisticsChart(chart)) {
    return (
      <SC.ChartCard>
        <SC.ChartTitleGroup>
          <Headline variant='h4' noSpacing>
            {title}
          </Headline>
          <Text size='small' color='textSecondary' maxLines={2} noSpacing>
            {description}
          </Text>
        </SC.ChartTitleGroup>
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            No chart data is available for the selected window.
          </Text>
        </SC.StatePanel>
      </SC.ChartCard>
    )
  }

  return (
    <SC.ChartCard>
      <SC.ChartHeader>
        <SC.ChartTitleGroup>
          <Headline variant='h4' noSpacing>
            {title}
          </Headline>
          <Text size='small' color='textSecondary' maxLines={2} noSpacing>
            {description}
          </Text>
        </SC.ChartTitleGroup>
        <SC.RangeBadge>
          {formatStatisticsRange(chart.dateRange.from, chart.dateRange.to)}
        </SC.RangeBadge>
      </SC.ChartHeader>
      <SC.SeriesSnapshot
        role='list'
        aria-label={`${title} latest recorded values`}
      >
        {seriesSnapshots.map(snapshot => {
          const score = formatStatisticsScore(snapshot.value)
          const date = snapshot.date
            ? formatStatisticsDate(snapshot.date)
            : 'No recorded date'

          return (
            <SC.SeriesChip
              key={snapshot.name}
              role='listitem'
              aria-label={`${snapshot.name}: ${score}, ${date}`}
              title={`${snapshot.name}: ${score}, ${date}`}
            >
              <SC.SeriesSwatch $color={snapshot.color} aria-hidden='true' />
              <SC.SeriesName>{snapshot.name}</SC.SeriesName>
              <SC.SeriesValue>{score}</SC.SeriesValue>
            </SC.SeriesChip>
          )
        })}
      </SC.SeriesSnapshot>
      <SC.ChartSurface ref={chartSurfaceRef}>
        <HighchartsChart
          ref={chartRef}
          options={options}
          containerProps={{
            style: {
              width: '100%',
              height: '100%',
            },
          }}
        />
      </SC.ChartSurface>
    </SC.ChartCard>
  )
}

export default StatisticsChartCard
