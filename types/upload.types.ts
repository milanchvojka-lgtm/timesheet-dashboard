/**
 * Upload System Type Definitions
 *
 * Types for CSV/Excel file uploads and timesheet data import
 */

/**
 * Upload History Record
 * Tracks file uploads and import status
 */
export interface UploadHistory {
  id: string
  filename: string
  file_size: number
  file_type: 'csv' | 'xlsx'
  uploaded_by_email: string
  uploaded_by_name: string | null
  total_rows: number
  successful_rows: number
  failed_rows: number
  skipped_rows: number
  data_date_from: string | null // ISO date
  data_date_to: string | null // ISO date
  status: 'processing' | 'completed' | 'failed' | 'partial'
  error_message: string | null
  validation_errors: ValidationError[] | null
  created_at: string
  completed_at: string | null
}

/**
 * Timesheet Entry Record
 * Stored in database after successful import
 */
export interface TimesheetEntry {
  id: string
  person_id: number
  person_name: string
  person_email: string | null
  project_id: number
  project_name: string
  project_category: string
  activity_id: number
  activity_name: string
  date: string // ISO date YYYY-MM-DD
  hours: number
  description: string | null
  approved: boolean
  billable: boolean
  upload_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Raw CSV/Excel Row
 * Data as parsed from uploaded file before transformation
 */
export interface RawTimesheetRow {
  [key: string]: string | number | boolean | null
}

/**
 * Parsed Timesheet Row
 * Data after initial parsing and field mapping
 */
export interface ParsedTimesheetRow {
  person_id: number
  person_name: string
  person_email?: string
  project_id: number
  project_name: string
  activity_id: number
  activity_name: string
  date: string // YYYY-MM-DD
  hours: number
  description?: string
  approved?: boolean
  billable?: boolean
}

/**
 * Validation Error
 * Describes a data validation issue
 */
export interface ValidationError {
  row: number
  field?: string
  message: string
  value?: unknown
}

/**
 * Upload Result
 * Summary of upload and import operation
 */
export interface UploadResult {
  success: boolean
  upload_id: string
  total_rows: number
  successful_rows: number
  failed_rows: number
  skipped_rows: number
  validation_errors: ValidationError[]
  data_date_from: string | null
  data_date_to: string | null
}

/**
 * File Upload Request
 * Metadata sent with file upload
 */
export interface FileUploadRequest {
  file: File
  replace_existing?: boolean // Replace data for same date range
}

/**
 * Costlocker CSV Column Mapping
 * Expected column names from Costlocker export
 */
export interface CostlockerCSVColumns {
  person_id: string // e.g., "Person ID", "person_id"
  person_name: string // e.g., "Person Name", "person"
  person_email: string // e.g., "Person Email", "email"
  project_id: string // e.g., "Project ID", "project_id"
  project_name: string // e.g., "Project Name", "project"
  activity_id: string // e.g., "Activity ID", "activity_id"
  activity_name: string // e.g., "Activity Name", "activity"
  date: string // e.g., "Date", "date"
  hours: string // e.g., "Hours", "duration", "time"
  description: string // e.g., "Description", "note", "comment"
  approved: string // e.g., "Approved", "status"
  billable: string // e.g., "Billable", "is_billable"
}

/**
 * CSV Parser Options
 */
export interface CSVParserOptions {
  delimiter?: string // Default: auto-detect
  skip_empty_lines?: boolean // Default: true
  trim_headers?: boolean // Default: true
  encoding?: string // Default: 'UTF-8'
}

/**
 * Import Options
 */
export interface ImportOptions {
  validate_only?: boolean // Only validate, don't import
  skip_duplicates?: boolean // Skip rows that already exist
  update_existing?: boolean // Update existing entries
  batch_size?: number // Number of rows to process at once
}
