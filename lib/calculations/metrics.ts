import { calculateTeamMonthlyFTE, calculateFTEStats, PersonMonthlyFTE } from './fte'
import { categorizeTimesheet, getActivitySummary, CategorizedEntry } from './activity-pairing'
import { mapProjectCategory } from '@/config/projects'

/**
 * Dashboard metrics for overview
 */
export interface DashboardMetrics {
  highestFTE: number
  highestFTEPerson: string
  lowestFTE: number
  lowestFTEPerson: string
  averageFTE: number
  totalTeamFTE: number
  teamMemberCount: number
}

/**
 * Calculate dashboard metrics from FTE data
 *
 * @param personFTEs - Array of PersonMonthlyFTE
 * @returns Dashboard metrics
 */
export function calculateDashboardMetrics(personFTEs: PersonMonthlyFTE[]): DashboardMetrics {
  if (personFTEs.length === 0) {
    return {
      highestFTE: 0,
      highestFTEPerson: 'N/A',
      lowestFTE: 0,
      lowestFTEPerson: 'N/A',
      averageFTE: 0,
      totalTeamFTE: 0,
      teamMemberCount: 0,
    }
  }

  const stats = calculateFTEStats(personFTEs)

  // Find person with highest and lowest FTE
  const highestPerson = personFTEs.reduce((max, person) =>
    person.fte > max.fte ? person : max
  )

  const lowestPerson = personFTEs.reduce((min, person) =>
    person.fte < min.fte ? person : min
  )

  return {
    highestFTE: stats.highestFTE,
    highestFTEPerson: highestPerson.personName,
    lowestFTE: stats.lowestFTE,
    lowestFTEPerson: lowestPerson.personName,
    averageFTE: stats.averageFTE,
    totalTeamFTE: stats.totalFTE,
    teamMemberCount: stats.teamMemberCount,
  }
}

/**
 * Project metrics
 */
export interface ProjectMetrics {
  projectCategory: string
  projectName: string
  totalHours: number
  fte: number
  entryCount: number
  personCount: number
  percentage: number
}

/**
 * Calculate metrics per project
 *
 * @param entries - Array of timesheet entries
 * @param workingHours - Working hours in the period
 * @returns Array of project metrics
 */
export function calculateProjectMetrics(
  entries: Array<{
    project_id: number
    project_name: string
    person_id: number
    hours: number
  }>,
  workingHours: number
): ProjectMetrics[] {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)

  // Group by project
  const projectData = new Map<string, {
    category: string
    hours: number
    entryCount: number
    people: Set<number>
  }>()

  entries.forEach((entry) => {
    const category = mapProjectCategory(entry.project_name)
    const existing = projectData.get(category)

    if (existing) {
      existing.hours += entry.hours
      existing.entryCount++
      existing.people.add(entry.person_id)
    } else {
      projectData.set(category, {
        category,
        hours: entry.hours,
        entryCount: 1,
        people: new Set([entry.person_id]),
      })
    }
  })

  // Convert to metrics array
  const metrics: ProjectMetrics[] = []

  projectData.forEach((data, projectName) => {
    metrics.push({
      projectCategory: data.category,
      projectName: projectName,
      totalHours: parseFloat(data.hours.toFixed(2)),
      fte: parseFloat((data.hours / workingHours).toFixed(2)),
      entryCount: data.entryCount,
      personCount: data.people.size,
      percentage: totalHours > 0 ? parseFloat(((data.hours / totalHours) * 100).toFixed(1)) : 0,
    })
  })

  // Sort by total hours descending
  return metrics.sort((a, b) => b.totalHours - a.totalHours)
}

/**
 * Activity metrics by category
 */
export interface ActivityMetrics {
  category: string
  totalHours: number
  entryCount: number
  personCount: number
  percentage: number
}

/**
 * Calculate metrics per activity category
 *
 * @param categorizedEntries - Array of categorized entries
 * @returns Array of activity metrics
 */
export function calculateActivityMetrics(
  categorizedEntries: CategorizedEntry[]
): ActivityMetrics[] {
  const totalHours = categorizedEntries.reduce((sum, entry) => sum + entry.hours, 0)

  // Group by category
  const categoryData = new Map<string, {
    hours: number
    entryCount: number
    people: Set<number>
  }>()

  categorizedEntries.forEach((entry) => {
    const existing = categoryData.get(entry.category)

    if (existing) {
      existing.hours += entry.hours
      existing.entryCount++
      existing.people.add(entry.person_id)
    } else {
      categoryData.set(entry.category, {
        hours: entry.hours,
        entryCount: 1,
        people: new Set([entry.person_id]),
      })
    }
  })

  // Convert to metrics array
  const metrics: ActivityMetrics[] = []

  categoryData.forEach((data, category) => {
    metrics.push({
      category,
      totalHours: parseFloat(data.hours.toFixed(2)),
      entryCount: data.entryCount,
      personCount: data.people.size,
      percentage: totalHours > 0 ? parseFloat(((data.hours / totalHours) * 100).toFixed(1)) : 0,
    })
  })

  // Sort by total hours descending
  return metrics.sort((a, b) => b.totalHours - a.totalHours)
}

/**
 * Time series data point
 */
export interface TimeSeriesData {
  date: string // YYYY-MM-DD or YYYY-MM
  value: number
  label?: string
}

/**
 * Generate monthly time series for FTE evolution
 *
 * @param entries - Array of timesheet entries
 * @param keywords - Activity keywords for categorization
 * @returns Array of time series data
 */
export function generateMonthlyFTESeries(
  entries: Array<{
    person_id: number
    person_name: string
    hours: number
    date: string
  }>,
  startMonth: string, // YYYY-MM
  endMonth: string    // YYYY-MM
): TimeSeriesData[] {
  // Implementation would group by month and calculate FTE
  // This is a simplified placeholder
  return []
}

/**
 * Get data for a specific month
 *
 * @param entries - All timesheet entries
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Filtered entries for the month
 */
export function getMonthData<T extends { date: string }>(
  entries: T[],
  year: number,
  month: number
): T[] {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month
  })
}

/**
 * Get data for a date range
 *
 * @param entries - All timesheet entries
 * @param dateFrom - Start date (YYYY-MM-DD)
 * @param dateTo - End date (YYYY-MM-DD)
 * @returns Filtered entries for the range
 */
export function getDateRangeData<T extends { date: string }>(
  entries: T[],
  dateFrom: string,
  dateTo: string
): T[] {
  const start = new Date(dateFrom)
  const end = new Date(dateTo)

  return entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate >= start && entryDate <= end
  })
}
