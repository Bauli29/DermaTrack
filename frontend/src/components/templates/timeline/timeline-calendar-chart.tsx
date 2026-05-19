'use client'

import 'highcharts/esm/modules/accessibility.src.js'
import 'highcharts/esm/modules/heatmap.src.js'

import { Chart, HighchartsReactRefObject } from '@highcharts/react'
import { useEffect, useMemo, useRef } from 'react'

import Text from '@/components/atoms/Text'

import { useTheme } from '@/hooks/use-theme'

import * as SC from './styles'
import { buildTimelineChartOptions, ITimelineHeatmapPoint } from './utils'

import type { ComponentType, HTMLAttributes, Ref } from 'react'
import type { Options, Point } from 'highcharts'

const HighchartsChart = Chart as unknown as ComponentType<{
  options: Options
  containerProps?: HTMLAttributes<HTMLDivElement>
  ref?: Ref<HighchartsReactRefObject>
}>

export interface ITimelineCalendarChartProps {
  data: ITimelineHeatmapPoint[]
  monthTitle: string
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const TimelineCalendarChart = ({
  data,
  monthTitle,
  onSelectDate,
  selectedDate,
}: ITimelineCalendarChartProps) => {
  const { theme } = useTheme()
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<HighchartsReactRefObject | null>(null)
  const options = useMemo(
    () =>
      buildTimelineChartOptions({
        data,
        monthTitle,
        onSelectDate,
        selectedDate,
        theme,
      }),
    [data, monthTitle, onSelectDate, selectedDate, theme]
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

  useEffect(() => {
    const chart = chartRef.current?.chart

    if (!chart) return

    try {
      const series = chart.series?.[0]

      if (!series) return

      type TPointWithGraphic = Point & {
        options?: { custom?: { date?: string | null }; color?: string }
        custom?: { date?: string | null }
        color?: string
        graphic?: {
          toFront?: () => void
          attr: { [key: string]: string | number }
        }
      }

      series.data.forEach(point => {
        const p = point as TPointWithGraphic
        const { options, custom: directCustom, graphic } = p
        const custom = options?.custom ?? directCustom

        if (!graphic) return

        if (custom?.date === selectedDate) {
          try {
            graphic.toFront()
          } catch {
            // no-op
          }

          const currentFill =
            (p as TPointWithGraphic).color ??
            options?.color ??
            theme.colors.card

          graphic.attr({
            fill: currentFill,
            stroke: theme.colors.primary,
            'stroke-width': 4,
          })
        } else {
          const currentFill =
            (p as TPointWithGraphic).color ??
            options?.color ??
            theme.colors.card

          graphic.attr({
            fill: currentFill,
            stroke: theme.colors.background,
            'stroke-width': 3,
          })
        }
      })
    } catch {
      // keep rendering even if a point graphic is unavailable during a rerender
    }
  }, [selectedDate, theme])

  if (data.length === 0) {
    return (
      <SC.StatePanel>
        <Text size='small' color='textSecondary' noSpacing>
          No calendar days are available for this month.
        </Text>
      </SC.StatePanel>
    )
  }

  return (
    <SC.CalendarSurface ref={chartSurfaceRef}>
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
    </SC.CalendarSurface>
  )
}

export default TimelineCalendarChart
