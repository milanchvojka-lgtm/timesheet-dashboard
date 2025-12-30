/**
 * Activity categories for timesheet entries
 */
export type ActivityCategory =
  | 'OPS_Hiring'
  | 'OPS_Jobs'
  | 'OPS_Reviews'
  | 'OPS_Guiding'
  | 'Unpaired'

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
 * @param activityName - Activity/task name
 * @param description - Activity description (optional)
 * @param projectName - Project name (for Guiding detection)
 * @param keywords - Array of activity keywords from database
 * @returns Category of the activity
 *
 * @example
 * categorizeActivity('Interview', 'Interview with candidate', keywords)
 * // Returns: 'OPS_Hiring'
 *
 * categorizeActivity('Jobs', 'Update job postings', keywords)
 * // Returns: 'OPS_Jobs'
 */
export function categorizeActivity(
  activityName: string,
  description: string | null,
  projectName: string,
  keywords: ActivityKeyword[]
): ActivityCategory {
  // Combine activity name and description for matching
  const searchText = `${activityName} ${description || ''}`.toLowerCase()

  // Check project name for Guiding
  if (projectName.toLowerCase().includes('guiding')) {
    return 'OPS_Guiding'
  }

  // Group keywords by category
  const categorizedKeywords = {
    OPS_Hiring: keywords.filter((k) => k.category === 'OPS_Hiring').map((k) => k.keyword.toLowerCase()),
    OPS_Jobs: keywords.filter((k) => k.category === 'OPS_Jobs').map((k) => k.keyword.toLowerCase()),
    OPS_Reviews: keywords.filter((k) => k.category === 'OPS_Reviews').map((k) => k.keyword.toLowerCase()),
  }

  // Check for hiring keywords
  for (const keyword of categorizedKeywords.OPS_Hiring) {
    if (searchText.includes(keyword)) {
      return 'OPS_Hiring'
    }
  }

  // Check for jobs keywords
  for (const keyword of categorizedKeywords.OPS_Jobs) {
    if (searchText.includes(keyword)) {
      return 'OPS_Jobs'
    }
  }

  // Check for reviews keywords
  for (const keyword of categorizedKeywords.OPS_Reviews) {
    if (searchText.includes(keyword)) {
      return 'OPS_Reviews'
    }
  }

  // No match found
  return 'Unpaired'
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
  keywords: ActivityKeyword[]
): CategorizedEntry[] {
  return entries.map((entry) => ({
    ...entry,
    category: categorizeActivity(
      entry.activity_name,
      entry.description,
      entry.project_name,
      keywords
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
