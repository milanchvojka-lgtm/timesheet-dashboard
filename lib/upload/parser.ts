import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  RawTimesheetRow,
  ParsedTimesheetRow,
  ValidationError,
  CSVParserOptions,
} from '@/types/upload.types'
import { mapProjectCategory } from '@/config/projects'

/**
 * Parse CSV file to array of objects
 */
export async function parseCSV(
  file: File,
  options: CSVParserOptions = {}
): Promise<RawTimesheetRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: options.skip_empty_lines ?? true,
      transformHeader: options.trim_headers
        ? (header) => header.trim()
        : undefined,
      complete: (results) => {
        resolve(results.data as RawTimesheetRow[])
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`))
      },
    })
  })
}

/**
 * Parse Excel file to array of objects
 * Works on both server and client side using arrayBuffer
 */
export async function parseExcel(file: File): Promise<RawTimesheetRow[]> {
  try {
    // Read file as ArrayBuffer (works on both server and client)
    const arrayBuffer = await file.arrayBuffer()

    // Parse with XLSX
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    // Get first sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      throw new Error('Excel file has no sheets')
    }

    const sheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false, // Keep as strings for consistency
      defval: null, // Use null for empty cells
    }) as RawTimesheetRow[]

    return jsonData
  } catch (error) {
    throw new Error(
      `Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Auto-detect and parse file based on extension
 */
export async function parseFile(file: File): Promise<RawTimesheetRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return parseCSV(file)
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file)
  } else {
    throw new Error(`Unsupported file type: ${extension}`)
  }
}

/**
 * Normalize column names (remove spaces, special chars, lowercase)
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Map raw row to parsed timesheet row
 * Handles different column name variations from Costlocker
 */
export function mapRawRow(
  raw: RawTimesheetRow,
  rowIndex: number
): { data: ParsedTimesheetRow | null; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  // Normalize all keys
  const normalized: Record<string, any> = {}
  Object.keys(raw).forEach((key) => {
    normalized[normalizeColumnName(key)] = raw[key]
  })

  // Helper to find value by multiple possible key names
  const findValue = (possibleKeys: string[]): any => {
    for (const key of possibleKeys) {
      const normalizedKey = normalizeColumnName(key)
      if (normalized[normalizedKey] !== undefined && normalized[normalizedKey] !== null) {
        return normalized[normalizedKey]
      }
    }
    return null
  }

  // Extract fields with flexible column name matching
  const person_id = findValue(['person_id', 'personid', 'person', 'user_id', 'userid'])
  const person_name = findValue(['person_name', 'personname', 'person', 'name', 'user', 'username'])
  const person_email = findValue(['person_email', 'personemail', 'email', 'user_email'])
  const project_id = findValue(['project_id', 'projectid', 'project'])
  const project_name = findValue(['project_name', 'projectname', 'project'])
  const activity_id = findValue(['activity_id', 'activityid', 'activity', 'task_id'])
  const activity_name = findValue(['activity_name', 'activityname', 'activity', 'task', 'taskname'])
  const date = findValue(['date', 'day', 'start_at', 'startat'])
  const hours = findValue(['hours', 'duration', 'time', 'hours_tracked'])
  const description = findValue(['description', 'note', 'notes', 'comment', 'comments'])
  const approved = findValue(['approved', 'status', 'is_approved'])
  const billable = findValue(['billable', 'is_billable', 'billing'])

  // Validate required fields
  if (!person_id) {
    errors.push({ row: rowIndex, field: 'person_id', message: 'Person ID is required' })
  }
  if (!person_name) {
    errors.push({ row: rowIndex, field: 'person_name', message: 'Person name is required' })
  }
  if (!project_id) {
    errors.push({ row: rowIndex, field: 'project_id', message: 'Project ID is required' })
  }
  if (!project_name) {
    errors.push({ row: rowIndex, field: 'project_name', message: 'Project name is required' })
  }
  if (!activity_id) {
    errors.push({ row: rowIndex, field: 'activity_id', message: 'Activity ID is required' })
  }
  if (!activity_name) {
    errors.push({ row: rowIndex, field: 'activity_name', message: 'Activity name is required' })
  }
  if (!date) {
    errors.push({ row: rowIndex, field: 'date', message: 'Date is required' })
  }
  if (hours === null || hours === undefined) {
    errors.push({ row: rowIndex, field: 'hours', message: 'Hours is required' })
  }

  // If validation errors, return early
  if (errors.length > 0) {
    return { data: null, errors }
  }

  // Parse and validate data types
  const parsedPersonId = parseInt(String(person_id), 10)
  if (isNaN(parsedPersonId)) {
    errors.push({
      row: rowIndex,
      field: 'person_id',
      message: 'Person ID must be a number',
      value: person_id,
    })
  }

  const parsedProjectId = parseInt(String(project_id), 10)
  if (isNaN(parsedProjectId)) {
    errors.push({
      row: rowIndex,
      field: 'project_id',
      message: 'Project ID must be a number',
      value: project_id,
    })
  }

  const parsedActivityId = parseInt(String(activity_id), 10)
  if (isNaN(parsedActivityId)) {
    errors.push({
      row: rowIndex,
      field: 'activity_id',
      message: 'Activity ID must be a number',
      value: activity_id,
    })
  }

  const parsedHours = parseFloat(String(hours))
  if (isNaN(parsedHours) || parsedHours < 0) {
    errors.push({
      row: rowIndex,
      field: 'hours',
      message: 'Hours must be a positive number',
      value: hours,
    })
  }

  // Validate and normalize date (YYYY-MM-DD format)
  const parsedDate = parseDate(String(date))
  if (!parsedDate) {
    errors.push({
      row: rowIndex,
      field: 'date',
      message: 'Date must be in YYYY-MM-DD format',
      value: date,
    })
  }

  if (errors.length > 0) {
    return { data: null, errors }
  }

  // Build parsed row
  const parsed: ParsedTimesheetRow = {
    person_id: parsedPersonId,
    person_name: String(person_name),
    person_email: person_email ? String(person_email) : undefined,
    project_id: parsedProjectId,
    project_name: String(project_name),
    activity_id: parsedActivityId,
    activity_name: String(activity_name),
    date: parsedDate!,
    hours: parsedHours,
    description: description ? String(description) : undefined,
    approved: approved ? parseBoolean(approved) : false,
    billable: billable ? parseBoolean(billable) : false,
  }

  return { data: parsed, errors: [] }
}

/**
 * Parse date string to YYYY-MM-DD format
 * Handles various date formats
 */
function parseDate(dateStr: string): string | null {
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }

  // Try parsing as Date
  const date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }

  return null
}

/**
 * Parse boolean from various formats
 */
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim()
    return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'approved'
  }
  if (typeof value === 'number') {
    return value === 1
  }
  return false
}

/**
 * Parse entire file and map all rows
 */
export async function parseAndMapFile(file: File): Promise<{
  data: ParsedTimesheetRow[]
  errors: ValidationError[]
  totalRows: number
}> {
  // Parse file
  const rawRows = await parseFile(file)
  const totalRows = rawRows.length

  // Map each row
  const data: ParsedTimesheetRow[] = []
  const errors: ValidationError[] = []

  rawRows.forEach((raw, index) => {
    const result = mapRawRow(raw, index + 1) // 1-indexed for user display
    if (result.data) {
      data.push(result.data)
    }
    errors.push(...result.errors)
  })

  return { data, errors, totalRows }
}
