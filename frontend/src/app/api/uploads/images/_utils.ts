import type { NextRequest } from 'next/server'

import { getBackendUrl } from '@/lib/backend-client'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

const BACKEND_UPLOAD_IMAGES_PATH = '/api/uploads/images'

interface IUploadImageRouteParams {
  fileName: string
}

export interface IUploadImageRouteContext {
  params: Promise<IUploadImageRouteParams>
}

export const buildUploadImageHeaders = (accessToken?: string): HeadersInit =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : {}

export const getUploadImageAccessToken = (
  request: NextRequest
): string | undefined =>
  request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value

export const buildUploadImageBackendPath = (fileName?: string): string =>
  fileName
    ? `${BACKEND_UPLOAD_IMAGES_PATH}/${encodeURIComponent(fileName)}`
    : BACKEND_UPLOAD_IMAGES_PATH

const readUploadResponsePayload = async (
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

export const forwardUploadJsonResponse = async (
  response: Response,
  fallbackErrorMessage: string
): Promise<Response> => {
  if (response.status === 204) {
    return new Response(null, { status: 204 })
  }

  const payload = await readUploadResponsePayload(response)

  if (!response.ok) {
    return Response.json(payload ?? { error: fallbackErrorMessage }, {
      status: response.status,
    })
  }

  return Response.json(payload ?? {}, { status: response.status })
}

export const forwardUploadImageResponse = async (
  response: Response,
  fallbackErrorMessage: string
): Promise<Response> => {
  if (!response.ok) {
    return forwardUploadJsonResponse(response, fallbackErrorMessage)
  }

  const headers = new Headers()

  for (const headerName of [
    'cache-control',
    'content-disposition',
    'content-length',
    'content-type',
  ]) {
    const headerValue = response.headers.get(headerName)

    if (headerValue) {
      headers.set(headerName, headerValue)
    }
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  })
}

export const proxyUploadImageRequest = async (
  request: NextRequest,
  {
    method,
    fileName,
    body,
    cache,
  }: {
    method: 'GET' | 'POST' | 'DELETE'
    fileName?: string
    body?: BodyInit
    cache?: RequestCache
  }
): Promise<Response> =>
  fetch(getBackendUrl(buildUploadImageBackendPath(fileName)), {
    method,
    body,
    cache,
    headers: buildUploadImageHeaders(getUploadImageAccessToken(request)),
  })

export const readUploadImageFileName = async ({
  params,
}: IUploadImageRouteContext): Promise<string> => {
  const { fileName } = await params
  return fileName
}

export const createUploadImageServerErrorResponse = (
  action: 'deleting' | 'fetching' | 'uploading'
): Response =>
  Response.json(
    { error: `Internal server error while ${action} image` },
    { status: 500 }
  )
