import { NextResponse } from 'next/server'
import { getApiDocs } from '@/lib/swagger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const spec = await getApiDocs()
    return NextResponse.json(spec)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error while fetching Frontend API Docs' },
      { status: 500 }
    )
  }
}
