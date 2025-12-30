import { calculateWorkingDays } from './working-days'

/**
 * Calculate FTE (Full-Time Equivalent) from tracked hours
 *
 * FTE is the ratio of tracked hours to expected working hours.
 * 1.0 FTE = worked full-time hours for the period
 *
 * @param trackedHours - Total hours tracked
 * @param workingHoursInPeriod - Expected working hours in the period
 * @returns FTE value rounded to 2 decimal places
 *
 * @example
 * const fte = calculateFTE(160, 160) // 1.00 FTE (full-time)
 * const fte = calculateFTE(80, 160)  // 0.50 FTE (half-time)
 * const fte = calculateFTE(180, 160) // 1.13 FTE (overtime)
 */
export function calculateFTE(
  trackedHours: number,
  workingHoursInPeriod: number
): number {
  if (workingHoursInPeriod === 0) {
    return 0
  }

  const fte = trackedHours / workingHoursInPeriod
  return parseFloat(fte.toFixed(2))
}

/**
 * Calculate FTE for a person for a specific month
 *
 * @param trackedHours - Hours tracked by the person in the month
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12)
 * @returns FTE value rounded to 2 decimal places
 */
export function calculateMonthlyFTE(
  trackedHours: number,
  year: number,
  month: number
): number {
  const { workingHours } = calculateWorkingDays(year, month)
  return calculateFTE(trackedHours, workingHours)
}

/**
 * Monthly FTE data for a person
 */
export interface PersonMonthlyFTE {
  personId: number
  personName: string
  year: number
  month: number
  trackedHours: number
  workingHours: number
  fte: number
  plannedFTE?: number
  deviation?: number // Percentage deviation from planned FTE
}

/**
 * Calculate FTE for multiple people for a specific month
 *
 * @param timesheetData - Array of timesheet entries
 * @param year - Year
 * @param month - Month (1-12)
 * @param plannedFTEs - Optional map of person_id to planned FTE
 * @returns Array of PersonMonthlyFTE
 */
export function calculateTeamMonthlyFTE(
  timesheetData: Array<{
    person_id: number
    person_name: string
    hours: number
    date: string
  }>,
  year: number,
  month: number,
  plannedFTEs?: Map<number, number>
): PersonMonthlyFTE[] {
  // Get working hours for the month
  const { workingHours } = calculateWorkingDays(year, month)

  // Group hours by person
  const personHours = new Map<number, { name: string; hours: number }>()

  timesheetData.forEach((entry) => {
    const entryDate = new Date(entry.date)
    if (entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month) {
      const existing = personHours.get(entry.person_id)
      if (existing) {
        existing.hours += entry.hours
      } else {
        personHours.set(entry.person_id, {
          name: entry.person_name,
          hours: entry.hours,
        })
      }
    }
  })

  // Calculate FTE for each person
  const results: PersonMonthlyFTE[] = []

  personHours.forEach((data, personId) => {
    const fte = calculateFTE(data.hours, workingHours)
    const plannedFTE = plannedFTEs?.get(personId)

    const result: PersonMonthlyFTE = {
      personId,
      personName: data.name,
      year,
      month,
      trackedHours: data.hours,
      workingHours,
      fte,
    }

    if (plannedFTE !== undefined) {
      result.plannedFTE = plannedFTE
      // Calculate deviation as percentage
      const deviation = plannedFTE > 0 ? ((fte - plannedFTE) / plannedFTE) * 100 : 0
      result.deviation = parseFloat(deviation.toFixed(1))
    }

    results.push(result)
  })

  return results.sort((a, b) => a.personName.localeCompare(b.personName))
}

/**
 * Calculate total team FTE for a month
 *
 * @param personFTEs - Array of PersonMonthlyFTE
 * @returns Total FTE for the team
 */
export function calculateTotalTeamFTE(personFTEs: PersonMonthlyFTE[]): number {
  const totalFTE = personFTEs.reduce((sum, person) => sum + person.fte, 0)
  return parseFloat(totalFTE.toFixed(2))
}

/**
 * FTE statistics for a period
 */
export interface FTEStats {
  totalFTE: number
  averageFTE: number
  highestFTE: number
  lowestFTE: number
  teamMemberCount: number
}

/**
 * Calculate FTE statistics for a period
 *
 * @param personFTEs - Array of PersonMonthlyFTE
 * @returns FTE statistics
 */
export function calculateFTEStats(personFTEs: PersonMonthlyFTE[]): FTEStats {
  if (personFTEs.length === 0) {
    return {
      totalFTE: 0,
      averageFTE: 0,
      highestFTE: 0,
      lowestFTE: 0,
      teamMemberCount: 0,
    }
  }

  const fteValues = personFTEs.map((p) => p.fte)
  const totalFTE = fteValues.reduce((sum, fte) => sum + fte, 0)
  const averageFTE = totalFTE / personFTEs.length

  return {
    totalFTE: parseFloat(totalFTE.toFixed(2)),
    averageFTE: parseFloat(averageFTE.toFixed(2)),
    highestFTE: Math.max(...fteValues),
    lowestFTE: Math.min(...fteValues),
    teamMemberCount: personFTEs.length,
  }
}
