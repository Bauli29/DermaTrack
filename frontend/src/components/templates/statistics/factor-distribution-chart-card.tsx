'use client'

import type { ComponentType, HTMLAttributes, Ref } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { Chart, type HighchartsReactRefObject } from '@highcharts/react'
import type { Options } from 'highcharts'
import 'highcharts/esm/modules/exporting.src.js'
import 'highcharts/esm/modules/offline-exporting.src.js'

import Button from '@/components/atoms/Button'
import Headline from '@/components/atoms/Headline'
import Icon from '@/components/atoms/Icon'
import Text from '@/components/atoms/Text'

import { useTheme } from '@/hooks/use-theme'

import type { TFactorImpactStatistics } from '@/services/statistics/types'

import * as SC from './styles'
import {
  buildFactorDistributionChartOptions,
  buildStatisticsExportFilename,
  formatStatisticsRange,
  hasRenderableFactorDistribution,
} from './utils'

const HighchartsChart = Chart as unknown as ComponentType<{
  options: Options
  containerProps?: HTMLAttributes<HTMLDivElement>
  ref?: Ref<HighchartsReactRefObject>
}>

type TChartExportType = 'image/png' | 'application/pdf'

type TExportableHighchartsChart = HighchartsReactRefObject['chart'] & {
  exporting?: {
    exportChart: (options: {
      filename: string
      type: TChartExportType
    }) => Promise<void> | void
  }
}

export interface IFactorDistributionChartCardProps {
  factorImpacts: TFactorImpactStatistics
}

const FactorDistributionChartCard = ({
  factorImpacts,
}: IFactorDistributionChartCardProps) => {
  const { theme } = useTheme()
  const chartSurfaceRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<HighchartsReactRefObject | null>(null)
  const options = useMemo(
    () => buildFactorDistributionChartOptions(factorImpacts, theme),
    [factorImpacts, theme]
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

  const exportChart = (type: TChartExportType) => {
    const chartInstance = chartRef.current?.chart as
      | TExportableHighchartsChart
      | undefined

    if (!chartInstance?.exporting) {
      return
    }

    void chartInstance.exporting.exportChart({
      filename: buildStatisticsExportFilename(
        'factor-distribution',
        factorImpacts.dateRange.from,
        factorImpacts.dateRange.to
      ),
      type,
    })
  }

  return (
    <SC.ChartCard>
      <SC.ChartHeader>
        <SC.ChartTitleGroup>
          <Headline variant='h4' noSpacing>
            Factor Distribution
          </Headline>
          <Text size='small' color='textSecondary' maxLines={2} noSpacing>
            Occurrence share by factor category.
          </Text>
        </SC.ChartTitleGroup>
        <SC.ChartHeaderActions>
          <SC.RangeBadge>
            {formatStatisticsRange(
              factorImpacts.dateRange.from,
              factorImpacts.dateRange.to
            )}
          </SC.RangeBadge>
          <Button
            type='button'
            variant='ghost-outline'
            size='sm'
            onClick={() => exportChart('image/png')}
            disabled={!hasRenderableFactorDistribution(factorImpacts)}
            aria-label='Export factor distribution chart as PNG'
            title='Export factor distribution chart as PNG'
          >
            <Icon name='image' color='textSecondary' aria-hidden='true' />
            <Text as='span' size='small' color='textSecondary' noSpacing>
              PNG
            </Text>
          </Button>
          <Button
            type='button'
            variant='ghost-outline'
            size='sm'
            onClick={() => exportChart('application/pdf')}
            disabled={!hasRenderableFactorDistribution(factorImpacts)}
            aria-label='Export factor distribution chart as PDF'
            title='Export factor distribution chart as PDF'
          >
            <Icon
              name='picture_as_pdf'
              color='textSecondary'
              aria-hidden='true'
            />
            <Text as='span' size='small' color='textSecondary' noSpacing>
              PDF
            </Text>
          </Button>
        </SC.ChartHeaderActions>
      </SC.ChartHeader>

      {hasRenderableFactorDistribution(factorImpacts) ? (
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
      ) : (
        <SC.StatePanel>
          <Text size='small' color='textSecondary' noSpacing>
            No factor distribution is available for the selected window.
          </Text>
        </SC.StatePanel>
      )}
    </SC.ChartCard>
  )
}

export default FactorDistributionChartCard
