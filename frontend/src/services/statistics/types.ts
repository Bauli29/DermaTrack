import { z } from 'zod'

const DATE_STRING_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const StatisticsPeriodSchema = z.enum(['7d', '30d', '90d', '6m', '1y'])

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

export const StatisticsDataQualitySchema = z.object({
  dataPointCount: z.number().int().nonnegative(),
  minimumRecommendedDataPoints: z.number().int().positive(),
  insufficientData: z.boolean(),
})

const BaseStatisticsChartSchema = z.object({
  categories: z.array(StatisticsDateStringSchema),
  series: z.array(StatisticsSeriesSchema),
  dateRange: StatisticsDateRangeSchema,
  dataQuality: StatisticsDataQualitySchema,
})

export const LineStatisticsChartSchema = BaseStatisticsChartSchema.extend({
  chartType: z.literal('line'),
})

export const ColumnStatisticsChartSchema = BaseStatisticsChartSchema.extend({
  chartType: z.literal('column'),
})

export const FactorImpactSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  category: z.string().min(1),
  totalEntries: z.number().int().nonnegative(),
  occurrenceCount: z.number().int().nonnegative(),
  occurrenceRate: z.number().nonnegative(),
  averageWeightedSymptomScore: z.number().nullable(),
  weightedSymptomDelta: z.number().nullable(),
  pearsonCorrelation: z.number().nullable(),
})

export const FactorImpactStatisticsSchema = z.object({
  dateRange: StatisticsDateRangeSchema,
  totalEntries: z.number().int().nonnegative(),
  averageWeightedSymptomScore: z.number().nullable(),
  dataQuality: StatisticsDataQualitySchema,
  factors: z.array(FactorImpactSchema),
})

export type TStatisticsSeries = z.infer<typeof StatisticsSeriesSchema>
export type TStatisticsDateRange = z.infer<typeof StatisticsDateRangeSchema>
export type TStatisticsDataQuality = z.infer<typeof StatisticsDataQualitySchema>
export type TStatisticsPeriod = z.infer<typeof StatisticsPeriodSchema>
export type TLineStatisticsChart = z.infer<typeof LineStatisticsChartSchema>
export type TColumnStatisticsChart = z.infer<typeof ColumnStatisticsChartSchema>
export type TStatisticsChart = TLineStatisticsChart | TColumnStatisticsChart
export type TFactorImpact = z.infer<typeof FactorImpactSchema>
export type TFactorImpactStatistics = z.infer<
  typeof FactorImpactStatisticsSchema
>
