'use server'

import { insecureFetch } from '@/lib/backend-client'

export const getHealth = async () => {
  try {
    const res = await insecureFetch('/actuator/health')
    const body = await res.json()
    return { ok: res.ok, status: res.status, body }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}
