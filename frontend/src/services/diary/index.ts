import type { TDiaryEntryInput } from '@/validation/diary'
import { DailyTrackingPayloadSchema } from '@/validation/diary'
import { sessionAwareFetch } from '@/lib/session-aware-fetch'
import { z } from 'zod'

interface IApiErrorLike {
  error?: string
  message?: string
}

export interface ICreateDiaryEntrySuccess {
  success: true
}

export interface ICreateDiaryEntryFailure {
  success: false
  error: string
}

export type TCreateDiaryEntryResult =
  | ICreateDiaryEntrySuccess
  | ICreateDiaryEntryFailure

type TDiaryFetch = (input: string, init?: RequestInit) => Promise<Response>

export interface IGetDiaryEntrySuccess<T> {
  success: true
  data: T | null
}

export interface IGetDiaryEntryFailure {
  success: false
  error: string
}

export type TGetDiaryEntryResult<T> =
  | IGetDiaryEntrySuccess<T>
  | IGetDiaryEntryFailure

export const DiaryEntryResponseSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1).optional(),
    createdAt: z.string().optional(),
    entryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Entry date must be in YYYY-MM-DD format'),
    tracking: DailyTrackingPayloadSchema,
    notes: z.string().nullable().optional(),
  })
  .passthrough()

export const DiaryEntryListResponseSchema = z.array(DiaryEntryResponseSchema)

export type TDiaryEntryResponse = z.infer<typeof DiaryEntryResponseSchema>

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

const INVALID_DIARY_RESPONSE_MESSAGE = 'Invalid diary response received.'

export const fetchDiaryEntries = async (
  fetchImpl: TDiaryFetch = fetch
): Promise<TGetDiaryEntryResult<TDiaryEntryResponse[]>> => {
  try {
    const response = await sessionAwareFetch(
      '/api/diary',
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

    const body = await response.json().catch(() => null)
    const entries = DiaryEntryListResponseSchema.parse(body)

    return {
      success: true,
      data: entries,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: INVALID_DIARY_RESPONSE_MESSAGE,
      }
    }

    return {
      success: false,
      error: getDiaryRuntimeErrorMessage(error),
    }
  }
}

export const createDiaryEntry = async (
  payload: TDiaryEntryInput & { id?: string },
  fetchImpl: TDiaryFetch = fetch
): Promise<TCreateDiaryEntryResult> => {
  try {
    const isUpdate = Boolean(payload.id)
    const path = isUpdate ? `/api/diary/${payload.id}` : '/api/diary'
    const method = isUpdate ? 'PUT' : 'POST'

    const response = await sessionAwareFetch(
      path,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

export const getDiaryEntryByDate = async <T = unknown>(
  date: string,
  fetchImpl: TDiaryFetch = fetch
): Promise<TGetDiaryEntryResult<T>> => {
  try {
    if (!date || date.trim() === '') {
      return { success: true, data: null }
    }

    const response = await sessionAwareFetch(
      `/api/diary/by-date?date=${date}`,
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
