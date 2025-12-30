import {
  CostlockerTimesheetEntry,
  TimesheetEntry,
} from '@/types/costlocker.types'
import { mapProjectCategory } from '@/config/projects'

/**
 * Costlocker Data Transformer
 *
 * Transforms Costlocker API responses into our internal data structure.
 * Handles project name mapping and data normalization.
 */

/**
 * Transform a single Costlocker timesheet entry to internal format
 *
 * @param entry - Raw Costlocker API timesheet entry
 * @returns Transformed timesheet entry with mapped project category
 *
 * @example
 * ```typescript
 * const internal = transformTimesheetEntry(costlockerEntry)
 * console.log(internal.projectCategory) // 'OPS'
 * ```
 */
export function transformTimesheetEntry(
  entry: CostlockerTimesheetEntry
): TimesheetEntry {
  return {
    id: entry.id,
    personId: entry.person.id,
    personName: entry.person.name,
    personEmail: entry.person.email || null,
    projectId: entry.activity.project.id,
    projectName: entry.activity.project.name,
    projectCategory: mapProjectCategory(entry.activity.project.name),
    activityId: entry.activity.id,
    activityName: entry.activity.name,
    date: entry.date,
    hours: entry.hours,
    description: entry.description || null,
    approved: entry.approved,
    billable: entry.billable,
  }
}

/**
 * Transform an array of Costlocker timesheet entries
 *
 * @param entries - Array of raw Costlocker API timesheet entries
 * @returns Array of transformed timesheet entries
 *
 * @example
 * ```typescript
 * const costlockerData = await fetchTimesheetData({ ... })
 * const transformedData = transformTimesheetEntries(costlockerData)
 * ```
 */
export function transformTimesheetEntries(
  entries: CostlockerTimesheetEntry[]
): TimesheetEntry[] {
  return entries.map(transformTimesheetEntry)
}

/**
 * Group timesheet entries by person
 *
 * @param entries - Array of timesheet entries
 * @returns Map of person ID to their timesheet entries
 *
 * @example
 * ```typescript
 * const grouped = groupByPerson(entries)
 * const personEntries = grouped.get(123) // All entries for person ID 123
 * ```
 */
export function groupByPerson(
  entries: TimesheetEntry[]
): Map<number, TimesheetEntry[]> {
  const grouped = new Map<number, TimesheetEntry[]>()

  for (const entry of entries) {
    const existing = grouped.get(entry.personId) || []
    existing.push(entry)
    grouped.set(entry.personId, existing)
  }

  return grouped
}

/**
 * Group timesheet entries by project category
 *
 * @param entries - Array of timesheet entries
 * @returns Map of project category to their timesheet entries
 *
 * @example
 * ```typescript
 * const grouped = groupByProjectCategory(entries)
 * const opsEntries = grouped.get('OPS') // All OPS entries
 * ```
 */
export function groupByProjectCategory(
  entries: TimesheetEntry[]
): Map<string, TimesheetEntry[]> {
  const grouped = new Map<string, TimesheetEntry[]>()

  for (const entry of entries) {
    const existing = grouped.get(entry.projectCategory) || []
    existing.push(entry)
    grouped.set(entry.projectCategory, existing)
  }

  return grouped
}

/**
 * Group timesheet entries by date
 *
 * @param entries - Array of timesheet entries
 * @returns Map of date (YYYY-MM-DD) to their timesheet entries
 *
 * @example
 * ```typescript
 * const grouped = groupByDate(entries)
 * const dayEntries = grouped.get('2025-01-15') // All entries for Jan 15
 * ```
 */
export function groupByDate(
  entries: TimesheetEntry[]
): Map<string, TimesheetEntry[]> {
  const grouped = new Map<string, TimesheetEntry[]>()

  for (const entry of entries) {
    const existing = grouped.get(entry.date) || []
    existing.push(entry)
    grouped.set(entry.date, existing)
  }

  return grouped
}

/**
 * Calculate total hours from timesheet entries
 *
 * @param entries - Array of timesheet entries
 * @returns Total hours as a number
 *
 * @example
 * ```typescript
 * const total = calculateTotalHours(entries)
 * console.log(`Total: ${total} hours`)
 * ```
 */
export function calculateTotalHours(entries: TimesheetEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.hours, 0)
}

/**
 * Calculate total hours by person
 *
 * @param entries - Array of timesheet entries
 * @returns Map of person ID to total hours
 *
 * @example
 * ```typescript
 * const totals = calculateHoursByPerson(entries)
 * const personHours = totals.get(123) // Total hours for person ID 123
 * ```
 */
export function calculateHoursByPerson(
  entries: TimesheetEntry[]
): Map<number, number> {
  const totals = new Map<number, number>()

  for (const entry of entries) {
    const current = totals.get(entry.personId) || 0
    totals.set(entry.personId, current + entry.hours)
  }

  return totals
}

/**
 * Calculate total hours by project category
 *
 * @param entries - Array of timesheet entries
 * @returns Map of project category to total hours
 *
 * @example
 * ```typescript
 * const totals = calculateHoursByCategory(entries)
 * const opsHours = totals.get('OPS') // Total OPS hours
 * ```
 */
export function calculateHoursByCategory(
  entries: TimesheetEntry[]
): Map<string, number> {
  const totals = new Map<string, number>()

  for (const entry of entries) {
    const current = totals.get(entry.projectCategory) || 0
    totals.set(entry.projectCategory, current + entry.hours)
  }

  return totals
}

/**
 * Filter entries by project category
 *
 * @param entries - Array of timesheet entries
 * @param category - Project category to filter by
 * @returns Filtered array of entries
 *
 * @example
 * ```typescript
 * const opsEntries = filterByCategory(entries, 'OPS')
 * ```
 */
export function filterByCategory(
  entries: TimesheetEntry[],
  category: string
): TimesheetEntry[] {
  return entries.filter((entry) => entry.projectCategory === category)
}

/**
 * Filter entries by person
 *
 * @param entries - Array of timesheet entries
 * @param personId - Person ID to filter by
 * @returns Filtered array of entries
 *
 * @example
 * ```typescript
 * const personEntries = filterByPerson(entries, 123)
 * ```
 */
export function filterByPerson(
  entries: TimesheetEntry[],
  personId: number
): TimesheetEntry[] {
  return entries.filter((entry) => entry.personId === personId)
}

/**
 * Filter entries by date range
 *
 * @param entries - Array of timesheet entries
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Filtered array of entries
 *
 * @example
 * ```typescript
 * const rangeEntries = filterByDateRange(entries, '2025-01-01', '2025-01-31')
 * ```
 */
export function filterByDateRange(
  entries: TimesheetEntry[],
  startDate: string,
  endDate: string
): TimesheetEntry[] {
  return entries.filter(
    (entry) => entry.date >= startDate && entry.date <= endDate
  )
}
