import { describe, it, expect } from 'vitest'
import { TRACKING_GUIDE, getGuideByProjectCategory } from '../guide-data'

describe('TRACKING_GUIDE', () => {
  it('has the six expected categories', () => {
    expect(TRACKING_GUIDE.map((c) => c.key)).toEqual([
      'ops', 'guiding', 'rnd', 'pr', 'internal', 'product',
    ])
  })

  it('every category is well-formed', () => {
    for (const cat of TRACKING_GUIDE) {
      expect(cat.project.length).toBeGreaterThan(0)
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(cat.entries.length).toBeGreaterThanOrEqual(1)
      expect(cat.intro.length).toBeGreaterThan(0)
      expect(cat.summary.length).toBeGreaterThan(0)
    }
  })

  it('OPS is the only strict category', () => {
    const strict = TRACKING_GUIDE.filter((c) => c.strict).map((c) => c.key)
    expect(strict).toEqual(['ops'])
  })

  it('maps a stored project_category back to its guide entry', () => {
    expect(getGuideByProjectCategory('OPS')?.key).toBe('ops')
    expect(getGuideByProjectCategory('2F Product')?.key).toBe('product')
    expect(getGuideByProjectCategory('Other')).toBeUndefined()
  })
})
