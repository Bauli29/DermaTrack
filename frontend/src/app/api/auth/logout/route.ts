import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAMES } from '@/constants/auth'

import {
  callBackendAuth,
  clearAuthCookies,
  forwardBackendResponse,
} from '../_utils'

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.ACCESS_TOKEN)?.value
  const headers: HeadersInit = {}

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const backendResponse = await callBackendAuth('/logout', {
    method: 'POST',
    headers,
  })

  if (!backendResponse.ok && backendResponse.status !== 401) {
    const response = await forwardBackendResponse(backendResponse)
    clearAuthCookies(response)
    return response
  }

  const response = new NextResponse(null, { status: 204 })
  clearAuthCookies(response)
  return response
}
