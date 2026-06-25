import { describe, it, expect } from 'vitest'
import { normalizeText, matchesQuery, buildRecommendation } from '../lookup'
import type { LookupCandidate } from '../lookup'

describe('normalizeText', () => {
  it('treats dotted, camelCase, and spaced variants as equal', () => {
    const a = normalizeText('design.ops.status')
    const b = normalizeText('DesignOps status')
    const c = normalizeText('design ops status')
    expect(a).toBe('design ops status')
    expect(b).toBe('design ops status')
    expect(c).toBe('design ops status')
  })
})

describe('matchesQuery', () => {
  it('matches when normalized query is a substring of name or description', () => {
    const nq = normalizeText('DesignOps status')
    expect(matchesQuery('design.ops.status', null, nq)).toBe(true)
    expect(matchesQuery('Meeting', 'weekly design ops status sync', nq)).toBe(true)
    expect(matchesQuery('Hiring', 'Hiring: Jan Novák', nq)).toBe(false)
  })
})

describe('buildRecommendation', () => {
  const rows: LookupCandidate[] = [
    { projectName: 'Design tým interní', projectCategory: 'Internal', activityName: 'design.ops.status', description: 'sync', hours: 10, isUnpaired: false },
    { projectName: 'Design tým interní', projectCategory: 'Internal', activityName: 'design.ops.status', description: 'sync', hours: 5, isUnpaired: false },
    { projectName: 'Design tým OPS', projectCategory: 'OPS', activityName: 'design.ops.status', description: 'status', hours: 30, isUnpaired: true },
  ]

  it('recommends the dominant NON-unpaired category, ignoring mistakes', () => {
    const result = buildRecommendation(rows)
    // OPS has more raw hours (30) but they are all Unpaired → Internal wins.
    expect(result.recommendation?.projectCategory).toBe('Internal')
    expect(result.recommendation?.project).toBe('Design tým interní')
    expect(result.recommendation?.guideKey).toBe('internal')
    // 2 of 3 matched cases go to Internal → 67 %.
    expect(result.recommendation?.sharePct).toBe(67)
  })

  it('reports the unpaired warning totals', () => {
    const result = buildRecommendation(rows)
    expect(result.warning.unpairedCount).toBe(1)
    expect(result.warning.unpairedHours).toBe(30)
  })

  it('returns a breakdown row per project_category', () => {
    const result = buildRecommendation(rows)
    const internal = result.breakdown.find((b) => b.projectCategory === 'Internal')
    expect(internal).toEqual({ projectCategory: 'Internal', entryCount: 2, totalHours: 15, unpairedCount: 0 })
  })

  it('falls back to no recommendation when every match is unpaired', () => {
    const allBad: LookupCandidate[] = [
      { projectName: 'Design tým OPS', projectCategory: 'OPS', activityName: 'x', description: 'x', hours: 4, isUnpaired: true },
    ]
    const result = buildRecommendation(allBad)
    expect(result.recommendation).toBeNull()
    expect(result.warning.unpairedCount).toBe(1)
  })

  it('handles an empty candidate list', () => {
    const result = buildRecommendation([])
    expect(result.recommendation).toBeNull()
    expect(result.breakdown).toEqual([])
    expect(result.examples).toEqual([])
  })
})

describe('buildRecommendation with an editorial override', () => {
  const historicallyInternal: LookupCandidate[] = [
    { projectName: 'Design tým interní', projectCategory: 'Internal', activityName: 'sprint planning', description: '', hours: 40, isUnpaired: false },
  ]

  it('override wins over historical data and carries no sharePct (it is a decision, not a statistic)', () => {
    const result = buildRecommendation(historicallyInternal, 'R&D')
    expect(result.recommendation?.projectCategory).toBe('R&D')
    expect(result.recommendation?.project).toBe('Design tým R&D')
    expect(result.recommendation?.overridden).toBe(true)
    expect(result.recommendation?.sharePct).toBeNull()
  })

  it('applies even when there is no matching history', () => {
    const result = buildRecommendation([], 'R&D')
    expect(result.recommendation?.projectCategory).toBe('R&D')
    expect(result.recommendation?.overridden).toBe(true)
    expect(result.recommendation?.previousCategory).toBeNull()
  })

  it('shows no previousCategory when history already matches the override', () => {
    const alreadyRnd: LookupCandidate[] = [
      { projectName: 'Design tým R&D', projectCategory: 'R&D', activityName: 'sprint', description: '', hours: 10, isUnpaired: false },
    ]
    const result = buildRecommendation(alreadyRnd, 'R&D')
    expect(result.recommendation?.overridden).toBe(true)
    expect(result.recommendation?.previousCategory).toBeNull()
  })

  it('without an override, recommendation is not flagged as overridden', () => {
    const result = buildRecommendation(historicallyInternal)
    expect(result.recommendation?.projectCategory).toBe('Internal')
    expect(result.recommendation?.overridden).toBe(false)
    expect(result.recommendation?.previousCategory).toBeNull()
  })
})
