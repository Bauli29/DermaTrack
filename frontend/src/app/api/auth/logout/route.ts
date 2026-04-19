import { NextResponse } from 'next/server'

import { proxyAuthRequest } from '../_utils'

export const POST = async (request: Request): Promise<NextResponse> => {
  const authorization = request.headers.get('authorization')
  const headers: HeadersInit = {}

  if (authorization) {
    headers.Authorization = authorization
  }

  return proxyAuthRequest('/logout', {
    method: 'POST',
    headers,
  })
}
