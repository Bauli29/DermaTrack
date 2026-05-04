import { z } from 'zod'

import { sessionAwareFetch } from '@/lib/session-aware-fetch'

import {
  ColumnStatisticsChartSchema,
  LineStatisticsChartSchema,
  type TColumnStatisticsChart,
  type TLineStatisticsChart,
  type TStatisticsPeriod,
} from './types'

interface IApiErrorLike {
  error?: string
  message?: string
}

type TStatisticsFetch = (input: string, init?: RequestInit) => Promise<Response>

export interface IStatisticsRequestParams {
  endDate?: string
  period?: TStatisticsPeriod
}

interface IStatisticsRequestSuccess<TData> {
  success: true
  data: TData
}

interface IStatisticsRequestFailure {
  success: false
  error: string
}

export type TStatisticsRequestResult<TData> =
  | IStatisticsRequestSuccess<TData>
  | IStatisticsRequestFailure

export const STATISTICS_API_PATHS = {
  psycheSymptoms: '/api/statistics/psyche-symptoms',
  symptoms: '/api/statistics/symptoms',
} as const

const INVALID_STATISTICS_RESPONSE_MESSAGE =
  'Invalid statistics response received.'

const getApiErrorMessage = (body: IApiErrorLike | null): string | null => {
  if (!body) {
    return null
  }

  if (typeof body.error === 'string' && body.error.trim().length > 0) {
    return body.error
  }

  if (typeof body.message === 'string' && body.message.trim().length > 0) {
    return body.message
  }

  return null
}

const getStatisticsErrorMessage = async (
  response: Response
): Promise<string> => {
  const fallbackMessage = `Request failed with status ${response.status}`
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = (await response
      .json()
      .catch(() => null)) as IApiErrorLike | null
    return getApiErrorMessage(body) ?? fallbackMessage
  }

  const text = await response.text().catch(() => '')
  const trimmedText = text.trim()

  return trimmedText.length > 0 ? trimmedText : fallbackMessage
}

const getStatisticsRuntimeErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : 'Failed to load statistics. Please try again.'

export const buildStatisticsApiPath = (
  path: string,
  params: IStatisticsRequestParams = {}
): string => {
  const query = new URLSearchParams()
  const trimmedEndDate = params.endDate?.trim()

  if (trimmedEndDate) {
    query.set('endDate', trimmedEndDate)
  }

  if (params.period) {
    query.set('period', params.period)
  }

  const queryString = query.toString()
  return queryString.length > 0 ? `${path}?${queryString}` : path
}

const fetchStatisticsChart = async <TData>(
  path: string,
  schema: z.ZodType<TData>,
  params?: IStatisticsRequestParams,
  fetchImpl: TStatisticsFetch = fetch
): Promise<TStatisticsRequestResult<TData>> => {
  try {
    const response = await sessionAwareFetch(
      buildStatisticsApiPath(path, params),
      {
        method: 'GET',
        cache: 'no-store',
      },
      { fetchImpl }
    )

    if (!response.ok) {
      return {
        success: false,
        error: await getStatisticsErrorMessage(response),
      }
    }

    const body = await response.json().catch(() => null)
    const parsedBody = schema.parse(body)

    return {
      success: true,
      data: parsedBody,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: INVALID_STATISTICS_RESPONSE_MESSAGE,
      }
    }

    return {
      success: false,
      error: getStatisticsRuntimeErrorMessage(error),
    }
  }
}

export const fetchPsycheSymptomsChart = async (
  params?: IStatisticsRequestParams,
  fetchImpl?: TStatisticsFetch
): Promise<TStatisticsRequestResult<TLineStatisticsChart>> =>
  fetchStatisticsChart(
    STATISTICS_API_PATHS.psycheSymptoms,
    LineStatisticsChartSchema,
    params,
    fetchImpl
  )

export const fetchSymptomsChart = async (
  params?: IStatisticsRequestParams,
  fetchImpl?: TStatisticsFetch
): Promise<TStatisticsRequestResult<TColumnStatisticsChart>> =>
  fetchStatisticsChart(
    STATISTICS_API_PATHS.symptoms,
    ColumnStatisticsChartSchema,
    params,
    fetchImpl
  )
