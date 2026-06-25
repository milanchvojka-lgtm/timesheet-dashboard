import { getGuideByProjectCategory } from './guide-data'

export interface LookupCandidate {
  projectName: string
  projectCategory: string
  activityName: string
  description: string | null
  hours: number
  isUnpaired: boolean
}

export interface BreakdownRow {
  projectCategory: string
  entryCount: number
  totalHours: number
  unpairedCount: number
}

export interface LookupRecommendation {
  projectCategory: string
  project: string | null
  guideKey: string | null
}

export interface LookupResult {
  recommendation: LookupRecommendation | null
  breakdown: BreakdownRow[]
  warning: { unpairedCount: number; unpairedHours: number }
  examples: { projectName: string; description: string | null }[]
}

/**
 * Normalize free-text so that "design.ops.status", "DesignOps status" and
 * "design ops status" all collapse to the same comparable string.
 */
export function normalizeText(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camelCase
    .toLowerCase()
    .replace(/[._\-/]+/g, ' ') // separators → space
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
}

export function matchesQuery(
  activityName: string,
  description: string | null,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return false
  const haystack = normalizeText(`${activityName} ${description ?? ''}`)
  return haystack.includes(normalizedQuery)
}

export function buildRecommendation(candidates: LookupCandidate[]): LookupResult {
  const byCategory = new Map<string, BreakdownRow>()
  const cleanHoursByCategory = new Map<string, number>()
  let unpairedCount = 0
  let unpairedHours = 0

  for (const c of candidates) {
    const row =
      byCategory.get(c.projectCategory) ??
      { projectCategory: c.projectCategory, entryCount: 0, totalHours: 0, unpairedCount: 0 }
    row.entryCount += 1
    row.totalHours += c.hours
    if (c.isUnpaired) {
      row.unpairedCount += 1
      unpairedCount += 1
      unpairedHours += c.hours
    } else {
      cleanHoursByCategory.set(
        c.projectCategory,
        (cleanHoursByCategory.get(c.projectCategory) ?? 0) + c.hours
      )
    }
    byCategory.set(c.projectCategory, row)
  }

  const breakdown = Array.from(byCategory.values()).sort((a, b) => b.totalHours - a.totalHours)

  let recommendation: LookupRecommendation | null = null
  let bestCategory: string | null = null
  let bestHours = -1
  for (const [category, hours] of cleanHoursByCategory.entries()) {
    if (hours > bestHours) {
      bestHours = hours
      bestCategory = category
    }
  }
  if (bestCategory) {
    const guide = getGuideByProjectCategory(bestCategory)
    recommendation = {
      projectCategory: bestCategory,
      project: guide?.project ?? null,
      guideKey: guide?.key ?? null,
    }
  }

  const examples = candidates
    .filter((c) => !c.isUnpaired)
    .slice(0, 3)
    .map((c) => ({ projectName: c.projectName, description: c.description }))

  return { recommendation, breakdown, warning: { unpairedCount, unpairedHours }, examples }
}
