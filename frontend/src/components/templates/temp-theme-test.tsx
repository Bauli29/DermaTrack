'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/hooks/use-theme'

type THealthResponse =
  | { ok: true; backendUrl: string; data: { status: string } }
  | { ok: false; backendUrl: string; error: string }

const TempThemeTest = () => {
  const { toggleTheme } = useTheme()
  const [status, setStatus] = useState<'loading' | 'up' | 'down'>('loading')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/backend-health', { cache: 'no-store' })
        const json = (await res.json()) as THealthResponse
        if (!isMounted) return
        if ('ok' in json && json.ok && 'data' in json) {
          setStatus(json.data.status === 'UP' ? 'up' : 'down')
          setDetails(`Backend URL: ${json.backendUrl}`)
        } else {
          setStatus('down')
          setDetails(`Error: ${'error' in json ? json.error : 'Unknown'}`)
        }
      } catch (e) {
        if (!isMounted) return
        const msg = e instanceof Error ? e.message : String(e)
        setStatus('down')
        setDetails(`Error: ${msg}`)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>Hello World</div>
      <button onClick={toggleTheme}>Theme Toggle</button>
      <div>
        <strong>Backend Health:</strong>{' '}
        {status === 'loading' ? 'Loading…' : status === 'up' ? 'UP ✅' : 'DOWN ❌'}
      </div>
      {details && <code style={{ whiteSpace: 'pre-wrap' }}>{details}</code>}
    </div>
  )
}
export default TempThemeTest
