import type {
  TColumnStatisticsChart,
  TLineStatisticsChart,
} from '@/services/statistics/types'

export interface IStatisticsViewState {
  psycheSymptoms: TLineStatisticsChart
  symptoms: TColumnStatisticsChart
  correlation: TColumnStatisticsChart
}

export interface IStatisticsSeriesSnapshot {
  name: string
  color: string
  value: number | null
  date: string | null
}
