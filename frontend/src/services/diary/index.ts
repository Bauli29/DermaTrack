import type { TDiaryEntryInput } from '@/validation/diary'
import { sessionAwareFetch } from '@/lib/session-aware-fetch'

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
  payload: TDiaryEntryInput,
  fetchImpl: TDiaryFetch = fetch
): Promise<TCreateDiaryEntryResult> => {
  try {
    const response = await sessionAwareFetch(
      '/api/diary',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      {
        fetchImpl,
      }
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
