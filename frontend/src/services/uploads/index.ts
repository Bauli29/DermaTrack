import { sessionAwareFetch } from '@/lib/session-aware-fetch'

import type {
  IUploadedImage,
  TDeleteImageResult,
  TUploadFetch,
  TUploadImageResult,
} from './types'

const UPLOAD_IMAGES_PATH = '/api/uploads/images'

const getApiErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = (await response.json().catch(() => null)) as {
      error?: unknown
      message?: unknown
    } | null

    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error
    }

    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message
    }
  }

  const text = await response.text().catch(() => '')
  return text.trim().length > 0 ? text.trim() : fallback
}

const getRuntimeErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : 'Image request failed. Please try again.'

const getUploadedImageFileName = (imageUrl: string): string | null => {
  const baseOrigin =
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const url = new URL(imageUrl, baseOrigin)
  const isAbsoluteExternalUrl =
    /^https?:\/\//i.test(imageUrl) && url.origin !== baseOrigin
  const pathParts = url.pathname.split('/')
  const fileName = pathParts.at(-1)

  if (
    isAbsoluteExternalUrl ||
    !url.pathname.startsWith(`${UPLOAD_IMAGES_PATH}/`) ||
    !fileName
  ) {
    return null
  }

  return fileName
}

export const uploadImage = async (
  file: File,
  fetchImpl: TUploadFetch = fetch
): Promise<TUploadImageResult> => {
  try {
    const formData = new FormData()
    formData.set('file', file)

    const response = await sessionAwareFetch(
      UPLOAD_IMAGES_PATH,
      {
        method: 'POST',
        body: formData,
      },
      { fetchImpl }
    )

    if (!response.ok) {
      return {
        success: false,
        error: await getApiErrorMessage(response, 'Failed to upload image.'),
      }
    }

    return {
      success: true,
      data: (await response.json()) as IUploadedImage,
    }
  } catch (error) {
    return {
      success: false,
      error: getRuntimeErrorMessage(error),
    }
  }
}

export const deleteImage = async (
  imageUrl: string,
  fetchImpl: TUploadFetch = fetch
): Promise<TDeleteImageResult> => {
  try {
    const fileName = getUploadedImageFileName(imageUrl)

    if (!fileName) {
      return { success: true }
    }

    const response = await sessionAwareFetch(
      `${UPLOAD_IMAGES_PATH}/${encodeURIComponent(fileName)}`,
      {
        method: 'DELETE',
      },
      { fetchImpl }
    )

    if (!response.ok) {
      return {
        success: false,
        error: await getApiErrorMessage(response, 'Failed to delete image.'),
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: getRuntimeErrorMessage(error),
    }
  }
}

export type {
  IUploadedImage,
  TDeleteImageResult,
  TUploadFetch,
  TUploadImageResult,
} from './types'
