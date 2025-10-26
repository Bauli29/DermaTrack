import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/actuator/health`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(
      { ok: res.ok, backendUrl: BACKEND_URL, data },
      { status: res.status }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { ok: false, backendUrl: BACKEND_URL, error: message },
      { status: 500 }
    )
  }
}
