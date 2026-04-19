declare const describe: (name: string, fn: () => void) => void

declare const it: (name: string, fn: () => void) => void

declare const beforeEach: (fn: () => void) => void

declare const expect: (actual: unknown) => {
  toBe: (expected: unknown) => void
  toContain: (expected: unknown) => void
  toBeNull: () => void
  not: {
    toBe: (expected: unknown) => void
    toContain: (expected: unknown) => void
    toBeNull: () => void
  }
}
