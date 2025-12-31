# Timesheet Analytics V2.0 - Project Guidelines

## Project Overview

This is a Next.js 14 application for analyzing design team timesheet data from Costlocker. Users export data from Costlocker as CSV/Excel files and upload them to the app for analysis. The app provides trend dashboards, monthly detailed breakdowns, and quality control for timesheet records.

**Key Technologies:**
- Next.js 14 (App Router, TypeScript)
- Supabase (PostgreSQL database)
- NextAuth.js v5 (Google OAuth)
- Tailwind CSS + shadcn/ui
- Recharts (data visualization)
- PapaParse (CSV parsing)
- XLSX (Excel parsing)

**Data Import Method:**
- CSV/Excel file upload (manual export from Costlocker)
- Supports Czech language column names
- Flexible column name matching
- Batch processing (1000 rows at a time)

**Target Deployment:**
- Vercel (free tier)
- All functionality must work within free tier limits

---

## Code Style & Conventions

### TypeScript
- **Always use TypeScript** - no JavaScript files
- **Strict mode enabled** - `strict: true` in tsconfig.json
- **Explicit types** - avoid `any`, use proper typing
- **Interface over type** - prefer `interface` for object shapes
- **Descriptive names** - `fetchTimesheetData` not `getData`

### React Components
- **Server Components by default** - use Client Components only when needed
- **"use client" directive** - add at top of file for client components
- **Functional components only** - no class components
- **Named exports for pages** - default exports for components
- **Props interface** - always define props type

Example:
```typescript
// ✅ Good - Server Component
export default async function DashboardPage() {
  const data = await fetchData()
  return <Dashboard data={data} />
}

// ✅ Good - Client Component
"use client"
interface ChartProps {
  data: TimeseriesData[]
}
export function Chart({ data }: ChartProps) {
  return <LineChart data={data} />
}
```

### File Naming
- **Pages:** `page.tsx` (Next.js convention)
- **Layouts:** `layout.tsx` (Next.js convention)
- **Components:** `kebab-case.tsx` (e.g., `metric-tile.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `fte-calculator.ts`)
- **Types:** `*.types.ts` (e.g., `costlocker.types.ts`)

### Project Structure
```
app/                    # Next.js App Router
  (dashboard)/          # Route groups for layouts
  api/                  # API routes
  
components/             # React components
  ui/                   # shadcn/ui components
  charts/               # Chart components
  dashboard/            # Feature-specific components
  
lib/                    # Business logic & utilities
  supabase/             # Database client & queries
  costlocker/           # API integration
  calculations/         # FTE, working days, etc.
  
types/                  # TypeScript type definitions
hooks/                  # Custom React hooks
```

---

## Database & Data Access

### Supabase Client

**IMPORTANT: This app uses NextAuth (not Supabase Auth), so RLS policies don't work with regular client.**

- **For auth/user operations:** Use `createServerAdminClient()` - REQUIRED for NextAuth setup
- **For public data:** Use `createServerClient()` - when RLS allows public access
- **Client-side:** Use `createBrowserClient()` from `@/lib/supabase/client`
- **Never expose service role key** - only use admin client server-side

### Query Patterns
```typescript
// ✅ Auth/User queries - MUST use admin client
import { createServerAdminClient } from '@/lib/supabase/server'

const supabase = createServerAdminClient()
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)

// ✅ Public data queries - can use regular client IF RLS allows
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
const { data, error } = await supabase
  .from('public_settings')
  .select('*')

// ✅ Client Component (via API route)
const response = await fetch('/api/admin/fte')
const data = await response.json()
```

**Why admin client is needed:**
- NextAuth manages its own sessions via JWT
- Supabase RLS checks `auth.uid()` which only exists with Supabase Auth
- Without Supabase Auth, RLS blocks everything
- Admin client bypasses RLS completely

### Database Schema
Tables defined in `supabase/migrations/`:
- `users` - User accounts
- `planned_fte` - Planned FTE values per person
- `activity_keywords` - Keywords for activity categorization
- `audit_log` - Admin action history
- `settings` - App configuration
- `ignored_timesheets` - User-ignored timesheet entries
- `upload_history` - CSV/Excel upload tracking with statistics
- `timesheet_entries` - Imported timesheet data from uploads

**Always use migrations** - never manual schema changes.

---

## CSV/Excel Upload System

### Overview
Users manually export timesheet data from Costlocker and upload CSV or Excel files to the app. The system parses, validates, and imports the data into the database.

**Why CSV/Excel instead of API:**
- Costlocker REST API is deprecated
- GraphQL API requires complex OAuth2 setup
- Manual upload is simpler and more reliable
- Users already familiar with exporting data

### Upload Flow
1. **Export from Costlocker:**
   - Go to Costlocker → Timesheet view
   - Select desired date range
   - Export to CSV or Excel format

2. **Upload to App:**
   - Navigate to `/dashboard/upload`
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

### File Format Support

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

### Date Format Handling

**Supported Date Formats:**
1. **YYYY-MM-DD** - ISO format (e.g., "2025-11-28")
2. **DD. MM. YYYY** - Czech format (e.g., "28. 11. 2025")
3. **Excel serial dates** - Numeric days since 1900 (e.g., 45962 = Nov 1, 2025)

**Date Validation:**
- Year must be between 1900 and 2100
- Invalid dates are rejected with clear error messages

**Excel Serial Date Handling (CRITICAL):**

Excel stores dates internally as serial numbers (e.g., 45962 for November 1, 2025). When the XLSX library reads an Excel file with `raw: false` and `dateNF: 'd. m. yyyy'`, it's supposed to convert these serial numbers to formatted date strings, but this doesn't always work reliably.

**The Problem:**
- XLSX library may return raw serial numbers (45962) instead of formatted dates ("1. 11. 2025")
- Original parser used local timezone for conversion, causing dates to shift by ±1 day
- Excel has a historical bug treating 1900 as a leap year (it wasn't)

**The Solution:**
The `parseDate()` function in `lib/upload/parser.ts` handles Excel serial dates with:

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

**Debugging Excel Date Issues:**

If dates are importing incorrectly (e.g., Nov 1st entries missing):

1. Check raw Excel file:
   - Open Excel file
   - Select a date cell
   - Change format to "Number" (not "Date")
   - Verify the serial number (Nov 1, 2025 = 45962)

2. Use debug endpoint:
   - Go to `/debug/parse-test`
   - Click "Check Raw Excel"
   - Verify serial numbers are being read correctly

3. Common serial numbers:
   - 45962 = November 1, 2025
   - 45963 = November 2, 2025
   - 45990 = November 29, 2025

### Number Format Handling

**Hours (Decimal):**
- Supports both comma and dot as decimal separator
- "0,25" and "0.25" both work
- Negative hours are rejected

### ID Generation

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

### Error Handling

**File Validation:**
- Invalid file type → Show error message
- File too large → Show error message
- Empty file → Show error message

**Data Validation:**
- Missing required fields → List validation errors (max 10 shown)
- Invalid data types → Show specific field errors
- Invalid dates → Show date format error
- Parse errors → Show row number and issue

**Import Errors:**
- Database errors → Log and show generic error message
- Batch insert failures → Track failed rows, continue with others
- Upload status reflects success/failure/partial

### Code Structure

**Parser (`lib/upload/parser.ts`):**
- `parseCSV()` - Parse CSV file with PapaParse
- `parseExcel()` - Parse Excel file with XLSX
- `parseFile()` - Auto-detect format and parse
- `mapRawRow()` - Map columns to database schema
- `parseAndMapFile()` - Complete parsing pipeline

**Importer (`lib/upload/importer.ts`):**
- `importTimesheetData()` - Import parsed data to database
- `getUploadHistory()` - Fetch upload history
- `getEntriesByUploadId()` - Fetch entries for specific upload
- `deleteUpload()` - Delete upload and cascade to entries

**API Routes:**
- `POST /api/upload/timesheet` - Upload and import file
- `GET /api/upload/history` - Get upload history

**Components:**
- `components/upload/file-upload.tsx` - Drag-and-drop upload
- `app/dashboard/upload/page.tsx` - Upload page with history

### Testing with Sample Data

Sample CSV file: `sample-data/costlocker-export-sample.csv`

```bash
# Navigate to upload page
open http://localhost:3000/dashboard/upload

# Upload the sample file
# Should import 20 entries successfully
```

---

## API Integration (Legacy)

**Note:** Direct API integration with Costlocker is not currently used due to API limitations.

### Costlocker API (Not in Use)
- **REST API:** Deprecated as of 2024
- **GraphQL API:** Requires OAuth2, complex setup
- **Current approach:** Manual CSV/Excel upload (see above)

### API Route Structure
```typescript
// app/api/costlocker/timesheet/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  
  // 1. Validate params
  // 2. Check auth
  // 3. Fetch from Costlocker
  // 4. Transform data
  // 5. Return JSON
  
  return Response.json({ data })
}
```

---

## Authentication & Authorization

### NextAuth.js Configuration
- **Provider:** Google OAuth
- **Domain restriction:** Only `@2fresh.cz` emails
- **Session storage:** JWT (stateless tokens)
- **Config location:** `lib/auth.ts`
- **User sync:** Manual sync to Supabase in `signIn` callback

**Why JWT instead of database sessions?**
- Simpler setup with NextAuth v5 + Supabase
- Avoids adapter compatibility issues
- Serverless-friendly (no database writes per request)
- Users are still synced to Supabase for app data

### CRITICAL: Always Use Admin Client for Database Operations

**When using NextAuth (not Supabase Auth), ALWAYS use `createServerAdminClient()` for database operations:**

```typescript
// ✅ CORRECT - Use admin client
import { createServerAdminClient } from '@/lib/supabase/server'

const supabase = createServerAdminClient()
const { data } = await supabase.from('users').select('*')

// ❌ WRONG - Don't use regular client with NextAuth
import { createServerClient } from '@/lib/supabase/server'
const supabase = createServerClient()
// This will fail due to RLS policies!
```

**Why?**
- NextAuth uses its own session management (JWT or database)
- Supabase RLS policies check `auth.uid()` which is only set by Supabase Auth
- Since we're not using Supabase Auth, RLS blocks all regular client operations
- Admin client bypasses RLS and has full access

**Where to use admin client:**
- `lib/auth.ts` - User sync in `signIn` callback
- `lib/auth.ts` - `checkTeamMember()` function
- `lib/auth-utils.ts` - All helper functions (`getUserData`, `checkTeamMember`, etc.)
- Any server component or API route that queries user data

### Protected Routes
```typescript
// app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return <>{children}</>
}
```

### Team Member Check
```typescript
// For Admin Panel access
const isTeamMember = await checkTeamMember(session.user.email)
if (!isTeamMember) {
  return <Unauthorized />
}
```

### User Logout (NextAuth v5)

**Always use server actions for logout** - form POST causes CSRF errors:

```typescript
// ✅ CORRECT - Server action
// app/actions/auth.ts
"use server"
import { signOut } from "@/lib/auth"

export async function handleSignOut() {
  await signOut({ redirectTo: "/login" })
}

// components/auth/logout-button.tsx
"use client"
import { handleSignOut } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <Button onClick={() => handleSignOut()}>
      Sign Out
    </Button>
  )
}

// ❌ WRONG - Form POST causes CSRF errors
<form action="/api/auth/signout" method="POST">
  <Button type="submit">Sign Out</Button>
</form>
```

### Live Data vs Cached Data

**JWT sessions cache user data** - changes in database won't appear until re-login

**Solution:** Fetch fresh data on every request using admin client:

```typescript
// Dashboard shows live data
const session = await auth() // JWT session (cached)
const userData = await getUserData(session.user.email) // Fresh from DB

// getUserData uses admin client, so data is always current
// Changes in Supabase appear immediately on page refresh
```

---

## UI & Styling

### Tailwind CSS
- **Use utility classes** - avoid custom CSS when possible
- **Responsive design** - mobile-first approach (though mobile not fully supported)
- **Dark mode** - use `dark:` prefix for dark mode styles
- **Custom colors** - defined in `tailwind.config.ts`

```typescript
// Project colors
const colors = {
  internal: '#3b82f6',  // blue
  ops: '#10b981',       // green
  rnd: '#f59e0b',       // orange
  guiding: '#8b5cf6',   // purple
  pr: '#ec4899',        // pink
  ux: '#06b6d4',        // cyan
}
```

### shadcn/ui Components
- **Copy-paste components** - not an npm package
- **Location:** `components/ui/`
- **Customization:** Edit component files directly
- **Add new components:** `npx shadcn-ui@latest add button`

### Dark Mode Implementation
```typescript
// Use next-themes
import { ThemeProvider } from 'next-themes'

// In component
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
```

---

## Data Processing & Calculations

### FTE Calculation
```typescript
// lib/calculations/fte.ts
export function calculateFTE(
  trackedHours: number,
  workingHoursInMonth: number
): number {
  return parseFloat((trackedHours / workingHoursInMonth).toFixed(2))
}
```

### Working Days Calculation
- Use `date-holidays` library for Czech holidays
- Formula: `(weekdays - holidays) × 8 hours`
- Location: `lib/calculations/working-days.ts`

### Activity Categorization
```typescript
// lib/calculations/activity-pairing.ts
export function categorizeActivity(
  description: string,
  keywords: ActivityKeyword[]
): ActivityCategory {
  // Case-insensitive matching
  // OPS Hiring: "hiring" or "interview"
  // OPS Jobs: "jobs" or "job"
  // OPS Reviews: "reviews" or "review"
  // Unpaired: no match found
}
```

### Project Name Mapping
```typescript
// config/projects.ts
export const PROJECT_MAPPING = {
  'Design tým OPS_2025': 'OPS',
  'Design tým OPS_2024': 'OPS',
  'Design tým Interní_2025': 'Internal',
  'Design tým Interní_2024': 'Internal',
  // ... handle _2024, _2025, _2026 variants
}
```

---

## Charts & Visualizations

### Recharts Usage
- **Library:** Recharts
- **Components:** LineChart, BarChart, AreaChart
- **Responsive:** Use ResponsiveContainer
- **Custom tooltips:** Always implement CustomTooltip component

Example:
```typescript
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function TrendChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Line type="monotone" dataKey="fte" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

### Chart Colors
Use project colors consistently:
- Internal: `#3b82f6`
- OPS: `#10b981`
- R&D: `#f59e0b`
- Guiding: `#8b5cf6`
- PR: `#ec4899`
- UX Maturity: `#06b6d4`

---

## Error Handling

### API Errors
```typescript
try {
  const data = await fetchCostlockerData()
} catch (error) {
  console.error('Costlocker API error:', error)
  return {
    error: 'Failed to fetch data from Costlocker',
    details: error.message
  }
}
```

### User-Facing Errors
- **Toast notifications** - use shadcn/ui toast component
- **Error boundaries** - wrap sections that might fail
- **Fallback UI** - show meaningful error messages

### Validation
- **Zod schemas** - for API input validation
- **Form validation** - use react-hook-form + Zod

---

## Performance Considerations

### Server Components
- Fetch data on server when possible
- Reduces client JavaScript bundle
- Faster initial page load

### Caching
```typescript
// API route caching
export const revalidate = 3600 // Cache for 1 hour

// ISR for pages
export const revalidate = 300 // Regenerate every 5 minutes
```

### Image Optimization
```typescript
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  width={40}
  height={40}
  alt="User avatar"
  priority={false}
/>
```

---

## Testing

### Unit Tests (Vitest)
- **Test calculations** - FTE, working days, categorization
- **Test transformers** - data transformation logic
- **Test utilities** - helper functions
- **Location:** `__tests__/` next to tested files

### Integration Tests
- **API routes** - test endpoints with mocked Costlocker API
- **Database queries** - test with Supabase test database

### E2E Tests (Playwright)
- **Critical flows:** Login → Dashboard → Data display
- **Admin flows:** FTE change, keyword management
- **Location:** `e2e/` directory

---

## Environment Variables

Required variables:
```bash
# Next.js
NEXT_PUBLIC_APP_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Costlocker
COSTLOCKER_API_URL=
COSTLOCKER_API_TOKEN=
```

**Never commit .env.local** - use .env.example for reference.

---

## Git Workflow

### Commit Messages
- **Format:** `type: description`
- **Types:** feat, fix, docs, style, refactor, test, chore
- **Example:** `feat: add FTE calculation function`

### Branch Strategy
- **Main branch:** `main` (production)
- **Feature branches:** `feat/feature-name`
- **Bug fixes:** `fix/bug-description`

### Pull Requests
- Create PR with clear description
- Reference issue number if applicable
- Request review from team

---

## Deployment

### Vercel Configuration
- **Framework:** Next.js
- **Build command:** `next build`
- **Output directory:** `.next`
- **Install command:** `npm install`

### Environment Variables in Vercel
- Set all required env vars in Vercel dashboard
- Use different values for preview vs. production

### Database Migrations
```bash
# Run migrations on deploy
npm run db:migrate
```

---

## Common Patterns

### Data Fetching Pattern
```typescript
// 1. Server Component fetches data
export default async function Page() {
  const data = await fetchData()
  return <ClientComponent data={data} />
}

// 2. Client Component for interactivity
"use client"
export function ClientComponent({ data }) {
  const [filtered, setFiltered] = useState(data)
  return <Chart data={filtered} />
}
```

### Loading States
```typescript
// Use loading.tsx in route folders
export default function Loading() {
  return <Skeleton />
}
```

### Error States
```typescript
// Use error.tsx in route folders
"use client"
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

## Security Best Practices

### Input Validation
- **Always validate** - never trust client input
- **Use Zod** - for schema validation
- **Sanitize** - escape user-provided text

### SQL Injection Prevention
- **Use Supabase client** - parameterized queries
- **Never concatenate** - don't build SQL strings manually

### XSS Prevention
- **React escapes by default** - but be careful with dangerouslySetInnerHTML
- **Sanitize HTML** - if you must render user HTML

### CSRF Protection
- **Next.js handles** - built-in CSRF protection for API routes

---

## Documentation

### Code Comments
- **Why, not what** - explain reasoning, not implementation
- **JSDoc for functions** - document public API
- **TODO comments** - mark incomplete work

Example:
```typescript
/**
 * Calculates FTE (Full-Time Equivalent) based on tracked hours
 * and working hours in the month.
 * 
 * @param trackedHours - Total hours tracked by person
 * @param workingHoursInMonth - Total working hours in month (e.g., 160)
 * @returns FTE value rounded to 2 decimal places
 */
export function calculateFTE(
  trackedHours: number,
  workingHoursInMonth: number
): number {
  return parseFloat((trackedHours / workingHoursInMonth).toFixed(2))
}
```

### README
- Keep README.md updated
- Include setup instructions
- Document environment variables
- Add troubleshooting section

---

## Important Notes for Claude Code

### When Creating Files
1. **Always use TypeScript** - .ts or .tsx extensions
2. **Follow structure** - place files in correct directories
3. **Import paths** - use `@/` alias for absolute imports
4. **Consistent naming** - follow conventions above

### When Implementing Features
1. **Read PRD first** - understand requirements fully
2. **Check existing code** - maintain consistency
3. **Use existing patterns** - don't reinvent
4. **Test as you go** - verify each component works

### When Debugging
1. **Check console** - look for errors
2. **Verify env vars** - ensure all are set
3. **Check API responses** - verify external data
4. **Use TypeScript** - catch type errors early

### Critical Rules
- ❌ **Never hardcode** - API keys, tokens, secrets
- ❌ **Never use `any`** - always proper TypeScript types
- ❌ **Never skip validation** - always validate input
- ❌ **Never use `createServerClient()` for database ops** - always use `createServerAdminClient()` with NextAuth
- ❌ **Never use form POST for logout** - always use server actions with NextAuth v5
- ✅ **Always use Server Components** - unless interactivity needed
- ✅ **Always handle errors** - graceful degradation
- ✅ **Always test** - verify functionality
- ✅ **Always use admin client** - for all Supabase queries when using NextAuth
- ✅ **Always fetch fresh data** - use `getUserData()` for live database values, not JWT cache

---

## Troubleshooting

### Excel Date Import Issues

**Problem:** Entries from specific dates are missing after uploading Excel file.

**Symptoms:**
- Upload shows "426 of 426 entries" success, but some dates are missing
- No validation errors reported
- Expected entries visible in Excel but not in database

**Root Cause:**
Excel stores dates as serial numbers internally. The XLSX library may not convert them to formatted strings, causing the parser to receive raw serial numbers like "45962" instead of "1. 11. 2025".

**Solution:**
The parser automatically handles Excel serial dates. If experiencing issues:

1. **Verify the Excel file:**
   ```
   - Open the Excel file
   - Click on a date cell
   - Change format to "Number" (not "Date")
   - Check the serial number (e.g., Nov 1, 2025 = 45962)
   ```

2. **Use the debug page:**
   ```
   - Navigate to /debug/parse-test
   - Upload your Excel file
   - Click "Check Raw Excel"
   - Verify serial numbers are present
   ```

3. **Check the fix:**
   The `parseDate()` function in `/lib/upload/parser.ts` should:
   - Use UTC dates (prevents timezone shifts)
   - Account for Excel's 1900 leap year bug
   - Convert serial numbers correctly

**Fixed in:** Commit that updated `/lib/upload/parser.ts` to use UTC-based Excel serial date conversion.

---

### Activity Categorization Not Working

**Problem:** Activities are showing as "Unpaired" when they should be categorized.

**Solution:**
1. Check keywords in database:
   ```sql
   SELECT * FROM activity_keywords WHERE is_active = true ORDER BY category, keyword;
   ```

2. Verify category names match code expectations:
   - Database: "OPS_Hiring" or "OPS Hiring" (both supported)
   - Code handles both underscore and space variants

3. Check project-based rules:
   - Hiring/Jobs/Reviews keywords on Guiding projects → Unpaired (tracking mistake)
   - Guiding keywords work on both OPS and Guiding projects

---

### Duplicate Entries After Re-upload

**Problem:** Re-uploading the same file creates duplicate entries.

**Solution:**
The importer automatically deletes existing entries for the same date range before importing. Check `/lib/upload/importer.ts`:

```typescript
// Delete existing entries for the same date range to avoid duplicates
if (dataDateFrom && dataDateTo) {
  await supabase
    .from('timesheet_entries')
    .delete()
    .gte('date', dataDateFrom)
    .lte('date', dataDateTo)
}
```

**Manual cleanup:**
If duplicates already exist, use the cleanup endpoint:
```
POST /api/admin/cleanup-duplicates
```

---

## Getting Help

### Documentation Resources
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- NextAuth: https://next-auth.js.org/
- Tailwind: https://tailwindcss.com/docs
- Recharts: https://recharts.org/

### When Stuck
1. Check this CLAUDE.md file
2. Check PRD document
3. Check existing similar code
4. Search documentation
5. Ask for clarification if unclear

---

**Remember:** This is a production application. Write clean, maintainable, and well-tested code. Prioritize user experience and data accuracy.
