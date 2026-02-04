/**
 * Activity categories for timesheet entries
 */
export type ActivityCategory =
  | 'OPS_Hiring'
  | 'OPS_Jobs'
  | 'OPS_Reviews'
  | 'OPS_Guiding'
  | 'Unpaired'
  | 'Other' // For non-OPS/Guiding projects without validation issues

/**
 * Activity keyword from database
 */
export interface ActivityKeyword {
  id: string
  category: ActivityCategory
  keyword: string
  created_at?: string
}

/**
 * Categorize a single activity based on keywords
 *
 * Performs case-insensitive matching of keywords in activity description and name.
 * Priority order: Hiring > Jobs > Reviews > Guiding
 *
 * Rules:
 * 1. OPS_Hiring, OPS_Jobs, OPS_Reviews: ONLY valid on OPS projects
 *    - If found on any other project (Guiding, Internal, R&D, etc.) → Unpaired
 * 2. OPS_Guiding: Only valid on Guiding projects
 *    - If found on OPS project without specific keywords → Unpaired
 * 3. Fallback: Guiding projects without keywords → OPS_Guiding
 * 4. Fallback: OPS projects without keywords → Unpaired (must use specific keywords)
 * 5. Other projects: Always Unpaired (Internal, R&D, PR, etc. should not use OPS keywords)
 *
 * @param activityName - Activity/task name
 * @param description - Activity description (optional)
 * @param projectName - Project name (for project type detection)
 * @param keywords - Array of activity keywords from database
 * @returns Category of the activity
 *
 * @example
 * categorizeActivity('Internal', 'Hiring: Interview with candidate', 'Design tým OPS_2025', keywords)
 * // Returns: 'OPS_Hiring' (keyword at start of description followed by ":")
 *
 * categorizeActivity('Internal', 'Jobs: Posting', 'Design tým Interní_2025', keywords)
 * // Returns: 'Unpaired' (Jobs keyword prefix on Internal project - mistake!)
 *
 * categorizeActivity('Internal', 'design ops status a jobs ops', 'Design tým Interní_2025', keywords)
 * // Returns: 'Other' ("jobs" not at start of description with ":" - not a tagged entry)
 *
 * categorizeActivity('Meeting', 'Team sync', 'Design tým OPS_2025', keywords)
 * // Returns: 'Unpaired' (OPS project needs specific keywords)
 *
 * categorizeActivity('Meeting', 'Team sync', 'Design tým Guiding_2025', keywords)
 * // Returns: 'OPS_Guiding' (Guiding project fallback)
 */
export function categorizeActivity(
  activityName: string,
  description: string | null,
  projectName: string,
  keywords: ActivityKeyword[],
  strictValidation: boolean = false
): ActivityCategory {
  // Description for prefix matching (OPS_Hiring, OPS_Jobs, OPS_Reviews)
  // Keyword must be at the start, followed by ":", whitespace, or end of string
  const descriptionLower = (description || '').trim().toLowerCase()

  // Check if description starts with keyword as a complete word
  const matchesPrefix = (desc: string, kw: string): boolean => {
    if (!desc.startsWith(kw)) return false
    if (desc.length === kw.length) return true // exact match
    const nextChar = desc[kw.length]
    return nextChar === ':' || nextChar === ' ' || nextChar === '\t'
  }
  // Combined text for Guiding keyword matching (matches anywhere)
  const searchText = `${activityName} ${description || ''}`.toLowerCase()
  const projectNameLower = projectName.toLowerCase()

  // Group keywords by category (handle both underscore and space variants)
  const categorizedKeywords = {
    OPS_Hiring: keywords.filter((k) => k.category === 'OPS_Hiring' || k.category === 'OPS Hiring').map((k) => k.keyword.toLowerCase()),
    OPS_Jobs: keywords.filter((k) => k.category === 'OPS_Jobs' || k.category === 'OPS Jobs').map((k) => k.keyword.toLowerCase()),
    OPS_Reviews: keywords.filter((k) => k.category === 'OPS_Reviews' || k.category === 'OPS Reviews').map((k) => k.keyword.toLowerCase()),
    OPS_Guiding: keywords.filter((k) => k.category === 'OPS_Guiding' || k.category === 'OPS Guiding').map((k) => k.keyword.toLowerCase()),
  }

  // Check for hiring keywords (ONLY valid on OPS projects)
  // Must appear at the beginning of description as a complete word
  for (const keyword of categorizedKeywords.OPS_Hiring) {
    if (matchesPrefix(descriptionLower, keyword)) {
      // Only valid on OPS projects (not Guiding, not Internal, not R&D, etc.)
      if (projectNameLower.includes('ops')) {
        return 'OPS_Hiring'
      }
      // Found on wrong project type - it's a mistake
      return 'Unpaired'
    }
  }

  // Check for jobs keywords (ONLY valid on OPS projects)
  // Must appear at the beginning of description as a complete word
  for (const keyword of categorizedKeywords.OPS_Jobs) {
    if (matchesPrefix(descriptionLower, keyword)) {
      // Only valid on OPS projects (not Guiding, not Internal, not R&D, etc.)
      if (projectNameLower.includes('ops')) {
        return 'OPS_Jobs'
      }
      // Found on wrong project type - it's a mistake
      return 'Unpaired'
    }
  }

  // Check for reviews keywords (ONLY valid on OPS projects)
  // Must appear at the beginning of description as a complete word
  for (const keyword of categorizedKeywords.OPS_Reviews) {
    if (matchesPrefix(descriptionLower, keyword)) {
      // Only valid on OPS projects (not Guiding, not Internal, not R&D, etc.)
      if (projectNameLower.includes('ops')) {
        return 'OPS_Reviews'
      }
      // Found on wrong project type - it's a mistake
      return 'Unpaired'
    }
  }

  // Check for guiding/general keywords (only valid on Guiding projects)
  for (const keyword of categorizedKeywords.OPS_Guiding) {
    if (searchText.includes(keyword)) {
      // Only valid on Guiding projects
      if (projectNameLower.includes('guiding')) {
        return 'OPS_Guiding'
      } else if (projectNameLower.includes('ops')) {
        // If found on OPS project without specific keywords, it's unpaired
        return 'Unpaired'
      }
      // If found on other projects (Internal, R&D, PR), ignore it
      // These projects can use general keywords without issues
      // Continue checking other rules
    }
  }

  // Fallback rules based on project name
  if (projectNameLower.includes('guiding')) {
    // Guiding projects without keywords still count as OPS_Guiding
    return 'OPS_Guiding'
  }

  if (projectNameLower.includes('ops')) {
    // OPS projects without specific keywords
    if (strictValidation) {
      // Strict mode (Review Buddy): Flag as unpaired - needs fixing!
      return 'Unpaired'
    } else {
      // Lenient mode (Analytics): Auto-categorize as OPS_Guiding
      return 'OPS_Guiding'
    }
  }

  // Everything else (Internal, R&D, PR, etc.) without OPS keywords is fine
  // These don't need validation - they're just regular work on other projects
  return 'Other'
}

/**
 * Timesheet entry with categorization
 */
export interface CategorizedEntry {
  id: string
  person_id: number
  person_name: string
  project_id: number
  project_name: string
  activity_id: number
  activity_name: string
  date: string
  hours: number
  description: string | null
  category: ActivityCategory
}

/**
 * Categorize all timesheet entries
 *
 * @param entries - Array of timesheet entries
 * @param keywords - Array of activity keywords
 * @param strictValidation - If true, use strict validation rules (for Review Buddy)
 * @returns Array of categorized entries
 */
export function categorizeTimesheet(
  entries: Array<{
    id: string
    person_id: number
    person_name: string
    project_id: number
    project_name: string
    activity_id: number
    activity_name: string
    date: string
    hours: number
    description: string | null
  }>,
  keywords: ActivityKeyword[],
  strictValidation: boolean = false
): CategorizedEntry[] {
  return entries.map((entry) => ({
    ...entry,
    category: categorizeActivity(
      entry.activity_name,
      entry.description,
      entry.project_name,
      keywords,
      strictValidation
    ),
  }))
}

/**
 * Activity summary by category
 */
export interface ActivitySummary {
  category: ActivityCategory
  totalHours: number
  entryCount: number
  percentage: number
}

/**
 * Get summary of hours by activity category
 *
 * @param categorizedEntries - Array of categorized entries
 * @returns Array of activity summaries
 */
export function getActivitySummary(
  categorizedEntries: CategorizedEntry[]
): ActivitySummary[] {
  const totalHours = categorizedEntries.reduce((sum, entry) => sum + entry.hours, 0)

  // Group by category
  const categoryHours = new Map<ActivityCategory, { hours: number; count: number }>()

  categorizedEntries.forEach((entry) => {
    const existing = categoryHours.get(entry.category)
    if (existing) {
      existing.hours += entry.hours
      existing.count++
    } else {
      categoryHours.set(entry.category, { hours: entry.hours, count: 1 })
    }
  })

  // Convert to summary array
  const summaries: ActivitySummary[] = []

  categoryHours.forEach((data, category) => {
    summaries.push({
      category,
      totalHours: parseFloat(data.hours.toFixed(2)),
      entryCount: data.count,
      percentage: totalHours > 0 ? parseFloat(((data.hours / totalHours) * 100).toFixed(1)) : 0,
    })
  })

  // Sort by total hours descending
  return summaries.sort((a, b) => b.totalHours - a.totalHours)
}

/**
 * Get unpaired (uncategorized) entries
 *
 * @param categorizedEntries - Array of categorized entries
 * @returns Array of unpaired entries
 */
export function getUnpairedEntries(categorizedEntries: CategorizedEntry[]): CategorizedEntry[] {
  return categorizedEntries.filter((entry) => entry.category === 'Unpaired')
}

/**
 * Calculate quality score (percentage of paired entries)
 *
 * @param categorizedEntries - Array of categorized entries
 * @returns Quality score as percentage (0-100)
 */
export function calculateQualityScore(categorizedEntries: CategorizedEntry[]): number {
  if (categorizedEntries.length === 0) {
    return 100
  }

  const unpairedCount = categorizedEntries.filter((e) => e.category === 'Unpaired').length
  const pairedCount = categorizedEntries.length - unpairedCount

  return parseFloat(((pairedCount / categorizedEntries.length) * 100).toFixed(1))
}
