import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  RawTimesheetRow,
  ParsedTimesheetRow,
  ValidationError,
  CSVParserOptions,
} from '@/types/upload.types'

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
    // Use raw: false to get formatted strings instead of Excel serial dates
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false, // Convert to formatted strings
      defval: '', // Use empty string for empty cells
      dateNF: 'd. m. yyyy', // Format dates as Czech format
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
  const normalized: Record<string, string | number | boolean | null | undefined> = {}
  Object.keys(raw).forEach((key) => {
    normalized[normalizeColumnName(key)] = raw[key]
  })

  // Helper to find value by multiple possible key names
  const findValue = (possibleKeys: string[]): string | number | boolean | null | undefined => {
    for (const key of possibleKeys) {
      const normalizedKey = normalizeColumnName(key)
      if (normalized[normalizedKey] !== undefined && normalized[normalizedKey] !== null) {
        return normalized[normalizedKey]
      }
    }
    return null
  }

  // Extract fields with flexible column name matching (includes Czech translations)
  const person_id = findValue(['person_id', 'personid', 'person', 'user_id', 'userid'])
  const person_name = findValue([
    'person_name', 'personname', 'person', 'name', 'user', 'username',
    'osoba' // Czech: Osoba
  ])
  const person_email = findValue(['person_email', 'personemail', 'email', 'user_email'])
  const project_id = findValue(['project_id', 'projectid'])
  const project_name = findValue([
    'project_name', 'projectname', 'project',
    'projekt' // Czech: Projekt
  ])
  // Client name is available in CSV but not currently used
  // findValue(['client_name', 'clientname', 'client', 'klient'])
  const activity_id = findValue(['activity_id', 'activityid'])
  const activity_name = findValue([
    'activity_name', 'activityname', 'activity', 'task', 'taskname',
    'cinnost', 'činnost' // Czech: Činnost
  ])
  const task_name = findValue([
    'task', 'task_name', 'taskname',
    'ukol', 'úkol' // Czech: Úkol
  ])
  const date = findValue([
    'date', 'day', 'start_at', 'startat',
    'datum' // Czech: Datum
  ])
  const hours = findValue([
    'hours', 'duration', 'time', 'hours_tracked',
    'natrackovano', 'natrackováno' // Czech: Natrackováno
  ])
  const description = findValue([
    'description', 'note', 'notes', 'comment', 'comments',
    'popis' // Czech: Popis
  ])
  const approved = findValue(['approved', 'status', 'is_approved'])
  const billable = findValue([
    'billable', 'is_billable', 'billing',
    'placene', 'placené' // Czech: Placené
  ])

  // Validate required fields (names, not IDs, since Costlocker doesn't export IDs)
  if (!person_name) {
    errors.push({ row: rowIndex, field: 'person_name', message: 'Person name is required' })
  }
  if (!project_name) {
    errors.push({ row: rowIndex, field: 'project_name', message: 'Project name is required' })
  }

  // Activity name can come from either activity_name or task_name
  const finalActivityName = activity_name || task_name
  if (!finalActivityName) {
    errors.push({ row: rowIndex, field: 'activity_name', message: 'Activity or Task name is required' })
  }

  if (!date) {
    errors.push({ row: rowIndex, field: 'date', message: 'Date is required' })
  }
  if (hours === null || hours === undefined || String(hours).trim() === '') {
    errors.push({ row: rowIndex, field: 'hours', message: 'Hours is required' })
  }

  // If validation errors, return early
  if (errors.length > 0) {
    return { data: null, errors }
  }

  // Generate IDs from names if not provided (Costlocker exports don't include IDs)
  const parsedPersonId = person_id ? parseInt(String(person_id), 10) : generateIdFromString(String(person_name))
  if (isNaN(parsedPersonId)) {
    errors.push({
      row: rowIndex,
      field: 'person_id',
      message: 'Person ID must be a number',
      value: person_id,
    })
  }

  const parsedProjectId = project_id ? parseInt(String(project_id), 10) : generateIdFromString(String(project_name))
  if (isNaN(parsedProjectId)) {
    errors.push({
      row: rowIndex,
      field: 'project_id',
      message: 'Project ID must be a number',
      value: project_id,
    })
  }

  const parsedActivityId = activity_id ? parseInt(String(activity_id), 10) : generateIdFromString(String(finalActivityName))
  if (isNaN(parsedActivityId)) {
    errors.push({
      row: rowIndex,
      field: 'activity_id',
      message: 'Activity ID must be a number',
      value: activity_id,
    })
  }

  // Parse hours (handle both comma and dot as decimal separator)
  const hoursStr = String(hours).replace(',', '.').trim()
  const parsedHours = parseFloat(hoursStr)
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
      message: 'Date must be in valid format (YYYY-MM-DD or DD. MM. YYYY)',
      value: date,
    })
  } else {
    // Additional validation: check year is reasonable (between 1900 and 2100)
    const year = parseInt(parsedDate.split('-')[0], 10)
    if (year < 1900 || year > 2100) {
      errors.push({
        row: rowIndex,
        field: 'date',
        message: `Invalid year in date: ${year}. Expected year between 1900-2100`,
        value: date,
      })
    }
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
    activity_name: String(finalActivityName),
    date: parsedDate!,
    hours: parsedHours,
    description: description ? String(description) : undefined,
    approved: approved ? parseBoolean(approved) : false,
    billable: billable ? parseBoolean(billable) : false,
  }

  return { data: parsed, errors: [] }
}

/**
 * Generate a numeric ID from a string using a simple hash
 * Ensures consistent IDs for the same string
 */
function generateIdFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Parse date string to YYYY-MM-DD format
 * Handles various date formats including Czech format (DD. MM. YYYY) and Excel serial dates
 */
function parseDate(dateStr: string): string | null {
  // Empty or null
  if (!dateStr || dateStr.trim() === '') {
    return null
  }

  const trimmed = String(dateStr).trim()

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  // Czech format: DD. MM. YYYY (e.g., "29. 11. 2025")
  const czechMatch = trimmed.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/)
  if (czechMatch) {
    const [, day, month, year] = czechMatch
    const paddedDay = day.padStart(2, '0')
    const paddedMonth = month.padStart(2, '0')
    return `${year}-${paddedMonth}-${paddedDay}`
  }

  // Excel serial date (number of days since 1900-01-01)
  // If it's a pure number, treat as Excel serial date
  const asNumber = parseFloat(trimmed)
  if (!isNaN(asNumber) && /^\d+(\.\d+)?$/.test(trimmed)) {
    try {
      // Excel serial date conversion
      // Excel's epoch starts at 1900-01-01 (but actually 1900-01-00 due to leap year bug)
      const excelEpoch = new Date(1899, 11, 30) // December 30, 1899
      const date = new Date(excelEpoch.getTime() + asNumber * 86400000)

      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        // Sanity check
        if (year >= 1900 && year <= 2100) {
          return date.toISOString().split('T')[0]
        }
      }
    } catch {
      // Fall through to try as regular date
    }
  }

  // Try parsing as Date
  try {
    const date = new Date(trimmed)
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear()
      // Sanity check
      if (year >= 1900 && year <= 2100) {
        return date.toISOString().split('T')[0]
      }
    }
  } catch {
    // Ignore
  }

  return null
}

/**
 * Parse boolean from various formats
 */
function parseBoolean(value: string | number | boolean | null | undefined): boolean {
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
