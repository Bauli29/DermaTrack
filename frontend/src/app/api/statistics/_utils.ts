import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { secureFetch } from '@/lib/backend-client'
import {
  isValidationError,
  validateRequestOrThrow,
} from '@/lib/validation-helper'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

const BACKEND_STATISTICS_BASE_PATH = '/api/statistics'
const END_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const PeriodParamSchema = z.enum(['7d', '30d', '90d'])

const EndDateParamSchema = z
  .string()
  .regex(END_DATE_PATTERN, 'endDate must use YYYY-MM-DD format')
  .refine(value => {
    const [yearText, monthText, dayText] = value.split('-')
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      return false
    }

    const date = new Date(year, month - 1, day)

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  }, 'endDate must be a valid calendar date')

type TStatisticsEndpoint = 'psyche-symptoms' | 'symptoms' | 'correlation'
type TStatisticsPeriod = z.infer<typeof PeriodParamSchema>

const MainCategoryParamSchema = z.enum([
  'care-products',
  'nutrition',
  'contact-factors',
  'health-factors',
])

const buildStatisticsHeaders = (accessToken?: string): HeadersInit =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

const getStatisticsAccessToken = (request: NextRequest): string | undefined =>
  request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value

const readStatisticsResponsePayload = async (
  response: Response
): Promise<unknown | null> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }

  const text = await response.text().catch(() => '')
  const trimmedText = text.trim()

  return trimmedText.length > 0 ? { error: trimmedText } : null
}

const readValidatedEndDate = (request: NextRequest): string | undefined => {
  const rawEndDate = request.nextUrl.searchParams.get('endDate')
  const trimmedEndDate = rawEndDate?.trim()

  if (!trimmedEndDate) {
    return undefined
  }

  return validateRequestOrThrow(EndDateParamSchema, trimmedEndDate)
}

const readValidatedPeriod = (
  request: NextRequest
): TStatisticsPeriod | undefined => {
  const rawPeriod = request.nextUrl.searchParams.get('period')
  const trimmedPeriod = rawPeriod?.trim().toLowerCase()

  if (!trimmedPeriod) {
    return undefined
  }

  return validateRequestOrThrow(PeriodParamSchema, trimmedPeriod)
}

const readValidatedMainCategory = (
  request: NextRequest
): string | undefined => {
  const rawMainCategory = request.nextUrl.searchParams.get('mainCategory')
  const trimmedMainCategory = rawMainCategory?.trim()

  if (!trimmedMainCategory) {
    return undefined
  }

  return validateRequestOrThrow(MainCategoryParamSchema, trimmedMainCategory)
}

export const buildStatisticsBackendPath = (
  endpoint: TStatisticsEndpoint,
  endDate?: string,
  period?: TStatisticsPeriod,
  mainCategory?: string
): string => {
  const query = new URLSearchParams()

  if (endDate) {
    query.set('endDate', endDate)
  }

  if (period) {
    query.set('period', period)
  }

  // mainCategory is only applicable for correlation endpoint
  if (mainCategory && endpoint === 'correlation') {
    query.set('mainCategory', mainCategory)
  }

  const queryString = query.toString()
  return queryString.length > 0
    ? `${BACKEND_STATISTICS_BASE_PATH}/${endpoint}?${queryString}`
    : `${BACKEND_STATISTICS_BASE_PATH}/${endpoint}`
}

export const forwardStatisticsResponse = async (
  response: Response,
  fallbackErrorMessage: string
): Promise<Response> => {
  const payload = await readStatisticsResponsePayload(response)

  if (!response.ok) {
    return Response.json(payload ?? { error: fallbackErrorMessage }, {
      status: response.status,
    })
  }

  return Response.json(payload ?? {}, { status: response.status })
}

export const proxyStatisticsRequest = async (
  request: NextRequest,
  endpoint: TStatisticsEndpoint
): Promise<Response> => {
  const endDate = readValidatedEndDate(request)
  const period = readValidatedPeriod(request)
  const mainCategory =
    endpoint === 'correlation' ? readValidatedMainCategory(request) : undefined

  return secureFetch(
    buildStatisticsBackendPath(endpoint, endDate, period, mainCategory),
    {
      method: 'GET',
      cache: 'no-store',
      headers: buildStatisticsHeaders(getStatisticsAccessToken(request)),
    }
  )
}

export const createStatisticsRequestErrorResponse = (
  error: unknown
): Response => {
  if (isValidationError(error)) {
    return Response.json(error.validationError, { status: 400 })
  }

  return Response.json(
    { error: 'Internal server error while fetching statistics' },
    { status: 500 }
  )
}
