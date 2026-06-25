import { ProjectCategory } from '@/types/costlocker.types'

/**
 * Editorial "track it here now" rules. These OVERRIDE the data-driven lookup
 * recommendation for activities we used to track one way but now want elsewhere.
 *
 * `match` terms must be written already-normalized (lowercase, spaces) — they are
 * tested as substrings of the normalized user query (see `normalizeText`).
 *
 * Keep this list small and specific. Avoid terms that collide with other
 * activities — e.g. `demo` would also catch "Demoday" (PR), so we match the
 * whole-phrase intent via `sprint` instead, which covers sprint planning /
 * sprint demo / sprint review without touching Demoday.
 */
export interface TrackingOverride {
  match: string[]
  projectCategory: ProjectCategory
}

export const TRACKING_OVERRIDES: TrackingOverride[] = [
  // Sprint ceremonies moved from Internal → R&D.
  { match: ['sprint'], projectCategory: 'R&D' },
]

/**
 * Return the override category for a normalized query, or null if no rule matches.
 */
export function resolveOverride(normalizedQuery: string): ProjectCategory | null {
  if (!normalizedQuery) return null
  for (const rule of TRACKING_OVERRIDES) {
    if (rule.match.some((term) => normalizedQuery.includes(term))) {
      return rule.projectCategory
    }
  }
  return null
}
