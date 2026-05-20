import type {
  ColumnStatisticsChartSchema,
  LineStatisticsChartSchema,
  StatisticsDateRangeSchema,
  StatisticsSeriesSchema,
} from '@/validation/statistics'
import type { z } from 'zod'

export type TStatisticsSeries = z.infer<typeof StatisticsSeriesSchema>
export type TStatisticsDateRange = z.infer<typeof StatisticsDateRangeSchema>
export type TLineStatisticsChart = z.infer<typeof LineStatisticsChartSchema>
export type TColumnStatisticsChart = z.infer<typeof ColumnStatisticsChartSchema>
export type TStatisticsChart = TLineStatisticsChart | TColumnStatisticsChart

export interface IApiErrorLike {
  error?: string
  message?: string
}

export type TStatisticsFetch = (
  input: string,
  init?: RequestInit
) => Promise<Response>

export interface IStatisticsRequestParams {
  startDate?: string
  endDate?: string
  mainCategory?: string
}

export interface IStatisticsRequestSuccess<TData> {
  success: true
  data: TData
}

export interface IStatisticsRequestFailure {
  success: false
  error: string
  status?: number
}

export type TStatisticsRequestResult<TData> =
  | IStatisticsRequestSuccess<TData>
  | IStatisticsRequestFailure
