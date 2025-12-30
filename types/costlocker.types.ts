/**
 * Costlocker API v2 Type Definitions
 *
 * These types represent the structure of data returned from the Costlocker API.
 * API Documentation: https://new.costlocker.com/api-public/v2/
 */

/**
 * Costlocker API Person
 * Represents a team member in the Costlocker system
 */
export interface CostlockerPerson {
  id: number
  name: string
  email?: string
  active: boolean
}

/**
 * Costlocker API Project
 * Represents a project in the Costlocker system
 */
export interface CostlockerProject {
  id: number
  name: string
  client?: {
    id: number
    name: string
  }
  archived: boolean
}

/**
 * Costlocker API Activity
 * Represents an activity/task within a project
 */
export interface CostlockerActivity {
  id: number
  name: string
  project: CostlockerProject
}

/**
 * Costlocker API Timesheet Entry
 * Represents a single time tracking entry
 */
export interface CostlockerTimesheetEntry {
  id: number
  person: CostlockerPerson
  activity: CostlockerActivity
  date: string // ISO date format YYYY-MM-DD
  hours: number
  description?: string
  approved: boolean
  billable: boolean
}

/**
 * Costlocker API Pagination Metadata
 * Information about paginated results
 */
export interface CostlockerPagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

/**
 * Costlocker API Paginated Response
 * Standard response format for paginated API endpoints
 */
export interface CostlockerPaginatedResponse<T> {
  data: T[]
  meta: {
    pagination: CostlockerPagination
  }
}

/**
 * Costlocker Timesheet API Response
 */
export type CostlockerTimesheetResponse = CostlockerPaginatedResponse<CostlockerTimesheetEntry>

/**
 * Costlocker API Error Response
 */
export interface CostlockerErrorResponse {
  error: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
}

/**
 * Internal Timesheet Entry
 * Our transformed data structure for internal use
 */
export interface TimesheetEntry {
  id: number
  personId: number
  personName: string
  personEmail: string | null
  projectId: number
  projectName: string
  projectCategory: ProjectCategory // Mapped from project name
  activityId: number
  activityName: string
  date: string // ISO date YYYY-MM-DD
  hours: number
  description: string | null
  approved: boolean
  billable: boolean
}

/**
 * Project Categories
 * Standardized project types based on project name mapping
 */
export type ProjectCategory =
  | 'Internal'
  | 'OPS'
  | 'R&D'
  | 'Guiding'
  | 'PR'
  | 'UX Maturity'
  | 'Other'

/**
 * Timesheet Data Query Parameters
 * Parameters for fetching timesheet data from Costlocker
 */
export interface TimesheetQueryParams {
  dateFrom: string // YYYY-MM-DD
  dateTo: string // YYYY-MM-DD
  personId?: number
  projectId?: number
  page?: number
  perPage?: number
}

/**
 * Activity Category
 * Categorization of activities for OPS work
 */
export type ActivityCategory =
  | 'OPS Hiring'
  | 'OPS Jobs'
  | 'OPS Reviews'
  | 'Unpaired'

/**
 * Activity Keyword
 * Keywords used to categorize activities
 */
export interface ActivityKeyword {
  id: string
  keyword: string
  category: ActivityCategory
  created_at: string
  updated_at: string
}
