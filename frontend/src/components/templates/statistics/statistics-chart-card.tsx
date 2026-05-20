'use client'

import type { ComponentType, HTMLAttributes, ReactNode, Ref } from 'react'
import { Chart, HighchartsReactRefObject } from '@highcharts/react'
import { useEffect, useMemo, useRef } from 'react'

import Headline from '@/components/atoms/Headline'
import Text from '@/components/atoms/Text'

import { useTheme } from '@/hooks/use-theme'

import * as SC from './styles'
import {
  buildStatisticsChartOptions,
  formatStatisticsRange,
  hasRenderableStatisticsChart,
} from './utils'

import type { Options } from 'highcharts'

import type { TStatisticsChart } from '@/services/statistics/types'

const HighchartsChart = Chart as unknown as ComponentType<{
  options: Options
  containerProps?: HTMLAttributes<HTMLDivElement>
  ref?: Ref<HighchartsReactRefObject>
}>

export interface IStatisticsChartCardProps {
  chart: TStatisticsChart
  title: string
  description: string
  headerAction?: ReactNode
  note?: ReactNode
  emptyMessage?: string
}

const StatisticsChartCard = ({
  chart,
  title,
  description,
  headerAction,
  note,
  emptyMessage,
}: IStatisticsChartCardProps) => {
  const { theme } = useTheme()
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<HighchartsReactRefObject | null>(null)
  const options = useMemo(
    () => buildStatisticsChartOptions(chart, theme),
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
        <SC.ChartHeader>
          <SC.ChartTitleGroup>
            <Headline variant='h4' noSpacing>
              {title}
            </Headline>
            <Text size='small' color='textSecondary' maxLines={2} noSpacing>
              {description}
            </Text>
          </SC.ChartTitleGroup>
          {headerAction && (
            <SC.ChartHeaderAction>{headerAction}</SC.ChartHeaderAction>
          )}
        </SC.ChartHeader>
        {note && <SC.ChartNote>{note}</SC.ChartNote>}
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            {emptyMessage ??
              'No chart data is available for the selected window.'}
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
        <SC.ChartHeaderRight>
          <SC.RangeBadge>
            {formatStatisticsRange(chart.dateRange.from, chart.dateRange.to)}
          </SC.RangeBadge>
          {headerAction && (
            <SC.ChartHeaderAction>{headerAction}</SC.ChartHeaderAction>
          )}
        </SC.ChartHeaderRight>
      </SC.ChartHeader>
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
      {note && <SC.ChartNote>{note}</SC.ChartNote>}
    </SC.ChartCard>
  )
}

export default StatisticsChartCard
