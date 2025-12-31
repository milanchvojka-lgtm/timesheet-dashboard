# Timesheet Analytics V2.0 - Implementation Plan

## Overview

This document outlines the step-by-step implementation plan for building the Timesheet Analytics application. Each phase builds on the previous one and has clear deliverables.

**Estimated Timeline:** 6-8 phases, each taking 1-3 hours of development time.

---

## Phase 0: Project Setup & Foundation ✅ COMPLETE
**Duration:** 30-60 minutes
**Goal:** Set up Next.js project with all dependencies and basic structure

### Tasks:
1. ✅ Create Next.js 14 project with TypeScript and Tailwind
2. ✅ Install all dependencies (Supabase, NextAuth, Recharts, PapaParse, XLSX, etc.)
3. ✅ Set up project structure (folders: app, components, lib, types)
4. ✅ Configure Tailwind with custom colors
5. ✅ Set up shadcn/ui and install core components
6. ✅ Create basic layout structure
7. ✅ Set up environment variables template (.env.example)

### Deliverables:
- ✅ Running Next.js application on localhost:3000
- ✅ Project structure in place
- ✅ Tailwind configured with project colors
- ✅ shadcn/ui components installed

### Verification:
```bash
npm run dev
# Should open at http://localhost:3000 with default Next.js page
```

---

## Phase 1: Database Setup & Authentication ✅ COMPLETE
**Duration:** 1-2 hours
**Goal:** Set up Supabase database and Google OAuth authentication

### Tasks:

#### 1.1 Supabase Setup
1. ✅ Create Supabase project
2. ✅ Create database schema (migrations):
   - ✅ `users` table
   - ✅ `planned_fte` table
   - ✅ `activity_keywords` table
   - ✅ `audit_log` table
   - ✅ `settings` table
   - ✅ `ignored_timesheets` table
   - ✅ `upload_history` table
   - ✅ `timesheet_entries` table
3. ✅ Seed initial data:
   - Team members with planned FTE
   - Activity keywords (hiring, jobs, reviews)
   - Default settings (period: 12 months, date range: Oct 2024)
4. ✅ Create Supabase client utilities (with admin client for NextAuth)

#### 1.2 Authentication Setup
1. ✅ Configure Google OAuth in Google Cloud Console
2. ✅ Set up NextAuth.js v5 with Google provider
3. ✅ Restrict to @2fresh.cz domain
4. ✅ Configure JWT sessions (not database sessions)
5. ✅ Create auth utilities (auth(), requireTeamMember, getUserData)
6. ✅ Implement login page
7. ✅ Implement protected route middleware
8. ✅ Fix logout CSRF issues with server actions

### Deliverables:
- ✅ Supabase database with all tables
- ✅ Google OAuth working
- ✅ Users can sign in with @2fresh.cz email
- ✅ Protected routes redirect to login
- ✅ User menu shows logged-in user

### Verification:
1. ✅ Sign in with Google (@2fresh.cz email)
2. ✅ Should redirect to dashboard
3. ✅ Non-@2fresh.cz emails should be rejected
4. ✅ User info should appear in database

---

## Phase 2: CSV/Excel Upload System ✅ COMPLETE
**Duration:** 2-3 hours
**Goal:** Implement CSV/Excel file upload, parsing, validation, and import to database

**Note:** Originally planned as Costlocker API integration, but pivoted to manual upload approach due to API limitations (REST API deprecated, GraphQL requires OAuth2).

### Tasks:

#### 2.1 Type Definitions
1. ✅ Create TypeScript types (`types/upload.types.ts`)
   - ✅ `RawTimesheetRow` - Raw parsed data from file
   - ✅ `ParsedTimesheetRow` - Validated and transformed data
   - ✅ `ValidationError` - Validation error structure
   - ✅ `UploadResult` - Upload result with statistics
   - ✅ `TimesheetEntry` - Database schema type
   - ✅ `UploadHistory` - Upload tracking type

#### 2.2 File Parser
1. ✅ Install dependencies: `papaparse`, `xlsx`, `@types/papaparse`
2. ✅ Create parser (`lib/upload/parser.ts`)
   - ✅ `parseCSV()` - Parse CSV with PapaParse
   - ✅ `parseExcel()` - Parse Excel with XLSX (using arrayBuffer)
   - ✅ `parseFile()` - Auto-detect and parse file
   - ✅ `mapRawRow()` - Map columns to database schema
   - ✅ `parseAndMapFile()` - Complete parsing pipeline
3. ✅ Implement flexible column name matching:
   - ✅ Support Czech names (Datum, Osoba, Projekt, Činnost, Natrackováno, Popis, Placené)
   - ✅ Support English names (date, person, project, activity, hours, description, billable)
   - ✅ Case-insensitive matching
   - ✅ Handle accents and special characters
4. ✅ Implement data validation:
   - ✅ Required fields check (person, project, activity, date, hours)
   - ✅ Data type validation (numbers, dates)
   - ✅ Date format handling (YYYY-MM-DD, DD. MM. YYYY, Excel serial dates)
   - ✅ Decimal separator handling (comma and dot for hours)
   - ✅ Year validation (1900-2100 range)
5. ✅ Implement ID generation:
   - ✅ Hash function to generate consistent IDs from names
   - ✅ Since Costlocker doesn't export IDs

#### 2.3 Data Importer
1. ✅ Create importer (`lib/upload/importer.ts`)
   - ✅ `importTimesheetData()` - Import parsed data to database
   - ✅ `getUploadHistory()` - Fetch upload history
   - ✅ `getEntriesByUploadId()` - Fetch entries for upload
   - ✅ `deleteUpload()` - Delete upload with cascade
2. ✅ Implement batch processing:
   - ✅ Insert 1000 rows at a time
   - ✅ Track successful and failed rows
   - ✅ Continue processing on partial failures
3. ✅ Create upload_history record:
   - ✅ Track filename, size, file type
   - ✅ Store uploader email and name
   - ✅ Calculate date range from data
   - ✅ Update status (processing/completed/failed/partial)
4. ✅ Remove overly strict unique constraint:
   - ✅ Allow multiple entries for same person/activity/date
   - ✅ People commonly log same activity multiple times per day

#### 2.4 API Routes
1. ✅ Create upload endpoint (`app/api/upload/timesheet/route.ts`)
   - ✅ POST handler with FormData
   - ✅ File validation (type, size max 10MB)
   - ✅ Team member authentication check
   - ✅ Parse and validate file
   - ✅ Import to database
   - ✅ Return upload statistics
   - ✅ Error handling with detailed messages
2. ✅ Create history endpoint (`app/api/upload/history/route.ts`)
   - ✅ GET handler with limit parameter
   - ✅ Return recent uploads with statistics

#### 2.5 Upload UI Components
1. ✅ Create FileUpload component (`components/upload/file-upload.tsx`)
   - ✅ Drag-and-drop functionality
   - ✅ File browse button
   - ✅ File validation (client-side)
   - ✅ Upload progress indicator
   - ✅ Success/error status display
   - ✅ Error message display
2. ✅ Create upload page (`app/dashboard/upload/page.tsx`)
   - ✅ FileUpload component integration
   - ✅ Costlocker export instructions
   - ✅ Upload result display
   - ✅ Upload history list with status badges
   - ✅ Statistics (total/successful/failed rows)
   - ✅ Date range display
3. ✅ Add UI components from shadcn/ui:
   - ✅ Alert component
   - ✅ Separator component
   - ✅ Badge component (already installed)

#### 2.6 Testing & Validation
1. ✅ Create sample CSV file (`sample-data/costlocker-export-sample.csv`)
2. ✅ Test with real Costlocker export (November 2025, 426 entries)
3. ✅ Verify Czech format support
4. ✅ Verify date parsing (DD. MM. YYYY format)
5. ✅ Verify decimal comma handling (0,25 hours)
6. ✅ Verify ID generation consistency

### Deliverables:
- ✅ CSV/Excel parser working with Czech language support
- ✅ File upload UI with drag-and-drop
- ✅ Data validation with clear error messages
- ✅ Batch import to database (1000 rows at a time)
- ✅ Upload history tracking
- ✅ Successfully tested with 426 real entries

### Verification:
1. ✅ Navigate to http://localhost:3000/dashboard/upload
2. ✅ Upload sample CSV file - import succeeds
3. ✅ Upload real Costlocker Excel export - all rows imported
4. ✅ View upload history - see all uploads with statistics
5. ✅ Check database - verify data in timesheet_entries table

---

## Phase 3: Core Business Logic ✅ COMPLETE
**Duration:** 1-2 hours
**Goal:** Implement FTE calculations and activity categorization

### Tasks:

#### 3.1 Working Days Calculator
1. ✅ Install `date-holidays` library
2. ✅ Implement `calculateWorkingDays()` function (`lib/calculations/working-days.ts`)
   - Input: month, year
   - Calculate weekdays minus Czech holidays
   - Return working days and working hours
   - Returns: totalDays, weekdays, holidays, workingDays, workingHours
3. ✅ Implement `getWorkingHoursForPeriod()` for date ranges
4. ✅ Implement `getCzechHolidays()` to list holidays

**Verified:** November 2025 = 19 working days (20 weekdays - 1 holiday) = 152 hours ✅

#### 3.2 FTE Calculator
1. ✅ Implement `calculateFTE()` function (`lib/calculations/fte.ts`)
   - Input: tracked hours, working hours in month
   - Formula: tracked / working
   - Round to 2 decimals
2. ✅ Implement `calculateMonthlyFTE()` for person
3. ✅ Implement `calculateTeamMonthlyFTE()` for all team members
4. ✅ Implement `calculateTotalTeamFTE()` for month
5. ✅ Implement `calculateFTEStats()` for statistics
6. ✅ Support planned FTE comparison and deviation calculation

**Verified:** Tested with 5 team members, FTE range 0.01-0.13, all calculations correct ✅

#### 3.3 Activity Categorization
1. ✅ Implement `categorizeActivity()` function (`lib/calculations/activity-pairing.ts`)
   - Load keywords from database
   - Case-insensitive matching
   - Return category (OPS_Hiring, OPS_Jobs, OPS_Reviews, OPS_Guiding, Unpaired)
2. ✅ Implement `categorizeTimesheet()` for full dataset
3. ✅ Handle Guiding project as OPS_Guiding automatically
4. ✅ Implement `getActivitySummary()` for hours by category
5. ✅ Implement `getUnpairedEntries()` to find uncategorized items
6. ✅ Implement `calculateQualityScore()` for pairing percentage

**Verified:** Categorization working, Guiding project detected correctly ✅

#### 3.4 Metrics Calculator
1. ✅ Implement `calculateDashboardMetrics()` (`lib/calculations/metrics.ts`)
   - Highest FTE, Lowest FTE, Average FTE
   - Team member count, Total team FTE
2. ✅ Implement `calculateProjectMetrics()`
   - Hours, FTE, entry count per project
   - Person count, percentage distribution
3. ✅ Implement `calculateActivityMetrics()`
   - Hours per activity category
   - Person count, percentage distribution
4. ✅ Implement `getMonthData()` and `getDateRangeData()` filters

**Verified:** Project metrics showing correct distribution (Internal 31.7%, OPS 22.9%, etc.) ✅

#### 3.5 Integration Testing
1. ✅ Created test API route (`/api/test/calculations`)
2. ✅ Tested with real November 2025 data (50 entries)
3. ✅ All calculations producing correct results

### Deliverables:
- ✅ Working days calculation working (152 hours for Nov 2025)
- ✅ FTE calculations accurate (tested with 5 people)
- ✅ Activity categorization working (21% Guiding, 79% unpaired)
- ✅ All metrics calculators ready (dashboard, project, activity)
- ✅ Integration tested with real data

### Verification:
```bash
# Test with real data
curl http://localhost:3000/api/test/calculations

# Results:
# ✅ Working days: 19 days, 152 hours (November 2025)
# ✅ FTE Stats: 5 members, avg 0.07 FTE, range 0.01-0.13
# ✅ Dashboard Metrics: Highest/Lowest FTE detected correctly
# ✅ Project Metrics: Internal 31.7%, OPS 22.9%, Other 21%, PR 14.1%, R&D 10.2%
# ✅ Activity Categorization: 21% Guiding, 79% Unpaired (needs more keywords)
# ✅ Quality Score: 28% (low because keywords need to be added)
```

---

## Phase 4: Dashboard UI Foundation ✅ COMPLETE
**Duration:** 1-2 hours
**Goal:** Create base layout and shared components

### Tasks:

#### 4.1 Layout Components
1. Create main layout (`app/(dashboard)/layout.tsx`)
   - Header with logo and user menu
   - Navigation tabs (Dashboard, Projects, Activities, Team)
   - Protected route logic
2. Create user menu component
   - Display user name and avatar
   - Menu items: Monthly Detail, Review Buddy, Admin Panel (conditional)
   - Dark mode toggle
   - Sign out button
3. Implement dark mode with next-themes

#### 4.2 Shared Components
1. Create `PeriodSelector` component
   - Presets: Last month, 3, 6, 12 months
   - Custom date picker
   - Load default from settings
2. Create `MetricTile` component
   - Display metric value
   - Color-coded
   - Responsive
3. Create `NotificationBanner` component
   - Different types: warning, error, info
   - Dismissible
4. Create loading and error states

### Deliverables:
- ✅ Dashboard layout with navigation
- ✅ User menu functional
- ✅ Dark mode working
- ✅ Period selector working
- ✅ Shared components ready

### Verification:
1. ✅ Navigate between tabs - Active state highlighting works
2. ✅ Toggle dark mode - Light/Dark/System modes functional
3. ✅ Select different periods - Period selector with 1M, 3M, 6M, 12M, Custom
4. ✅ User menu shows correct options - Circular avatar, dropdown menu works
5. ✅ Production build successful - 12 routes compiled without errors

### Phase 4 Results:
**Components Created:** 8 new components
- `DashboardHeader` - Logo, branding, theme toggle, user menu
- `DashboardNav` - 5 navigation tabs (Dashboard, Projects, Activities, Team, Upload)
- `UserMenu` - Dropdown with circular avatar and menu items
- `ThemeToggle` - Light/Dark/System mode switcher
- `PeriodSelector` - Date range selection (1M, 3M, 6M, 12M, Custom)
- `MetricTile` - Color-coded metrics display with trend indicators
- `NotificationBanner` - Alert component (info, warning, error, success)
- `LoadingSkeleton` - Loading states for dashboard components

**Configuration Updates:**
- Added Google Images domain to `next.config.mjs` for avatar support
- Added `upload_history` and `timesheet_entries` to `database.types.ts`
- Fixed circular avatar styling with overflow-hidden

**Code Quality:**
- Fixed all ESLint and TypeScript linting errors
- Removed unused test routes
- Production build verified (25 files changed, 864 insertions, 355 deletions)

**Git Commit:** `25221f1` - Successfully pushed to GitHub

---

## Phase 5: Trend Dashboard - Charts & Data
**Duration:** 2-3 hours  
**Goal:** Implement all 4 dashboard tabs with data and charts

### Tasks:

#### 5.1 Dashboard Tab (Overview)
1. Create API route: `/api/analytics/dashboard`
   - Calculate metrics for selected period
   - Return: highest FTE, lowest FTE, average FTE, team count
2. Create page: `app/(dashboard)/page.tsx`
3. Display 4 metric tiles
4. Create FTE evolution chart (combined chart: bars + line)
5. Fetch data on server, pass to client components

#### 5.2 Projects Tab
1. Create API route: `/api/analytics/projects`
   - Calculate FTE per project
   - Calculate hours, entry count, share %
2. Create page: `app/(dashboard)/projects/page.tsx`
3. Display project tiles (6 tiles: Internal, OPS, R&D, Guiding, PR, UX)
4. Create charts:
   - Percentage share (stacked bar chart)
   - Project evolution (multi-line chart)
5. Use project colors from config

#### 5.3 Activities Tab
1. Create API route: `/api/analytics/activities`
   - Categorize activities
   - Calculate hours per category
   - Separate OPS activities
2. Create page: `app/(dashboard)/activities/page.tsx`
3. Display activity tiles (8 tiles)
4. Create charts:
   - OPS activities evolution (area/line chart)
   - Internal & R&D evolution (line chart)

#### 5.4 Team Tab
1. Create API route: `/api/analytics/team`
   - Calculate FTE per person
   - Load planned FTE from database
   - Calculate % fulfillment
2. Create page: `app/(dashboard)/team/page.tsx`
3. Display planned vs. actual FTE table
   - Color-coded (green/yellow/red)
   - Progress bars
4. Create charts:
   - Individual member FTE evolution (multi-line)
   - Total team capacity (stacked area)

### Deliverables:
- ✅ All 4 dashboard tabs functional
- ✅ All metrics displaying correctly
- ✅ All charts rendering with real data
- ✅ Period selector affects all tabs
- ✅ Dark mode works on all charts

### Verification:
1. Navigate through all tabs
2. Change period - data updates
3. All charts display correctly
4. Hover tooltips work
5. Dark mode toggles properly

---

## Phase 6: Monthly Detail ✅ COMPLETE
**Duration:** 1-2 hours
**Goal:** Implement detailed single-month breakdown

### Tasks:
1. ✅ Create page: `app/(dashboard)/monthly-detail/page.tsx`
2. ✅ Add month selector (dropdown)
3. ✅ Display period info card (working days, holidays with dates)
4. ✅ Create Projects section:
   - ✅ Detailed table with all metrics
   - ✅ Always show all categories (OPS, Internal, R&D, Guiding, PR, UX Maturity)
   - ✅ Support "Guiding_2025" and "UX Maturity 🙌" project names
5. ✅ Create Personnel section:
   - ✅ Detailed table with planned vs. actual
   - ✅ Deviation column
   - ✅ Comparison chart
6. ✅ Create OPS Activities section:
   - ✅ Aggregate table (Hiring, Jobs, Reviews, Guiding)
   - ✅ Quality score calculation
   - ✅ Only applies to OPS and Guiding projects
7. ✅ Create Unpaired Items section:
   - ✅ Show count and total hours
   - ✅ Detailed table if unpaired exist
   - ✅ Success message if all paired
   - ✅ Only shows items from OPS and Guiding projects

### Critical Fixes:
- ✅ Fixed Excel serial date parsing (UTC, 1900 leap year bug)
- ✅ Fixed working days timezone issue (December 26 holiday now detected)
- ✅ Fixed project categorization (Guiding_2025 no longer shows as "Other")
- ✅ Fixed duplicate entry prevention on re-upload
- ✅ Added comprehensive debug tools (/debug/parse-test)

### Deliverables:
- ✅ Monthly detail page functional
- ✅ Month selector working
- ✅ All sections displaying correctly
- ✅ Tables formatted nicely
- ✅ Period info shows holidays with dates
- ✅ Working hours calculation correct for all months

### Verification:
1. ✅ Select different months - data updates correctly
2. ✅ Verify calculations match Costlocker data
3. ✅ Check unpaired items detection - working for OPS/Guiding only
4. ✅ December 2025 shows 3 holidays correctly
5. ✅ All project categories always visible (even if 0 hours)

---

## Phase 7: Timesheet Review Buddy ✅ COMPLETE
**Duration:** 1-2 hours
**Goal:** Implement quality control for timesheet entries

**Implementation Approach:** Redesigned as pre-upload validation tool instead of database-based review system.

### Tasks Completed:
1. ✅ Create page: `app/dashboard/review-buddy/page.tsx`
2. ✅ Create validation endpoint: `POST /api/review-buddy/validate-file`
3. ✅ File upload component with drag-and-drop support
4. ✅ Parse files without saving to database
5. ✅ Strict validation mode for pre-upload checking
6. ✅ Quality metrics display (total, paired, unpaired, score)
7. ✅ Detailed unpaired items table showing exactly what needs fixing
8. ✅ Per-person quality breakdown
9. ✅ Visual feedback with progress bars and badges
10. ✅ Enhanced categorization rules:
    - OPS_Hiring, OPS_Jobs, OPS_Reviews only valid on OPS projects
    - Detects keywords on wrong projects (Internal, R&D, Guiding)
    - Dual validation modes (strict for Review Buddy, lenient for Analytics)
11. ✅ Removed obsolete database-based endpoints and components
12. ✅ Updated documentation with comprehensive Review Buddy guide

### Deliverables:
- ✅ Review Buddy functional as pre-upload validation tool
- ✅ File upload and parsing working
- ✅ Strict validation catches all mistakes
- ✅ Unpaired items show full details for fixing in Costlocker
- ✅ Quality score accurate
- ✅ Works without saving to database
- ✅ Dual validation modes (strict/lenient) support both validation and analytics

### Verification:
1. ✅ Upload timesheet file - validates without database changes
2. ✅ Shows quality score and unpaired items
3. ✅ Detects OPS keywords on wrong projects
4. ✅ Monthly Detail still shows historical data correctly
5. ✅ Analytics use lenient mode, Review Buddy uses strict mode

### Git Commit:
- ✅ Commit: `9d69f84` - "feat: Add Review Buddy pre-upload validation tool with strict validation mode"
- ✅ Documentation updated in CLAUDE.md
- ✅ Pushed to GitHub

---

## Phase 8: Admin Panel
**Duration:** 2-3 hours  
**Goal:** Implement full admin panel with all management features

### Tasks:

#### 8.1 Admin Layout & Auth
1. Create admin layout: `app/admin/layout.tsx`
   - Check if user is team member
   - Show unauthorized if not
   - Tab navigation
2. Create admin dashboard landing page

#### 8.2 Team Members Management
1. Create page: `app/admin/team-members/page.tsx`
2. Display list of current team members
3. Implement "Add Member" functionality:
   - Modal with email input
   - Validation (@2fresh.cz only)
   - Add to database
4. Implement "Remove Member" functionality:
   - Confirmation dialog
   - Remove from database
5. Create API routes: `/api/admin/team-members`

#### 8.3 Planned FTE Management
1. Create page: `app/admin/planned-fte/page.tsx`
2. Display form with all team members
3. FTE input for each person (0-2, step 0.05)
4. Save changes to database
5. Log to audit log
6. Create API route: `/api/admin/fte`

#### 8.4 Activity Pairing
1. Create page: `app/admin/activity-pairing/page.tsx`
2. Display table of categories and keywords
3. Implement "Add Keyword" functionality:
   - Modal for category selection
   - Input for keyword
   - Save to database
4. Implement "Edit Keywords" functionality:
   - Textarea with keywords (one per line)
   - Save changes
5. Show warning about affecting historical data
6. Create API route: `/api/admin/keywords`

#### 8.5 Period Settings
1. Create page: `app/admin/settings/page.tsx`
2. Default period selector (radio buttons)
3. Data range inputs (from date)
4. Save to `settings` table
5. Create API route: `/api/admin/settings`

#### 8.6 Audit Log
1. Create page: `app/admin/audit-log/page.tsx`
2. Display table with all actions:
   - Timestamp, User, Action, Details, IP
3. Implement filtering:
   - By user
   - By action type
   - By date range
4. Implement pagination (50 per page)
5. Add CSV export functionality
6. Query audit log from database

### Deliverables:
- ✅ Admin Panel fully functional
- ✅ Only team members can access
- ✅ All management features working
- ✅ Audit log tracks all changes
- ✅ Changes reflect in dashboard immediately

### Verification:
1. Login as team member - access admin panel
2. Login as non-team member - see unauthorized
3. Add/remove team member - verify in database
4. Change FTE - see update in dashboard
5. Add keyword - verify categorization changes
6. Check audit log - see all actions recorded

---

## Phase 9: Notifications & Error Handling
**Duration:** 1 hour  
**Goal:** Implement notification system and polish error handling

### Tasks:

#### 9.1 Notification System
1. Implement banner component (already created in Phase 4)
2. Create notification logic:
   - Check for unpaired items
   - Check for FTE deviations (>30%)
   - Check for new team members in Costlocker
   - Check for API errors
3. Display banners in priority order
4. Implement dismiss functionality (temporary)
5. Add "Check in Review Buddy" link
6. Add "Go to Admin Panel" link

#### 9.2 Error Handling Polish
1. Improve Costlocker API error messages
2. Add loading states to all data fetching
3. Implement proper error boundaries
4. Add toast notifications for user actions
5. Handle missing data for months gracefully
6. Handle unknown projects
7. Improve validation error messages

#### 9.3 Loading States
1. Add loading skeletons for all major sections
2. Use Next.js `loading.tsx` files
3. Add loading spinners for interactive actions

### Deliverables:
- ✅ Notifications showing correctly
- ✅ All error states handled gracefully
- ✅ Loading states smooth
- ✅ User feedback clear

### Verification:
1. Trigger each notification type
2. Test API failure - see error banner
3. Test slow loading - see skeletons
4. Submit forms - see toast confirmations

---

## Phase 10: Testing, Polish & Deployment
**Duration:** 2-3 hours  
**Goal:** Test everything, fix bugs, deploy to production

### Tasks:

#### 10.1 Testing
1. Write unit tests for calculations
2. Test all API routes
3. Manual testing of all features:
   - All dashboard tabs
   - Monthly detail
   - Review Buddy
   - Admin Panel
4. Test dark mode on all pages
5. Test responsiveness (desktop + tablet)
6. Test with different date ranges
7. Test edge cases (no data, errors, etc.)

#### 10.2 Bug Fixes
1. Fix any bugs found during testing
2. Improve UI/UX issues
3. Optimize slow queries
4. Fix TypeScript errors

#### 10.3 Documentation
1. Update README.md with:
   - Setup instructions
   - Environment variables
   - How to run locally
   - How to deploy
2. Document any special considerations
3. Add troubleshooting section

#### 10.4 Deployment
1. Push code to GitHub
2. Connect Vercel to repository
3. Configure environment variables in Vercel
4. Deploy to production
5. Verify production deployment works
6. Test with real data in production

### Deliverables:
- ✅ All tests passing
- ✅ No critical bugs
- ✅ Documentation complete
- ✅ Deployed to production
- ✅ Production environment working

### Verification:
1. Run all tests - pass
2. Visit production URL
3. Test all features in production
4. Verify CSV/Excel upload works in production
5. Test with real Costlocker export file
6. Team can login and use app

---

## Summary of Phases

| Phase | Focus | Duration | Status | Output |
|-------|-------|----------|--------|--------|
| 0 | Project Setup | 30-60 min | ✅ COMPLETE | Running Next.js app |
| 1 | Database & Auth | 1-2 hours | ✅ COMPLETE | Login working, DB ready |
| 2 | CSV/Excel Upload | 2-3 hours | ✅ COMPLETE | Upload system working |
| 3 | Business Logic | 1-2 hours | ✅ COMPLETE | Calculations ready |
| 4 | UI Foundation | 1-2 hours | ✅ COMPLETE | Layout & components |
| 5 | Trend Dashboard | 2-3 hours | ✅ COMPLETE | All 4 tabs functional |
| 6 | Monthly Detail | 1-2 hours | ✅ COMPLETE | Detailed breakdown |
| 7 | Review Buddy | 1-2 hours | ✅ COMPLETE | Pre-upload validation |
| 8 | Admin Panel | 2-3 hours | 📋 NEXT | Full admin features |
| 9 | Notifications | 1 hour | 🔄 TODO | Polish & errors |
| 10 | Testing & Deploy | 2-3 hours | 🔄 TODO | Production ready |

**Total Estimated Time:** 15-23 hours of development
**Completed:** ~14 hours (Phases 0-7)
**Next Phase:** Phase 8 - Admin Panel

---

## Dependencies Between Phases

```
Phase 0 (Setup) ✅
    ↓
Phase 1 (DB & Auth) ✅
    ↓
Phase 2 (CSV/Excel Upload) ✅ ← Required for all data
    ↓
Phase 3 (Business Logic) ✅ ← Required for calculations
    ↓
Phase 4 (UI Foundation) ✅ ← Required for all pages
    ├─→ Phase 5 (Trend Dashboard) ✅
    ├─→ Phase 6 (Monthly Detail) ✅
    ├─→ Phase 7 (Review Buddy) ✅
    └─→ Phase 8 (Admin Panel) 📋 ← NEXT
         ↓
    Phase 9 (Notifications) 🔄
         ↓
    Phase 10 (Testing & Deploy) 🔄
```

**Current Status:** Phases 0-7 complete. Ready to begin Phase 8 (Admin Panel).

**Recent Completions:**
- ✅ Phase 7 (Review Buddy): Redesigned as pre-upload validation tool with strict validation mode
- ✅ Dual validation modes: Strict for Review Buddy, lenient for Analytics
- ✅ Enhanced categorization rules to detect keywords on wrong projects
- ✅ Documentation updated with comprehensive Review Buddy guide
- ✅ Git commit: 9d69f84 pushed to GitHub

---

## Notes for Implementation

### Starting Each Phase
1. Read the phase description completely
2. Check dependencies are complete
3. Review relevant PRD sections
4. Check CLAUDE.md for patterns
5. Create necessary files
6. Implement features
7. Test locally
8. Verify deliverables

### When Stuck
1. Check CLAUDE.md for patterns
2. Check existing similar code
3. Review PRD requirements
4. Check documentation links
5. Ask for clarification

### Before Moving to Next Phase
1. All deliverables complete
2. Verification steps pass
3. No critical bugs
4. Code committed to Git

---

**Ready to start implementation!** Begin with Phase 0.
