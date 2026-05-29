import {
  getSafeInternalPath,
  getSafeRedirectPathFromSearch,
} from '@/lib/client-navigation'

describe('client navigation helpers', () => {
  it('keeps same-origin internal paths including query and hash', () => {
    expect(getSafeInternalPath('/tracking/daily?date=2026-05-28#images')).toBe(
      '/tracking/daily?date=2026-05-28#images'
    )
  })

  it('falls back for external, protocol, or empty redirect values', () => {
    expect(getSafeInternalPath('https://example.com')).toBe('/')
    expect(getSafeInternalPath('//example.com')).toBe('/')
    expect(getSafeInternalPath('javascript:alert(1)')).toBe('/')
    expect(getSafeInternalPath(null)).toBe('/')
  })

  it('reads a safe next path from search params', () => {
    expect(
      getSafeRedirectPathFromSearch('?next=%2Fstatistics%3Ftab%3Dsymptoms')
    ).toBe('/statistics?tab=symptoms')
  })
})
