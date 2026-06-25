import { describe, it, expect } from 'vitest'
import { resolveOverride } from '../overrides'

describe('resolveOverride', () => {
  it('routes sprint ceremonies to R&D', () => {
    expect(resolveOverride('sprint planning')).toBe('R&D')
    expect(resolveOverride('sprint demo')).toBe('R&D')
    expect(resolveOverride('sprint review')).toBe('R&D')
    expect(resolveOverride('sprint')).toBe('R&D')
  })

  it('does NOT catch "demoday" (collision guard — that is PR, not R&D)', () => {
    expect(resolveOverride('demoday')).toBeNull()
  })

  it('returns null for unrelated queries', () => {
    expect(resolveOverride('hiring')).toBeNull()
    expect(resolveOverride('team sync')).toBeNull()
    expect(resolveOverride('')).toBeNull()
  })
})
