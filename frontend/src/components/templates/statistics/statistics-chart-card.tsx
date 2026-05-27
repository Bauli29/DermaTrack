'use client'

import 'highcharts/esm/modules/exporting.src'
import 'highcharts/esm/modules/offline-exporting.src'

import type { ComponentType, HTMLAttributes, ReactNode, Ref } from 'react'
import { Chart, HighchartsReactRefObject } from '@highcharts/react'
import { useEffect, useMemo, useRef, useState } from 'react'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { useTheme } from '@/hooks/use-theme'

import * as SC from './styles'
import {
  buildStatisticsExportFileName,
  buildStatisticsChartOptions,
  formatStatisticsRange,
  hasRenderableStatisticsChart,
} from './utils'

import type { ExportingOptions, Options } from 'highcharts'

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
  exportFileName?: string
}

type TChartExportType = 'image/png' | 'application/pdf'

interface IExportableHighchartsChart {
  exportChart?: (
    exportingOptions?: ExportingOptions,
    chartOptions?: Options
  ) => Promise<void> | void
}

const StatisticsChartCard = ({
  chart,
  title,
  description,
  headerAction,
  note,
  emptyMessage,
  exportFileName,
}: IStatisticsChartCardProps) => {
  const { theme } = useTheme()
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<HighchartsReactRefObject | null>(null)
  const [pendingExportType, setPendingExportType] =
    useState<TChartExportType | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const options = useMemo(
    () => buildStatisticsChartOptions(chart, theme),
    [chart, theme]
  )

  const fileNameBase =
    exportFileName ??
    buildStatisticsExportFileName(
      title,
      chart.dateRange.from,
      chart.dateRange.to,
      'chart'
    ).replace(/\.chart$/, '')

  const exportChart = async (type: TChartExportType) => {
    const chartInstance = chartRef.current?.chart as
      | IExportableHighchartsChart
      | null
      | undefined

    if (!chartInstance?.exportChart) {
      setExportError('Chart export is currently unavailable.')
      return
    }

    setPendingExportType(type)
    setExportError(null)

    try {
      const exportingOptions: ExportingOptions = {
        fallbackToExportServer: false,
        filename: fileNameBase,
        type,
      }

      await chartInstance.exportChart(exportingOptions, {
        title: {
          text: title,
        },
      })
    } catch {
      setExportError('Chart export failed. Please try again.')
    } finally {
      setPendingExportType(null)
    }
  }

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
          <SC.ChartExportActions aria-label={`${title} exports`}>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={() => void exportChart('image/png')}
              disabled={pendingExportType !== null}
            >
              <Icon name='image' color='inherit' aria-hidden='true' />
              <Text as='span' size='small' color='text' noSpacing>
                PNG
              </Text>
            </Button>
            <Button
              type='button'
              variant='ghost-outline'
              size='sm'
              onClick={() => void exportChart('application/pdf')}
              disabled={pendingExportType !== null}
            >
              <Icon name='picture_as_pdf' color='inherit' aria-hidden='true' />
              <Text as='span' size='small' color='text' noSpacing>
                PDF
              </Text>
            </Button>
          </SC.ChartExportActions>
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
      {exportError && (
        <SC.ExportStatus role='alert'>
          <Text as='span' size='small' color='error' noSpacing>
            {exportError}
          </Text>
        </SC.ExportStatus>
      )}
      {note && <SC.ChartNote>{note}</SC.ChartNote>}
    </SC.ChartCard>
  )
}

export default StatisticsChartCard
