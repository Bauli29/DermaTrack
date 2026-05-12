import { z } from 'zod'

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const StatisticsPeriodSchema = z.enum(['7d', '30d', '90d'])

export const StatisticsDateStringSchema = z
  .string()
  .regex(DATE_STRING_PATTERN, 'Expected date in YYYY-MM-DD format')

export const StatisticsSeriesSchema = z.object({
  name: z.string().min(1),
  data: z.array(z.number().nullable()),
})

export const StatisticsDateRangeSchema = z.object({
  from: StatisticsDateStringSchema,
  to: StatisticsDateStringSchema,
})

const BaseStatisticsChartSchema = z.object({
  categories: z.array(z.string().min(1)),
  series: z.array(StatisticsSeriesSchema),
  dateRange: StatisticsDateRangeSchema,
})

const TimeSeriesStatisticsChartSchema = BaseStatisticsChartSchema.extend({
  categories: z.array(StatisticsDateStringSchema),
})

export const LineStatisticsChartSchema = TimeSeriesStatisticsChartSchema.extend(
  {
    chartType: z.literal('line'),
  }
)

export const ColumnStatisticsChartSchema = BaseStatisticsChartSchema.extend({
  chartType: z.literal('column'),
})

export type TStatisticsSeries = z.infer<typeof StatisticsSeriesSchema>
export type TStatisticsDateRange = z.infer<typeof StatisticsDateRangeSchema>
export type TStatisticsPeriod = z.infer<typeof StatisticsPeriodSchema>
export type TLineStatisticsChart = z.infer<typeof LineStatisticsChartSchema>
export type TColumnStatisticsChart = z.infer<typeof ColumnStatisticsChartSchema>
export type TStatisticsChart = TLineStatisticsChart | TColumnStatisticsChart
