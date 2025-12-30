import {
  CostlockerTimesheetResponse,
  CostlockerTimesheetEntry,
  CostlockerErrorResponse,
  TimesheetQueryParams,
} from '@/types/costlocker.types'

/**
 * Costlocker API Client
 *
 * Handles communication with the Costlocker API v2
 * Uses Basic Authentication with API token
 * Implements pagination for large datasets
 */

const COSTLOCKER_API_URL =
  process.env.COSTLOCKER_API_URL || 'https://new.costlocker.com/api-public/v2/'
const COSTLOCKER_API_TOKEN = process.env.COSTLOCKER_API_TOKEN

/**
 * Costlocker API Error
 * Custom error class for API-specific errors
 */
export class CostlockerAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: CostlockerErrorResponse
  ) {
    super(message)
    this.name = 'CostlockerAPIError'
  }
}

/**
 * Get Basic Auth header value
 * Costlocker uses Basic Auth with the API token as username (no password)
 */
function getAuthHeader(): string {
  if (!COSTLOCKER_API_TOKEN) {
    throw new Error(
      'COSTLOCKER_API_TOKEN is not configured in environment variables'
    )
  }

  // Basic Auth format: "username:password" base64 encoded
  // Costlocker uses token as username with empty password
  const credentials = `${COSTLOCKER_API_TOKEN}:`
  const encoded = Buffer.from(credentials).toString('base64')
  return `Basic ${encoded}`
}

/**
 * Make a GET request to the Costlocker API
 *
 * @param endpoint - API endpoint path (e.g., 'timeentries')
 * @param params - Query parameters
 * @returns Parsed JSON response
 * @throws CostlockerAPIError on API errors
 */
async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  // Build URL with query parameters
  const url = new URL(endpoint, COSTLOCKER_API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 },
    })

    // Check for HTTP errors
    if (!response.ok) {
      let errorData: CostlockerErrorResponse | undefined

      try {
        errorData = await response.json()
      } catch {
        // If response is not JSON, use status text
      }

      throw new CostlockerAPIError(
        errorData?.error?.message ||
          `Costlocker API error: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    // Parse and return JSON response
    return await response.json()
  } catch (error) {
    // Re-throw CostlockerAPIError as-is
    if (error instanceof CostlockerAPIError) {
      throw error
    }

    // Wrap other errors
    throw new CostlockerAPIError(
      `Failed to fetch from Costlocker API: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * Fetch timesheet data from Costlocker API
 *
 * Automatically handles pagination to fetch all entries within date range.
 * Maximum 100 entries per page (Costlocker API limit).
 *
 * @param params - Query parameters for filtering timesheet data
 * @returns Array of all timesheet entries matching the criteria
 * @throws CostlockerAPIError on API errors
 *
 * @example
 * ```typescript
 * const entries = await fetchTimesheetData({
 *   dateFrom: '2025-01-01',
 *   dateTo: '2025-01-31',
 * })
 * ```
 */
export async function fetchTimesheetData(
  params: TimesheetQueryParams
): Promise<CostlockerTimesheetEntry[]> {
  const allEntries: CostlockerTimesheetEntry[] = []
  let currentPage = params.page || 1
  const perPage = Math.min(params.perPage || 100, 100) // Max 100 per page
  let hasMorePages = true

  console.log(
    `[Costlocker] Fetching timesheet data from ${params.dateFrom} to ${params.dateTo}`
  )

  while (hasMorePages) {
    // Build query parameters
    const queryParams: Record<string, string | number | boolean> = {
      date_from: params.dateFrom,
      date_to: params.dateTo,
      page: currentPage,
      per_page: perPage,
    }

    // Add optional filters
    if (params.personId) {
      queryParams.person_id = params.personId
    }
    if (params.projectId) {
      queryParams.project_id = params.projectId
    }

    // Fetch page
    const response = await apiGet<CostlockerTimesheetResponse>(
      'timeentries',
      queryParams
    )

    // Add entries from this page
    allEntries.push(...response.data)

    console.log(
      `[Costlocker] Page ${currentPage}/${response.meta.pagination.total_pages}: ` +
        `${response.data.length} entries (${allEntries.length}/${response.meta.pagination.total} total)`
    )

    // Check if there are more pages
    const pagination = response.meta.pagination
    hasMorePages = currentPage < pagination.total_pages

    // If we're fetching a specific page (user requested), don't auto-paginate
    if (params.page) {
      hasMorePages = false
    }

    currentPage++

    // Safety check: prevent infinite loops
    if (currentPage > 1000) {
      console.warn(
        '[Costlocker] Pagination limit reached (1000 pages). Stopping.'
      )
      break
    }
  }

  console.log(
    `[Costlocker] Fetched ${allEntries.length} total timesheet entries`
  )

  return allEntries
}

/**
 * Fetch a single page of timesheet data
 * Useful for testing or when you need to control pagination manually
 *
 * @param params - Query parameters
 * @returns Paginated response with metadata
 * @throws CostlockerAPIError on API errors
 */
export async function fetchTimesheetDataPage(
  params: TimesheetQueryParams
): Promise<CostlockerTimesheetResponse> {
  const queryParams: Record<string, string | number | boolean> = {
    date_from: params.dateFrom,
    date_to: params.dateTo,
    page: params.page || 1,
    per_page: Math.min(params.perPage || 100, 100),
  }

  if (params.personId) {
    queryParams.person_id = params.personId
  }
  if (params.projectId) {
    queryParams.project_id = params.projectId
  }

  return await apiGet<CostlockerTimesheetResponse>('timeentries', queryParams)
}

/**
 * Test Costlocker API connection
 * Verifies that API credentials are valid and the API is accessible
 *
 * @returns True if connection is successful
 * @throws CostlockerAPIError if connection fails
 */
export async function testCostlockerConnection(): Promise<boolean> {
  try {
    // Fetch a small amount of data to test the connection
    const today = new Date().toISOString().split('T')[0]
    await apiGet<CostlockerTimesheetResponse>('timeentries', {
      date_from: today,
      date_to: today,
      per_page: 1,
    })

    console.log('[Costlocker] API connection test successful')
    return true
  } catch (error) {
    console.error('[Costlocker] API connection test failed:', error)
    throw error
  }
}
