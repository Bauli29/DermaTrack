import type { TDiaryEntryInput } from '@/validation/diary'
import { sessionAwareFetch } from '@/lib/session-aware-fetch'

import type {
  IApiErrorLike,
  IGetDiaryEntriesParams,
  TDiaryFetch,
  TGetDiaryEntryResult,
  TCreateDiaryEntryResult,
} from './types'

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

const getDiarySubmissionErrorMessage = async (
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

const getDiaryRuntimeErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : 'Failed to save entry. Please try again.'

export const createDiaryEntry = async (
  payload: TDiaryEntryInput & { id?: string },
  fetchImpl: TDiaryFetch = fetch
): Promise<TCreateDiaryEntryResult> => {
  try {
    const { id, ...diaryPayload } = payload
    const isUpdate = Boolean(id)
    const path = isUpdate ? `/api/diary/${id}` : '/api/diary'
    const method = isUpdate ? 'PUT' : 'POST'

    const response = await sessionAwareFetch(
      path,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diaryPayload),
      },
      { fetchImpl }
    )

    if (!response.ok) {
      return {
        success: false,
        error: await getDiarySubmissionErrorMessage(response),
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: getDiaryRuntimeErrorMessage(error),
    }
  }
}

export const buildDiaryEntriesApiPath = (
  params: IGetDiaryEntriesParams = {}
): string => {
  const query = new URLSearchParams()
  const trimmedFromDate = params.fromDate?.trim()
  const trimmedToDate = params.toDate?.trim()

  if (trimmedFromDate) {
    query.set('fromDate', trimmedFromDate)
  }

  if (trimmedToDate) {
    query.set('toDate', trimmedToDate)
  }

  const queryString = query.toString()
  return queryString ? `/api/diary?${queryString}` : '/api/diary'
}

export const getDiaryEntries = async <T = unknown>(
  params?: IGetDiaryEntriesParams,
  fetchImpl: TDiaryFetch = fetch
): Promise<TGetDiaryEntryResult<T[]>> => {
  try {
    const response = await sessionAwareFetch(
      buildDiaryEntriesApiPath(params),
      {
        method: 'GET',
        cache: 'no-store',
      },
      { fetchImpl }
    )

    if (!response.ok) {
      return {
        success: false,
        error: await getDiarySubmissionErrorMessage(response),
      }
    }

    const data = (await response.json()) as T[]

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: getDiaryRuntimeErrorMessage(error),
    }
  }
}

export const getDiaryEntryByDate = async <T = unknown>(
  date: string,
  fetchImpl: TDiaryFetch = fetch
): Promise<TGetDiaryEntryResult<T>> => {
  try {
    if (!date || date.trim() === '') {
      return { success: true, data: null }
    }

    const query = new URLSearchParams({ date })
    const response = await sessionAwareFetch(
      `/api/diary/by-date?${query.toString()}`,
      {
        method: 'GET',
      },
      { fetchImpl }
    )

    if (response.status === 404) {
      return { success: true, data: null }
    }

    if (!response.ok) {
      return {
        success: false,
        error: await getDiarySubmissionErrorMessage(response),
      }
    }

    const data = (await response.json()) as T

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: getDiaryRuntimeErrorMessage(error),
    }
  }
}
