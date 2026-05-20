import type { PointOptionsObject } from 'highcharts'

import type { IDiaryEntry } from '@/types/diary'

export interface ITimelineMonthRange {
  fromDate: string
  toDate: string
}

export interface ITimelineDay {
  date: string
  dayOfMonth: number
  isFuture: boolean
  entry: IDiaryEntry | null
  severity: number | null
}

export interface ITimelineHeatmapPointCustom {
  date: string | null
  dayOfMonth: number | null
  empty: boolean
  hasEntry: boolean
  isFuture: boolean
  severity: number | null
}

export interface ITimelineHeatmapPoint extends PointOptionsObject {
  x: number
  y: number
  value: number | null
  custom: ITimelineHeatmapPointCustom
}

export interface ITimelineEntrySummary {
  severity: number
  symptomSummary: string
  factorCount: number
  imageUrls: string[]
}

export interface ITimelinePointContext {
  custom?: ITimelineHeatmapPointCustom
  options?: {
    custom?: ITimelineHeatmapPointCustom
  }
  point?: ITimelinePointContext
}

export interface ITimelineCalendarChartProps {
  data: ITimelineHeatmapPoint[]
  monthTitle: string
  selectedDate: string | null
  onSelectDate: (date: string) => void
}
