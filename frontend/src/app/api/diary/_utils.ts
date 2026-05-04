import type { NextRequest } from 'next/server'

import { secureFetch } from '@/lib/backend-client'
import {
  isValidationError,
  validateRequestOrThrow,
} from '@/lib/validation-helper'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import { DiaryEntrySchema, type TDiaryEntryInput } from '@/validation/diary'

const BACKEND_DIARY_BASE_PATH = '/api/diary'

type TDiaryMutationAction = 'creating' | 'updating'

interface IDiaryRouteParams {
  id: string
}

export interface IDiaryRouteContext {
  params: Promise<IDiaryRouteParams>
}

export const buildDiaryBackendPath = (id?: string): string =>
  id ? `${BACKEND_DIARY_BASE_PATH}/${id}` : BACKEND_DIARY_BASE_PATH

export const buildDiaryHeaders = (accessToken?: string): HeadersInit =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

const getDiaryAccessToken = (request: NextRequest): string | undefined =>
  request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value

const readDiaryResponsePayload = async (
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

export const forwardDiaryResponse = async (
  response: Response,
  fallbackErrorMessage: string
): Promise<Response> => {
  if (response.status === 204) {
    return new Response(null, { status: 204 })
  }

  const payload = await readDiaryResponsePayload(response)

  if (!response.ok) {
    return Response.json(payload ?? { error: fallbackErrorMessage }, {
      status: response.status,
    })
  }

  return Response.json(payload ?? {}, { status: response.status })
}

export const proxyDiaryRequest = async (
  request: NextRequest,
  {
    method,
    id,
    body,
    cache,
    //searchParams,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    id?: string
    body?: string
    cache?: RequestCache
    searchParams?: string
  }
): Promise<Response> =>
  secureFetch(buildDiaryBackendPath(id), {
    method,
    body,
    cache,
    headers: buildDiaryHeaders(getDiaryAccessToken(request)),
  })

export const readDiaryRouteId = async ({
  params,
}: IDiaryRouteContext): Promise<string> => {
  const { id } = await params
  return id
}

export const readValidatedDiaryBody = async (
  request: NextRequest
): Promise<TDiaryEntryInput> => {
  const body = await request.json()
  return validateRequestOrThrow(DiaryEntrySchema, body)
}

export const createDiaryMutationErrorResponse = (
  error: unknown,
  action: TDiaryMutationAction
): Response => {
  if (isValidationError(error)) {
    return Response.json(error.validationError, { status: 400 })
  }

  if (error instanceof SyntaxError) {
    return Response.json(
      { error: 'Invalid JSON in request body' },
      {
        status: 400,
      }
    )
  }

  return createDiaryServerErrorResponse(action)
}

export const createDiaryServerErrorResponse = (
  action: 'fetching' | 'creating' | 'deleting' | 'updating'
): Response =>
  Response.json(
    { error: `Internal server error while ${action} diary entry` },
    { status: 500 }
  )
