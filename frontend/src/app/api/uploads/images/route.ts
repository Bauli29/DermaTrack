import type { NextRequest } from 'next/server'

import {
  createUploadImageServerErrorResponse,
  forwardUploadJsonResponse,
  proxyUploadImageRequest,
} from './_utils'

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    const formData = await request.formData()
    const response = await proxyUploadImageRequest(request, {
      method: 'POST',
      body: formData,
    })

    return forwardUploadJsonResponse(response, 'Failed to upload image')
  } catch {
    return createUploadImageServerErrorResponse('uploading')
  }
}
