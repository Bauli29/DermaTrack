import type {
  TColumnStatisticsChart,
  TLineStatisticsChart,
  TStatisticsPeriod,
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

export interface IStatisticsPeriodOption {
  value: TStatisticsPeriod
  label: string
}
