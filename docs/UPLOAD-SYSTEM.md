# CSV/Excel Upload System

## Overview

Users manually export timesheet data from Costlocker and upload CSV or Excel files to the app. The system parses, validates, and imports the data into the database.

**Why CSV/Excel instead of API:**
- Costlocker REST API is deprecated
- GraphQL API requires complex OAuth2 setup
- Manual upload is simpler and more reliable
- Users already familiar with exporting data

---

## Upload Flow

1. **Export from Costlocker:**
   - Go to Costlocker → Timesheet view
   - Select desired date range
   - Export to CSV or Excel format

2. **Upload to App:**
   - Navigate to `/upload`
   - Drag and drop or browse for file
   - File is validated (type, size, format)

3. **Processing:**
   - Parse file (CSV with PapaParse, Excel with XLSX)
   - Map columns (flexible matching for different export formats)
   - Validate data (required fields, data types, date formats)
   - Generate IDs from names (since Costlocker doesn't export IDs)

4. **Import:**
   - Create upload_history record
   - Batch insert timesheet_entries (1000 rows at a time)
   - Update upload status (completed/failed/partial)

5. **Result:**
   - Display upload statistics
   - Show in upload history
   - Data ready for analysis

---

## File Format Support

**Supported File Types:**
- `.csv` - Comma-separated values
- `.xlsx` - Excel 2007+ format
- `.xls` - Excel 97-2003 format

**Max File Size:** 10MB

**Column Names (Czech/English):**
The parser supports both Czech and English column names with flexible matching:

| Czech | English Variants | Required |
|-------|------------------|----------|
| Datum | date, day | ✅ Yes |
| Osoba | person_name, name, user | ✅ Yes |
| Projekt | project_name, project | ✅ Yes |
| Činnost | activity_name, activity, task | ✅ Yes |
| Natrackováno | hours, duration, time | ✅ Yes |
| Popis | description, note, comment | ❌ Optional |
| Placené | billable, is_billable | ❌ Optional |

**Notes:**
- Column name matching is case-insensitive
- Handles spaces, accents, and special characters
- If IDs are not provided, they are generated from names using a hash function
- Supports multiple entries for the same person/activity/date (no unique constraint)

---

## Date Format Handling

### Supported Date Formats

1. **YYYY-MM-DD** - ISO format (e.g., "2025-11-28")
2. **DD. MM. YYYY** - Czech format (e.g., "28. 11. 2025")
3. **Excel serial dates** - Numeric days since 1900 (e.g., 45962 = Nov 1, 2025)

**Date Validation:**
- Year must be between 1900 and 2100
- Invalid dates are rejected with clear error messages

### Excel Serial Date Handling (CRITICAL)

Excel stores dates internally as serial numbers (e.g., 45962 for November 1, 2025). When the XLSX library reads an Excel file, it may return raw serial numbers instead of formatted date strings.

**The Problem:**
- XLSX library may return raw serial numbers (45962) instead of formatted dates
- Original parser used local timezone for conversion, causing dates to shift by ±1 day
- Excel has a historical bug treating 1900 as a leap year (it wasn't)

**The Solution:**

The `parseDate()` function in `lib/upload/parser.ts` handles Excel serial dates:

```typescript
// Excel serial date conversion with proper UTC handling
let excelSerial = asNumber

// Adjust for Excel's 1900 leap year bug
if (excelSerial > 59) {
  excelSerial -= 1
}

// January 0, 1900 is December 31, 1899 in JavaScript
const baseDate = new Date(Date.UTC(1899, 11, 31))
const milliseconds = excelSerial * 86400000 // days to milliseconds
const date = new Date(baseDate.getTime() + milliseconds)

// Use UTC methods to prevent timezone shifts
const year = date.getUTCFullYear()
const month = String(date.getUTCMonth() + 1).padStart(2, '0')
const day = String(date.getUTCDate()).padStart(2, '0')
return `${year}-${month}-${day}`
```

**Key Points:**
- ✅ **Use UTC dates** - Prevents timezone-based date shifts
- ✅ **Account for 1900 leap year bug** - Subtract 1 from serials > 59
- ✅ **Start from Dec 31, 1899** - Excel's "January 0, 1900" = Dec 31, 1899
- ✅ **Format as YYYY-MM-DD** - Consistent database format

### Debugging Excel Date Issues

If dates are importing incorrectly:

1. **Check raw Excel file:**
   - Open Excel file
   - Select a date cell
   - Change format to "Number" (not "Date")
   - Verify the serial number (Nov 1, 2025 = 45962)

2. **Use debug endpoint:**
   - Go to `/debug/parse-test`
   - Click "Check Raw Excel"
   - Verify serial numbers are being read correctly

3. **Common serial numbers:**
   - 45962 = November 1, 2025
   - 45963 = November 2, 2025
   - 45990 = November 29, 2025

---

## Number Format Handling

**Hours (Decimal):**
- Supports both comma and dot as decimal separator
- "0,25" and "0.25" both work
- Negative hours are rejected

---

## ID Generation

Since Costlocker exports don't include database IDs, the system generates consistent IDs from names:

```typescript
// Generate numeric ID from string using hash function
function generateIdFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
```

**Benefits:**
- Same name always produces same ID
- No need to maintain separate ID mapping table
- Works with any export format

---

## Error Handling

### File Validation
- Invalid file type → Show error message
- File too large → Show error message
- Empty file → Show error message

### Data Validation
- Missing required fields → List validation errors (max 10 shown)
- Invalid data types → Show specific field errors
- Invalid dates → Show date format error
- Parse errors → Show row number and issue

### Import Errors
- Database errors → Log and show generic error message
- Batch insert failures → Track failed rows, continue with others
- Upload status reflects success/failure/partial

---

## Code Structure

### Parser (`lib/upload/parser.ts`)
- `parseCSV()` - Parse CSV file with PapaParse
- `parseExcel()` - Parse Excel file with XLSX
- `parseFile()` - Auto-detect format and parse
- `mapRawRow()` - Map columns to database schema
- `parseAndMapFile()` - Complete parsing pipeline

### Importer (`lib/upload/importer.ts`)
- `importTimesheetData()` - Import parsed data to database
- `getUploadHistory()` - Fetch upload history
- `getEntriesByUploadId()` - Fetch entries for specific upload
- `deleteUpload()` - Delete upload and cascade to entries

### API Routes
- `POST /api/upload/timesheet` - Upload and import file
- `GET /api/upload/history` - Get upload history

### Components
- `components/upload/file-upload.tsx` - Drag-and-drop upload
- `app/upload/page.tsx` - Upload page with history

---

## Testing with Sample Data

Sample CSV file: `sample-data/costlocker-export-sample.csv`

```bash
# Navigate to upload page
open http://localhost:3000/upload

# Upload the sample file
# Should import 20 entries successfully
```
