import Holidays from 'date-holidays'

/**
 * Working days calculation result
 */
export interface WorkingDaysResult {
  /** Total number of days in the month */
  totalDays: number
  /** Number of weekdays (Mon-Fri) in the month */
  weekdays: number
  /** Czech public holidays that fall on weekdays in this month */
  holidays: Array<{ name: string; date: string }>
  /** Number of working days (weekdays - holidays) */
  workingDays: number
  /** Number of working hours (working days * 8) */
  workingHours: number
}

/**
 * Calculate working days and hours for a given month and year
 * Takes into account Czech public holidays
 *
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12, where 1 = January)
 * @returns Working days calculation result
 *
 * @example
 * const result = calculateWorkingDays(2025, 11) // November 2025
 * console.log(result.workingDays) // e.g., 20
 * console.log(result.workingHours) // e.g., 160
 */
export function calculateWorkingDays(year: number, month: number): WorkingDaysResult {
  // Initialize Czech holidays
  const hd = new Holidays('CZ')

  // Get first and last day of the month
  const lastDay = new Date(year, month, 0) // Day 0 = last day of previous month
  const totalDays = lastDay.getDate()

  let weekdays = 0
  const monthHolidays: Array<{ name: string; date: string }> = []

  // Get all Czech holidays for this year
  const yearHolidays = hd.getHolidays(year)
  const holidayMap = new Map(
    yearHolidays.map((h) => [
      h.date.split(' ')[0], // Format: "YYYY-MM-DD HH:MM:SS"
      h.name
    ])
  )

  // Iterate through each day of the month
  for (let day = 1; day <= totalDays; day++) {
    // Use UTC to avoid timezone shifting
    const date = new Date(Date.UTC(year, month - 1, day))
    const dayOfWeek = date.getUTCDay() // 0 = Sunday, 6 = Saturday

    // Check if it's a weekday (Monday = 1, Friday = 5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekdays++

      // Check if this weekday is a public holiday
      const dateStr = date.toISOString().split('T')[0]
      const holidayName = holidayMap.get(dateStr)
      if (holidayName) {
        monthHolidays.push({ name: holidayName, date: dateStr })
      }
    }
  }

  const workingDays = weekdays - monthHolidays.length
  const workingHours = workingDays * 8 // Standard 8-hour workday

  return {
    totalDays,
    weekdays,
    holidays: monthHolidays,
    workingDays,
    workingHours,
  }
}

/**
 * Get working hours for a date range
 *
 * @param dateFrom - Start date (YYYY-MM-DD)
 * @param dateTo - End date (YYYY-MM-DD)
 * @returns Total working hours for the period
 */
export function getWorkingHoursForPeriod(dateFrom: string, dateTo: string): number {
  const start = new Date(dateFrom)
  const end = new Date(dateTo)

  let totalWorkingHours = 0

  // Iterate through each month in the range
  let currentYear = start.getFullYear()
  let currentMonth = start.getMonth() + 1

  while (
    currentYear < end.getFullYear() ||
    (currentYear === end.getFullYear() && currentMonth <= end.getMonth() + 1)
  ) {
    const result = calculateWorkingDays(currentYear, currentMonth)
    totalWorkingHours += result.workingHours

    // Move to next month
    currentMonth++
    if (currentMonth > 12) {
      currentMonth = 1
      currentYear++
    }
  }

  return totalWorkingHours
}

/**
 * Get list of Czech public holidays for a given year
 *
 * @param year - Year (e.g., 2025)
 * @returns Array of holiday objects with name and date
 */
export function getCzechHolidays(year: number) {
  const hd = new Holidays('CZ')
  const holidays = hd.getHolidays(year)

  return holidays.map((h) => ({
    name: h.name,
    date: h.date.split(' ')[0], // Extract YYYY-MM-DD
    type: h.type,
  }))
}
