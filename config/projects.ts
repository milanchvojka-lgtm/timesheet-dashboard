import { ProjectCategory } from '@/types/costlocker.types'

/**
 * Project Name Mapping Configuration
 *
 * Maps Costlocker project names to standardized internal project categories.
 * Handles year variants (_2024, _2025, _2026, etc.)
 *
 * Pattern: "Design tým [Category]_[Year]" → Category
 */

/**
 * Project name patterns to category mapping
 * Use regex patterns to match project names with year variants
 */
export const PROJECT_PATTERNS: Array<{
  pattern: RegExp
  category: ProjectCategory
}> = [
  {
    pattern: /^Design tým OPS_\d{4}$/i,
    category: 'OPS',
  },
  {
    pattern: /^Design tým Interní_\d{4}$/i,
    category: 'Internal',
  },
  {
    pattern: /^Design tým R&D_\d{4}$/i,
    category: 'R&D',
  },
  {
    pattern: /^Design tým Guiding_\d{4}$/i,
    category: 'Guiding',
  },
  {
    pattern: /^Design tým PR_\d{4}$/i,
    category: 'PR',
  },
  {
    pattern: /^Design tým UX Maturity_\d{4}$/i,
    category: 'UX Maturity',
  },
]

/**
 * Direct project name to category mapping
 * For exact matches without year suffix
 */
export const PROJECT_MAPPING: Record<string, ProjectCategory> = {
  // OPS variants
  'Design tým OPS_2024': 'OPS',
  'Design tým OPS_2025': 'OPS',
  'Design tým OPS_2026': 'OPS',
  'Design tým OPS': 'OPS',

  // Internal variants
  'Design tým Interní_2024': 'Internal',
  'Design tým Interní_2025': 'Internal',
  'Design tým Interní_2026': 'Internal',
  'Design tým Interní': 'Internal',

  // R&D variants
  'Design tým R&D_2024': 'R&D',
  'Design tým R&D_2025': 'R&D',
  'Design tým R&D_2026': 'R&D',
  'Design tým R&D': 'R&D',

  // Guiding variants
  'Design tým Guiding_2024': 'Guiding',
  'Design tým Guiding_2025': 'Guiding',
  'Design tým Guiding_2026': 'Guiding',
  'Design tým Guiding': 'Guiding',

  // PR variants
  'Design tým PR_2024': 'PR',
  'Design tým PR_2025': 'PR',
  'Design tým PR_2026': 'PR',
  'Design tým PR': 'PR',

  // UX Maturity variants
  'Design tým UX Maturity_2024': 'UX Maturity',
  'Design tým UX Maturity_2025': 'UX Maturity',
  'Design tým UX Maturity_2026': 'UX Maturity',
  'Design tým UX Maturity': 'UX Maturity',
}

/**
 * Map a Costlocker project name to internal project category
 *
 * @param projectName - The project name from Costlocker
 * @returns The mapped project category, or 'Other' if no match found
 *
 * @example
 * ```typescript
 * mapProjectCategory('Design tým OPS_2025') // Returns 'OPS'
 * mapProjectCategory('Design tým Interní_2024') // Returns 'Internal'
 * mapProjectCategory('Some Other Project') // Returns 'Other'
 * ```
 */
export function mapProjectCategory(projectName: string): ProjectCategory {
  // Try direct mapping first (faster)
  const directMatch = PROJECT_MAPPING[projectName]
  if (directMatch) {
    return directMatch
  }

  // Try pattern matching
  for (const { pattern, category } of PROJECT_PATTERNS) {
    if (pattern.test(projectName)) {
      return category
    }
  }

  // Default to 'Other' if no match found
  return 'Other'
}

/**
 * Get all mapped project names for a specific category
 *
 * @param category - The project category to filter by
 * @returns Array of project names that map to this category
 *
 * @example
 * ```typescript
 * getProjectNamesByCategory('OPS')
 * // Returns ['Design tým OPS_2024', 'Design tým OPS_2025', ...]
 * ```
 */
export function getProjectNamesByCategory(
  category: ProjectCategory
): string[] {
  return Object.entries(PROJECT_MAPPING)
    .filter(([_, cat]) => cat === category)
    .map(([name]) => name)
}

/**
 * Extract year from project name
 *
 * @param projectName - The project name from Costlocker
 * @returns The year as a number, or null if not found
 *
 * @example
 * ```typescript
 * extractYearFromProjectName('Design tým OPS_2025') // Returns 2025
 * extractYearFromProjectName('Design tým OPS') // Returns null
 * ```
 */
export function extractYearFromProjectName(
  projectName: string
): number | null {
  const match = projectName.match(/_(\d{4})$/)
  return match ? parseInt(match[1], 10) : null
}
