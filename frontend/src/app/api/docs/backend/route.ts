import { NextRequest, NextResponse } from 'next/server'

import { secureFetch } from '@/lib/backend-client'

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const accessToken = request.cookies.get('dermatrack_access_token')?.value
    const response = await secureFetch('/api/v3/api-docs', {
      method: 'GET',
      cache: 'no-store',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        errorData ?? { error: 'Failed to fetch Swagger Documentation' },
        { status: response.status }
      )
    }

    // return the parsed JSON body from the backend
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while fetching Frontend API Docs' },
      { status: 500 }
    )
  }
}
