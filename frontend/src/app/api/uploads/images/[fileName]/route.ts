import type { NextRequest } from 'next/server'

import {
  createUploadImageServerErrorResponse,
  forwardUploadImageResponse,
  forwardUploadJsonResponse,
  IUploadImageRouteContext,
  proxyUploadImageRequest,
  readUploadImageFileName,
} from '../_utils'

export const GET = async (
  request: NextRequest,
  context: IUploadImageRouteContext
): Promise<Response> => {
  try {
    const fileName = await readUploadImageFileName(context)
    const response = await proxyUploadImageRequest(request, {
      method: 'GET',
      fileName,
      cache: 'no-store',
    })

    return forwardUploadImageResponse(response, 'Failed to fetch image')
  } catch {
    return createUploadImageServerErrorResponse('fetching')
  }
}

export const DELETE = async (
  request: NextRequest,
  context: IUploadImageRouteContext
): Promise<Response> => {
  try {
    const fileName = await readUploadImageFileName(context)
    const response = await proxyUploadImageRequest(request, {
      method: 'DELETE',
      fileName,
    })

    return forwardUploadJsonResponse(response, 'Failed to delete image')
  } catch {
    return createUploadImageServerErrorResponse('deleting')
  }
}
