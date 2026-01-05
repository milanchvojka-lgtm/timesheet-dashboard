# Product Requirements Document: Timesheet Analytics Dashboard

**Version:** 1.0
**Date:** 2026-01-05
**Status:** Reference Implementation
**Author:** Based on actual implementation and learnings

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Personas & Goals](#2-user-personas--goals)
3. [Route Map](#3-route-map)
4. [Page Inventory](#4-page-inventory)
5. [Navigation Structure](#5-navigation-structure)
6. [Key Architectural Decisions](#6-key-architectural-decisions)
7. [MVP Definition](#7-mvp-definition)
8. [Feature Specifications](#8-feature-specifications)
9. [Pages & Features Matrix](#9-pages--features-matrix)
10. [Data Models](#10-data-models)
11. [Tech Stack](#11-tech-stack)
12. [Authentication & Authorization](#12-authentication--authorization)
13. [File Upload System](#13-file-upload-system)
14. [Analytics & Calculations](#14-analytics--calculations)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Success Metrics](#16-success-metrics)

---

## 1. Overview

### 1.1 Problem Statement

The 2FRESH design team tracks time in Costlocker, but lacks visibility into:
- Team capacity utilization (FTE tracking)
- Project time distribution
- OPS activity categorization (Hiring, Jobs, Reviews, Guiding)
- Data quality issues in timesheet entries

**Current Pain Points:**
- Manual export and analysis in Excel
- No historical FTE trend visualization
- Difficulty identifying miscategorized activities
- No pre-upload validation (errors discovered after import)

### 1.2 Solution

A Next.js web application that:
- Imports timesheet data via CSV/Excel upload (manual export from Costlocker)
- Provides analytics dashboard with FTE trends and project breakdowns
- Validates timesheet quality before database import (Review Buddy)
- Manages planned FTE values with temporal versioning
- Restricts access to @2fresh.cz team members only

### 1.3 Success Criteria

- ✅ Team members can upload 500+ row CSV files in <10 seconds
- ✅ 100% accurate FTE calculations (matches manual Excel calculations)
- ✅ Pre-upload validation catches 90%+ of categorization errors
- ✅ Historical FTE trends visible for any date range
- ✅ Only authorized @2fresh.cz users can access

### 1.4 Out of Scope

- ❌ Real-time Costlocker API integration (deprecated API)
- ❌ Mobile native applications
- ❌ Multi-company/tenant support
- ❌ Automated timesheet reminders
- ❌ Integration with other tools (Slack, Jira, etc.)
- ❌ Excel export functionality (Phase 2)
- ❌ Custom report builder (Phase 2)

---

## 2. User Personas & Goals

### Persona 1: Design Team Member
**Role:** Designer tracking their own time
**Goals:**
- Upload weekly/monthly timesheets from Costlocker
- See their own FTE contribution to projects
- Validate their entries are correctly categorized

**Key Scenarios:**
- Upload last month's data on the 1st of each month
- Check if their time was properly categorized
- Review their project distribution

### Persona 2: Team Lead / Manager
**Role:** Manager overseeing team capacity
**Goals:**
- Monitor team FTE utilization over time
- Track planned vs actual FTE
- Identify capacity issues early
- Ensure data quality before analysis

**Key Scenarios:**
- Weekly review of team FTE trends
- Quarterly capacity planning
- Monthly data quality checks
- Preparing reports for leadership

### Persona 3: Admin User
**Role:** HR or operations managing the system
**Goals:**
- Manage team member access (add/remove users)
- Update planned FTE when capacity changes
- Configure activity keywords for categorization
- Audit admin actions

**Key Scenarios:**
- Add new team member to allowlist
- Update FTE when someone goes part-time
- Add new activity keywords for categorization
- Review audit log for compliance

---

## 3. Route Map

### 3.1 Visual Hierarchy

```
Application Routes
==================

PUBLIC ROUTES:
/
├── /                                    (redirect to /login or /overview)
└── /login                               (Google OAuth login page)

PROTECTED ROUTES (require @2fresh.cz auth):
/
├── /overview                            (main analytics dashboard)
├── /upload                              (CSV/Excel upload + history)
├── /review-buddy                        (pre-upload validation)
├── /monthly-detail                      (detailed monthly breakdown)
├── /help                                (user documentation)
└── /admin                               (admin panel)
    ├── /admin                           (admin home/overview)
    ├── /admin/team-members              (manage user allowlist)
    ├── /admin/planned-fte               (FTE planning with history)
    ├── /admin/keywords                  (activity categorization rules)
    ├── /admin/settings                  (app configuration)
    └── /admin/audit-log                 (admin action history)

API ROUTES:
/api
├── /api/auth/[...nextauth]              (NextAuth.js handlers)
├── /api/analytics
│   ├── /api/analytics/overview          (overview metrics)
│   ├── /api/analytics/fte-trends        (FTE time series)
│   ├── /api/analytics/team              (personnel performance)
│   ├── /api/analytics/projects          (project breakdown)
│   └── /api/analytics/activities        (OPS activities)
├── /api/upload
│   ├── /api/upload/timesheet            (POST: upload file)
│   └── /api/upload/history              (GET: upload history)
├── /api/review-buddy
│   └── /api/review-buddy/validate-file  (POST: validate without save)
├── /api/admin
│   ├── /api/admin/team-members          (GET/POST/DELETE)
│   ├── /api/admin/fte                   (GET/POST: FTE values)
│   ├── /api/admin/fte/history           (GET: FTE history)
│   ├── /api/admin/keywords              (GET/POST/PUT/DELETE)
│   ├── /api/admin/settings              (GET/POST)
│   └── /api/admin/audit-log             (GET: audit entries)
├── /api/notifications                   (GET: user notifications)
└── /api/team/members                    (GET: team member list)
```

### 3.2 Route Rationale

**Why root-level routes for main features?**
- Simpler URLs (no unnecessary nesting)
- Main features are siblings, not hierarchically related
- Easier to share direct links
- Cleaner navigation structure

**Why group /admin routes?**
- Logically related administrative functions
- Separate navigation within admin section
- Clear permission boundary (all require admin check)
- Allows separate layout with admin-specific UI

**Why no /dashboard route group?**
- "Dashboard" is just one page (/overview)
- Upload, Review Buddy, Help are not "sub-dashboard" features
- They're primary application features at the same level

---

## 4. Page Inventory

Complete list of all pages with specifications:

| # | Page | Route | Auth | Layout | Parent | Purpose | Priority | Notes |
|---|------|-------|------|--------|--------|---------|----------|-------|
| 1 | Root | `/` | Public | Minimal | - | Redirect to /login (logged out) or /overview (logged in) | P0 | No UI, just redirect logic |
| 2 | Login | `/login` | Public | Auth layout | - | Google OAuth login, @2fresh.cz only | P0 | Shows Google sign-in button |
| 3 | Overview | `/overview` | Protected | Main layout | - | Analytics dashboard with FTE trends, team performance | P0 | Primary landing page after login |
| 4 | Upload | `/upload` | Protected | Main layout | - | CSV/Excel file upload + upload history | P0 | Drag-and-drop interface |
| 5 | Review Buddy | `/review-buddy` | Protected | Main layout | - | Pre-upload validation (no DB save) | P1 | Quality check before import |
| 6 | Monthly Detail | `/monthly-detail` | Protected | Main layout | - | Detailed monthly breakdown view | P1 | Deep-dive into specific period |
| 7 | Help | `/help` | Protected | Main layout | - | User documentation and guides | P1 | How-to guides, FAQs |
| 8 | Admin Home | `/admin` | Protected | Admin layout | - | Admin panel overview | P1 | Dashboard for admin functions |
| 9 | Team Members | `/admin/team-members` | Protected | Admin layout | /admin | Manage user allowlist (add/remove) | P1 | Only active team members |
| 10 | Planned FTE | `/admin/planned-fte` | Protected | Admin layout | /admin | Manage planned FTE with temporal versioning | P1 | Date ranges, history view |
| 11 | Keywords | `/admin/keywords` | Protected | Admin layout | /admin | Configure activity categorization keywords | P1 | CRUD for keywords |
| 12 | Settings | `/admin/settings` | Protected | Admin layout | /admin | App-wide settings (working hours, date ranges) | P1 | Key-value configuration |
| 13 | Audit Log | `/admin/audit-log` | Protected | Admin layout | /admin | View all admin actions with filtering | P1 | Read-only audit trail |

**Total Pages:** 13 (2 public, 11 protected)

### 4.1 Layout Components

**Main Layout** (`app/overview/layout.tsx`, `app/upload/layout.tsx`, etc.):
- Header with logo and user menu
- Main navigation bar (Overview, Upload, Review Buddy, Admin, Help)
- Auth check + redirect to /login if not authenticated
- Container with padding

**Admin Layout** (`app/admin/layout.tsx`):
- Extends main layout
- Additional admin-specific navigation (sidebar or tabs)
- Team member permission check
- Breadcrumbs for admin section

**Auth Layout** (`app/login/layout.tsx`):
- Minimal layout with centered content
- No navigation
- Logo and theme toggle only

---

## 5. Navigation Structure

### 5.1 Header (Present on all protected pages)

```
┌─────────────────────────────────────────────────────────────┐
│ [📊 Icon]  Overview  Upload  Review Buddy  Admin ▾  Help   │ [User ▾] [🌓]
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- Logo icon (bar chart) - links to /overview
- Main navigation links (always visible)
- Admin dropdown (shows when user is team member)
- User menu dropdown (name, email, sign out)
- Theme toggle (light/dark mode)

### 5.2 Main Navigation Links

| Label | Route | Icon | Description |
|-------|-------|------|-------------|
| Overview | `/overview` | TrendingUp | Main analytics dashboard |
| Upload | `/upload` | Upload | Import CSV/Excel files |
| Review Buddy | `/review-buddy` | CheckCircle | Validate before upload |
| Admin | `/admin` | Settings | Admin panel (dropdown) |
| Help | `/help` | HelpCircle | Documentation |

### 5.3 Admin Dropdown Menu

When "Admin" is clicked, show dropdown:

```
Admin ▾
  ├─ Team Members
  ├─ Planned FTE
  ├─ Keywords
  ├─ Settings
  └─ Audit Log
```

**Navigation Behavior:**
- Dropdown appears on hover or click
- Highlights current page when in admin section
- Mobile: Admin becomes expandable section

### 5.4 User Menu Dropdown

```
[User Avatar] John Doe ▾
  ├─ john.doe@2fresh.cz
  ├─ ──────────────────
  └─ Sign Out
```

### 5.5 Breadcrumbs (Admin Pages Only)

```
Admin / Team Members
Admin / Planned FTE
Admin / Keywords
Admin / Settings
Admin / Audit Log
```

### 5.6 Mobile Navigation

- Hamburger menu for mobile screens (< 768px)
- Full navigation in slide-out drawer
- Same structure as desktop

---

## 6. Key Architectural Decisions

### Decision 1: Route Structure

**Question:** Should main pages be under /dashboard or at root level?

**Options Considered:**
- **Option A:** `/dashboard/overview`, `/dashboard/upload`, `/dashboard/review-buddy`
  - Pro: Groups all authenticated pages
  - Con: Unnecessary nesting, longer URLs
  - Con: Not a true hierarchy (upload isn't "under" dashboard)

- **Option B:** `/overview`, `/upload`, `/review-buddy` (root level)
  - Pro: Simpler URLs, easier to remember
  - Pro: Reflects true relationship (siblings, not parent/child)
  - Pro: Easier to share direct links
  - Con: No visual grouping in file structure

**Decision:** **Option B** - Root level routes

**Rationale:**
- Main features are siblings (equal importance)
- No logical parent/child relationship
- Simpler mental model for users
- Only group /admin because those features ARE hierarchically related

---

### Decision 2: Landing Page Behavior

**Question:** Should / show a landing page or redirect?

**Options Considered:**
- **Option A:** Show marketing/info landing page
  - Pro: Opportunity to explain app purpose
  - Pro: Standard pattern for public apps
  - Con: Extra click to get to actual app
  - Con: This is an internal tool, not a marketing site

- **Option B:** Redirect to /login or /overview based on auth
  - Pro: Users go straight to the app
  - Pro: No unnecessary page load
  - Con: No place to show general info

**Decision:** **Option B** - Redirect based on auth

**Rationale:**
- Internal tool for known users
- Users want to get to work immediately
- Can put documentation in /help instead

---

### Decision 3: Data Import Method

**Question:** How should timesheet data be imported?

**Options Considered:**
- **Option A:** Direct Costlocker API integration
  - Pro: Real-time data, no manual export
  - Con: Costlocker REST API is deprecated
  - Con: GraphQL API requires complex OAuth2 flow
  - Con: API reliability concerns

- **Option B:** CSV/Excel file upload (manual export)
  - Pro: Simple, reliable, user-controlled
  - Pro: Works with existing Costlocker export
  - Pro: Users already familiar with export process
  - Con: Manual step required

**Decision:** **Option B** - CSV/Excel upload

**Rationale:**
- Costlocker API limitations and deprecation
- File upload is more reliable and testable
- Users already export data regularly
- Can add API integration in future if needed

---

### Decision 4: Authentication Method

**Question:** How should users authenticate?

**Options Considered:**
- **Option A:** Email/password with custom auth
  - Pro: Full control over auth flow
  - Con: Password management complexity
  - Con: Users prefer SSO

- **Option B:** Google OAuth with domain restriction
  - Pro: No password management needed
  - Pro: Users already have Google accounts
  - Pro: SSO familiar to users
  - Con: Dependency on Google

- **Option C:** NextAuth with Supabase adapter
  - Pro: Database session storage
  - Con: Complex setup, adapter issues in v5

- **Option D:** NextAuth with JWT sessions (no adapter)
  - Pro: Simpler setup, stateless
  - Pro: Works well with serverless
  - Con: User data cached in JWT

**Decision:** **Option B + D** - Google OAuth with JWT sessions

**Rationale:**
- Users already authenticated via Google
- @2fresh.cz domain restriction easy with Google
- JWT sessions simpler than adapter
- Fetch fresh user data from DB on each request

---

### Decision 5: Database Choice

**Question:** Which database should we use?

**Options Considered:**
- **Option A:** PostgreSQL (self-hosted)
  - Pro: Full control, no vendor lock-in
  - Con: Requires infrastructure management
  - Con: Backup/scaling complexity

- **Option B:** Supabase (managed PostgreSQL)
  - Pro: Managed database, auto backups
  - Pro: Great Next.js integration
  - Pro: Free tier sufficient for team size
  - Con: Vendor lock-in (mitigated by standard PostgreSQL)

**Decision:** **Option B** - Supabase

**Rationale:**
- Zero database management overhead
- Excellent developer experience
- Scales automatically within free tier
- Standard PostgreSQL (can migrate if needed)

---

### Decision 6: Activity Categorization Validation

**Question:** Should we validate activity categorization strictly or leniently?

**Options Considered:**
- **Option A:** Always strict validation (reject all ambiguous entries)
  - Pro: Forces correct categorization
  - Con: Can't import historical data with errors

- **Option B:** Always lenient validation (accept all entries)
  - Pro: Easy to import historical data
  - Con: Doesn't help improve data quality

- **Option C:** Dual mode - strict for pre-upload, lenient for analytics
  - Pro: Best of both worlds
  - Pro: Helps improve future data quality
  - Pro: Can analyze historical data

**Decision:** **Option C** - Dual validation modes

**Rationale:**
- Review Buddy uses strict mode (catches future mistakes)
- Analytics uses lenient mode (shows historical data)
- Flags mistakes without blocking analysis

---

### Decision 7: FTE Historical Tracking

**Question:** How should we handle FTE changes over time?

**Options Considered:**
- **Option A:** Single FTE value per person (current only)
  - Pro: Simplest data model
  - Con: Can't show accurate historical FTE
  - Con: Past periods show wrong planned FTE

- **Option B:** Temporal versioning (valid_from, valid_to)
  - Pro: Historically accurate FTE calculations
  - Pro: Tracks FTE changes over time
  - Con: More complex queries

**Decision:** **Option B** - Temporal versioning

**Rationale:**
- Need accurate historical FTE for trend analysis
- Handles team members leaving (valid_to date)
- Handles FTE changes (e.g., 0.4 → 0.5)
- Worth the query complexity for data accuracy

---

## 7. MVP Definition

### 7.1 MVP (Phase 1) - Must Have

**Core Authentication & Access:**
- ✅ Google OAuth login with @2fresh.cz restriction
- ✅ Team member allowlist (only invited users can log in)
- ✅ Protected routes with auth checks
- ✅ Logout functionality

**Data Import:**
- ✅ CSV file upload (PapaParse)
- ✅ Excel file upload (.xlsx, .xls via XLSX library)
- ✅ Flexible column name matching (Czech + English)
- ✅ Date format handling (ISO, Czech, Excel serial dates)
- ✅ Upload history with statistics
- ✅ Duplicate prevention (delete existing entries for date range)

**Core Analytics (Overview Page):**
- ✅ Period selector (Month, Quarter, Year, Custom)
- ✅ FTE Trends chart (multi-month periods)
- ✅ Team Performance metrics (Actual vs Planned FTE)
- ✅ Projects breakdown by category
- ✅ Personnel performance table with FTE calculations

**Admin Panel:**
- ✅ Team Members management (add/remove from allowlist)
- ✅ Planned FTE management with date ranges
- ✅ Activity Keywords management
- ✅ Basic settings (working hours, date range)

**Timeline:** 4-6 weeks
**Success Criteria:** Team can upload files and view FTE trends

---

### 7.2 Phase 2 - Nice to Have

**Enhanced Validation:**
- ✅ Review Buddy (pre-upload validation) - COMPLETED
- ✅ Quality score with unpaired items list - COMPLETED
- ✅ Per-person quality metrics - COMPLETED

**Enhanced Analytics:**
- ✅ Monthly Detail page with deep-dive - COMPLETED
- ✅ OPS Activities breakdown (Hiring/Jobs/Reviews) - COMPLETED
- ✅ Horizontal bar charts for comparisons - COMPLETED
- ⏳ Export filtered data to CSV
- ⏳ Custom date range comparisons
- ⏳ Trend annotations

**Admin Enhancements:**
- ✅ Audit log with filtering - COMPLETED
- ✅ FTE history view - COMPLETED
- ⏳ Bulk keyword import/export
- ⏳ User role management (beyond simple allowlist)

**User Experience:**
- ✅ Help page with comprehensive documentation - COMPLETED
- ⏳ Onboarding tour for new users
- ⏳ Notification system for data issues
- ⏳ Email reports (weekly summary)

**Timeline:** +2-3 weeks
**Success Criteria:** Data quality improves, users rely on tool for capacity planning

---

### 7.3 Phase 3 - Future Enhancements

**Advanced Analytics:**
- ⏳ Project profitability (if billable hours data available)
- ⏳ Capacity forecasting (ML-based predictions)
- ⏳ Team composition analysis (seniority mix)
- ⏳ Comparative benchmarks (team vs targets)

**Integrations:**
- ⏳ Slack notifications for data quality issues
- ⏳ Calendar integration (working days sync)
- ⏳ Jira integration (link activities to tickets)

**Scalability:**
- ⏳ Multi-company support
- ⏳ API for external tools
- ⏳ Mobile app (React Native)

**Timeline:** +4-6 weeks
**Success Criteria:** Tool becomes central to capacity planning process

---

### 7.4 Explicitly Out of Scope

**Never build these:**
- ❌ Costlocker API integration (deprecated, unreliable)
- ❌ Time tracking within the app (Costlocker is source of truth)
- ❌ Approval workflows (not needed for internal tool)
- ❌ Multi-language support (English + Czech labels only)
- ❌ Public API for external access (internal tool only)

---

## 8. Feature Specifications

### 8.1 Upload Feature

**Route:** `/upload`

**Purpose:** Import timesheet data from Costlocker CSV/Excel exports

**User Flow:**
1. User navigates to /upload
2. Sees upload area + upload history below
3. Drags CSV/Excel file to upload area (or clicks to browse)
4. File validates client-side (type, size)
5. File uploads to server
6. Server parses file (PapaParse for CSV, XLSX for Excel)
7. Server validates data (required fields, formats)
8. Server checks for existing data in date range
9. Server deletes existing entries for that date range
10. Server batch inserts new entries (1000 rows at a time)
11. Server creates upload_history record
12. User sees success message with statistics
13. Upload appears in history list

**UI Components:**
- Drag-and-drop upload zone
- File type badge (CSV/Excel)
- Upload progress indicator
- Success/error alert
- Upload history table with pagination

**Validation Rules:**
- File type: .csv, .xlsx, .xls only
- File size: Max 10MB
- Required columns: Date, Person, Project, Activity, Hours
- Date format: YYYY-MM-DD, DD. MM. YYYY, or Excel serial
- Hours: Positive number (comma or dot decimal separator)

**Error Handling:**
- Invalid file type → Show error, don't upload
- File too large → Show error with size limit
- Parse error → Show row number and issue
- Missing columns → List missing columns
- Database error → Show generic error, log details

**Success Metrics:**
- 500 rows processed in <10 seconds
- <1% parse failure rate
- Zero data loss on import

---

### 8.2 Review Buddy Feature

**Route:** `/review-buddy`

**Purpose:** Validate timesheet entries before import (quality check)

**User Flow:**
1. User navigates to /review-buddy
2. Sees upload area (no history, simpler than /upload)
3. Uploads CSV/Excel file
4. Server parses file (same as upload)
5. Server validates with STRICT mode
6. Server calculates quality metrics (paired vs unpaired ratio)
7. Server returns validation results (NO DATABASE SAVE)
8. User sees quality score (0-100%)
9. User sees list of unpaired items (mistakes to fix)
10. User sees per-person quality breakdown
11. User fixes mistakes in Costlocker
12. User re-validates until 100% quality
13. User goes to /upload to import

**UI Components:**
- Simple upload button (no drag-and-drop needed)
- Quality score gauge (0-100%)
- Unpaired items table with filters
- Per-person quality breakdown
- Action button: "Go to Upload" (after validation passes)

**Validation Mode: STRICT**
- OPS_Hiring/Jobs/Reviews keywords ONLY valid on OPS projects
- OPS_Guiding keywords must be on Guiding or OPS projects
- OPS projects without specific keywords → Unpaired
- Non-OPS projects with OPS-specific keywords → Unpaired (mistake)

**Quality Score Calculation:**
```
Quality Score = (Paired Entries / Total Entries) × 100
Only includes: OPS entries + Guiding entries + mistakes
Excludes: "Other" category (Internal, R&D, PR, UX without OPS keywords)
```

**Unpaired Items Display:**
- Date, Person, Project, Activity, Hours, Description
- Highlight WHY it's unpaired (reason column)
- Filter by person, project, date range
- Sort by any column
- Show max 100 items (pagination if more)

**Success Metrics:**
- Catches 90%+ of categorization errors
- Zero false positives (correctly paired entries flagged as unpaired)
- Users achieve 100% quality before uploading

---

### 8.3 Overview Feature

**Route:** `/overview`

**Purpose:** Main analytics dashboard with FTE trends and team metrics

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Overview                                                 │
│ Comprehensive team analytics and FTE tracking           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Period Selector:  [Month ▾] [November 2024 ▾] [Apply]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FTE Trends                     [Show in FTE] [Show in Hours] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Line Chart: Average FTE over time                   │ │
│ │ (Only shows for multi-month periods)                │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐
│ Total Hours      │  │ Total FTE        │  │ Working Days│
│ 1,234.5          │  │ 7.72             │  │ 160         │
└──────────────────┘  └──────────────────┘  └─────────────┘

┌─────────────────────────────────────────────────────────┐
│ Tabs: [Team] [Projects] [Personnel] [OPS Activities]   │
│                                                          │
│ [Content based on selected tab]                         │
└─────────────────────────────────────────────────────────┘
```

**Period Selector:**
- Dropdown: Month, Quarter, Year, Custom Range
- For Month/Quarter/Year: Date picker (select specific period)
- For Custom: Date range picker (from/to)
- "Apply" button to load data
- Shows data range limitation (earliest/latest date in database)

**FTE Trends Chart (Multi-month only):**
- Line chart showing Average Team FTE over time
- X-axis: Months
- Y-axis: FTE (0-10) or Hours (0-2000)
- Toggle: Show in FTE / Show in Hours
- Only visible when period > 1 month
- Tooltip on hover: Month, Average FTE, Total Hours

**Metric Tiles:**
- Total Hours: Sum of all hours in period
- Total FTE: Total hours ÷ working hours in period
- Working Days: Business days (excluding Czech holidays)

**Tab: Team**
- Total Actual FTE vs Total Planned FTE comparison
- Deviation percentage (actual vs planned)
- Average FTE per person
- Team composition (who tracked time)

**Tab: Projects**
- Table: Project Category, Hours, FTE, Percentage
- Categories: Internal, OPS, R&D, Guiding, PR, UX Maturity
- Chart: Horizontal bar chart of FTE by project
- Color-coded by project type

**Tab: Personnel**
- Table: Person, Actual FTE, Planned FTE, Deviation, Hours
- Chart: Dual horizontal bar (Actual vs Planned FTE)
- Filter: Only show main contributors (FTE ≥ 0.25)
- Sort by any column
- Deviation badge: Green (positive), Blue (minor negative), Pink (major negative)

**Tab: OPS Activities**
- Table: Activity, Hours, Percentage
- Categories: OPS_Hiring, OPS_Jobs, OPS_Reviews, OPS_Guiding, Unpaired
- Chart: Horizontal bar of hours by activity
- Only shows if period includes OPS time

**Success Metrics:**
- Page loads in <2 seconds for 6 months of data
- FTE calculations match manual Excel (100% accuracy)
- Chart renders smoothly with 12+ data points

---

### 8.4 Monthly Detail Feature

**Route:** `/monthly-detail`

**Purpose:** Deep-dive into a specific month with detailed breakdowns

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Monthly Detail                                           │
│ Detailed monthly timesheet analysis                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Month Selector: [◀ Prev] [November 2024 ▾] [Next ▶]    │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐
│ Total Hours      │  │ Total FTE        │  │ Working Days│
│ 1,234.5          │  │ 7.72             │  │ 160         │
└──────────────────┘  └──────────────────┘  └─────────────┘

┌─────────────────────────────────────────────────────────┐
│ Personnel Performance                                    │
│ ─────────────────────────────────────────────────────── │
│ Table: Person, Actual FTE, Planned FTE, Deviation       │
│ Chart: Dual-bar comparison (Actual vs Planned)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Projects Breakdown                                       │
│ ─────────────────────────────────────────────────────── │
│ Table: Project, Hours, FTE, Percentage                   │
│ Chart: Single-bar FTE by project                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ OPS Activities Breakdown                                 │
│ ─────────────────────────────────────────────────────── │
│ Table: Activity, Hours, Percentage                       │
│ Chart: Single-bar hours by activity                      │
└─────────────────────────────────────────────────────────┘
```

**Month Selector:**
- Previous/Next navigation arrows
- Dropdown to jump to specific month
- Shows available date range

**Sections:**
1. Personnel Performance (always shown)
2. Projects Breakdown (always shown)
3. OPS Activities (only if OPS hours > 0)

**Chart Specifications:**
- Personnel: Dual-bar (100px gap), filter FTE ≥ 0.25, colors: #F9C57C (actual), #B99EFB (planned)
- Projects: Single-bar, all projects, color: #7BD4B4
- OPS Activities: Single-bar, filter hours > 0, color: #78D3E6
- All charts: 60px per bar, labels at end, no tooltips

**Success Metrics:**
- Loads single month in <1 second
- All charts render correctly with 10+ items
- Charts match table data exactly

---

### 8.5 Admin: Team Members

**Route:** `/admin/team-members`

**Purpose:** Manage user allowlist (who can access the app)

**UI Components:**
- "Add Team Member" button (opens modal)
- Team members table (email, name, created date)
- Remove button per row
- Status badge: Active (green)

**Add Team Member Flow:**
1. Click "Add Team Member"
2. Modal opens with form
3. Enter email (required), name (optional)
4. Validate: Must be @2fresh.cz domain
5. Click "Add"
6. Backend checks if user exists
7. If exists: Set is_team_member = true
8. If new: Create user with is_team_member = true
9. Log to audit_log
10. Close modal, refresh table

**Remove Team Member Flow:**
1. Click "Remove" button
2. Confirm modal: "Remove [name] from team?"
3. Click "Confirm"
4. Backend sets is_team_member = false (soft delete)
5. Prevent self-removal
6. Log to audit_log
7. Refresh table

**Validation:**
- Email required
- Must end with @2fresh.cz
- Can't remove yourself

**Success Metrics:**
- Add/remove completes in <1 second
- All actions logged to audit_log

---

### 8.6 Admin: Planned FTE

**Route:** `/admin/planned-fte`

**Purpose:** Manage planned FTE values with temporal versioning

**UI Components:**
- Table: Person, FTE Value, Valid From, Valid To, Status
- "Update FTE" button per row (opens modal)
- "View History" button per row
- Filter: Active / Historical / All

**Data Model:**
```sql
planned_fte:
- id (UUID)
- person_name (TEXT)
- fte_value (DECIMAL 0.00-1.00)
- valid_from (DATE)
- valid_to (DATE, nullable)
- user_id (UUID, nullable)
- created_at, updated_at
```

**Update FTE Flow (Future Changes Only):**
1. Click "Update FTE" for person
2. Modal shows current FTE and valid_from
3. Enter new FTE value (0.00-1.00)
4. Enter valid_from date (must be future date)
5. Click "Save"
6. Backend closes current record (sets valid_to = new valid_from - 1)
7. Backend creates new record (valid_from = new date, valid_to = null)
8. Log to audit_log
9. Refresh table

**View History Flow:**
1. Click "View History" for person
2. Modal shows all FTE records for that person
3. Table: FTE Value, Valid From, Valid To, Updated By, Updated At
4. Sorted by valid_from descending

**Status Logic:**
- Active: valid_to IS NULL (currently valid)
- Historical: valid_to IS NOT NULL (ended)

**Date-Aware Queries:**
```sql
-- Get FTE for person on specific date
SELECT * FROM planned_fte
WHERE person_name = 'John Doe'
  AND valid_from <= '2024-11-15'
  AND (valid_to IS NULL OR valid_to >= '2024-11-15')
ORDER BY valid_from DESC
LIMIT 1
```

**Success Metrics:**
- Historical FTE queries return correct value for any past date
- Future FTE changes apply automatically on valid_from date

---

### 8.7 Admin: Keywords

**Route:** `/admin/keywords`

**Purpose:** Configure activity categorization keywords

**UI Components:**
- "Add Keyword" button
- Keywords table: Keyword, Category, Case Sensitive, Active
- Edit button per row
- Delete button per row
- Bulk actions: Deactivate selected, Delete selected

**Categories:**
- OPS_Hiring
- OPS_Jobs
- OPS_Reviews
- OPS_Guiding

**Add/Edit Keyword Flow:**
1. Click "Add Keyword" or "Edit"
2. Modal with form:
   - Keyword (text, required)
   - Category (dropdown, required)
   - Case Sensitive (checkbox, default: false)
   - Active (checkbox, default: true)
3. Click "Save"
4. Backend validates uniqueness
5. Insert/update keyword
6. Log to audit_log
7. Refresh table

**Delete Keyword Flow:**
1. Click "Delete"
2. Confirm: "Delete keyword '[keyword]'?"
3. Backend soft-deletes (is_active = false) or hard-deletes
4. Log to audit_log
5. Refresh table

**Matching Logic:**
- Case-insensitive by default (unless case_sensitive = true)
- Matches in activity_name OR description fields
- First matching keyword wins (ordered by id)

**Success Metrics:**
- Keywords apply immediately to new categorizations
- No impact on existing timesheet_entries (re-categorized on query)

---

### 8.8 Admin: Settings

**Route:** `/admin/settings`

**Purpose:** App-wide configuration

**Settings:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| working_hours_per_day | number | 8 | Hours per working day |
| default_period | string | monthly | Default period selector (monthly/quarterly/yearly) |
| data_range_start | date | 2024-01-01 | Earliest date with data (auto-detected) |
| data_range_end | date | 2024-12-31 | Latest date with data (auto-detected) |

**UI:**
- Form with setting inputs
- "Save" button (saves all at once)
- "Reset to Defaults" button

**Validation:**
- working_hours_per_day: 1-24
- default_period: one of [monthly, quarterly, yearly]
- data_range_start/end: valid date format (YYYY-MM-DD)

**Success Metrics:**
- Settings persist on page reload
- Changes apply immediately (no cache clear needed)

---

### 8.9 Admin: Audit Log

**Route:** `/admin/audit-log`

**Purpose:** View all admin actions for compliance

**UI Components:**
- Filters: Date range, User, Action type, Entity type
- Table: Timestamp, User, Action, Entity, Details
- Pagination: 50 per page
- Export to CSV button

**Data Captured:**
- user_email (who performed action)
- action (create_fte, update_fte, add_team_member, etc.)
- entity_type (planned_fte, user, keyword, setting)
- entity_id (UUID of affected record)
- details (JSON with old/new values)
- created_at (timestamp)

**Example Entries:**
```
2024-11-15 14:23 | john@2fresh.cz | add_team_member | user | jane@2fresh.cz
2024-11-15 14:25 | john@2fresh.cz | update_fte | planned_fte | {"person": "Jane", "old": 0.4, "new": 0.5}
2024-11-15 14:30 | john@2fresh.cz | create_keyword | keyword | {"keyword": "hiring", "category": "OPS_Hiring"}
```

**Filters:**
- Date range: Last 7 days / Last 30 days / Last 90 days / Custom
- User: Dropdown of all users who performed actions
- Action: Dropdown of action types
- Entity: Dropdown of entity types

**Success Metrics:**
- All admin actions logged (100% coverage)
- Logs retained for 1 year minimum
- Search/filter returns in <1 second

---

### 8.10 Help Feature

**Route:** `/help`

**Purpose:** User documentation and guides

**Sections:**
1. Getting Started
   - How to log in
   - First upload walkthrough
   - Understanding the overview

2. Upload Guide
   - How to export from Costlocker
   - Supported file formats
   - Date/number format handling
   - Troubleshooting upload errors

3. Review Buddy Guide
   - What is Review Buddy
   - How to validate entries
   - Understanding quality scores
   - Fixing unpaired items

4. Analytics Guide
   - Reading FTE trends
   - Understanding deviation
   - Project categorization
   - OPS activities breakdown

5. Admin Guide (team members only)
   - Managing team members
   - Planning FTE
   - Configuring keywords
   - Reading audit logs

6. FAQ
   - Common questions and answers

**UI:**
- Sidebar navigation (jump to sections)
- Collapsible sections
- Screenshots/diagrams
- Code examples
- Search functionality

**Success Metrics:**
- Users can find answers to common questions
- Reduces support requests by 50%

---

## 9. Pages & Features Matrix

Shows which features appear on which pages:

| Feature | Overview | Upload | Review Buddy | Monthly Detail | Admin | Help |
|---------|----------|--------|--------------|----------------|-------|------|
| Period Selector | ✅ Month/Quarter/Year/Custom | ❌ | ❌ | ✅ Month only | ❌ | ❌ |
| FTE Trends Chart | ✅ Multi-month | ❌ | ❌ | ❌ | ❌ | ❌ |
| Metric Tiles | ✅ Total Hours/FTE/Days | ❌ | ❌ | ✅ Total Hours/FTE/Days | ❌ | ❌ |
| Team Tab | ✅ Team metrics | ❌ | ❌ | ❌ | ❌ | ❌ |
| Projects Tab | ✅ Projects table | ❌ | ❌ | ✅ Projects section | ❌ | ❌ |
| Personnel Tab | ✅ Personnel table | ❌ | ❌ | ✅ Personnel section | ❌ | ❌ |
| OPS Activities Tab | ✅ Activities table | ❌ | ❌ | ✅ Activities section | ❌ | ❌ |
| File Upload | ❌ | ✅ Drag-and-drop | ✅ Browse button | ❌ | ❌ | ❌ |
| Upload History | ❌ | ✅ Table with stats | ❌ | ❌ | ❌ | ❌ |
| Quality Score | ❌ | ❌ | ✅ 0-100% gauge | ❌ | ❌ | ❌ |
| Unpaired Items | ❌ | ❌ | ✅ Table with filters | ❌ | ❌ | ❌ |
| Team Members Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ /team-members | ❌ |
| Planned FTE Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ /planned-fte | ❌ |
| Keywords Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ /keywords | ❌ |
| Settings Mgmt | ❌ | ❌ | ❌ | ❌ | ✅ /settings | ❌ |
| Audit Log | ❌ | ❌ | ❌ | ❌ | ✅ /audit-log | ❌ |
| Documentation | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ All guides |
| Horizontal Charts | ❌ | ❌ | ❌ | ✅ All 3 sections | ❌ | ❌ |
| Deviation Badges | ✅ Personnel tab | ❌ | ❌ | ✅ Personnel section | ❌ | ❌ |
| Navigation | ✅ | ✅ | ✅ | ✅ | ✅ Different | ❌ |

**Key Insights:**
- Overview is the most feature-rich page (7 features)
- Monthly Detail is similar to Overview but single-month focused
- Upload and Review Buddy share file upload logic but different validation
- Admin section has 5 separate pages (each focused)
- Help is standalone with no interactive features

---

## 10. Data Models

### 10.1 Database Schema

**Database:** PostgreSQL (via Supabase)

#### Table: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_team_member BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_team_member ON users(is_team_member);
```

**Notes:**
- is_team_member controls access (allowlist)
- Synced from Google OAuth on login
- Soft-delete via is_team_member = false

---

#### Table: timesheet_entries
```sql
CREATE TABLE timesheet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  person_id BIGINT NOT NULL,
  person_name TEXT NOT NULL,
  project_id BIGINT NOT NULL,
  project_name TEXT NOT NULL,
  activity_id BIGINT NOT NULL,
  activity_name TEXT NOT NULL,
  hours DECIMAL(10, 2) NOT NULL CHECK (hours > 0),
  description TEXT,
  is_billable BOOLEAN,
  upload_id UUID REFERENCES upload_history(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (CRITICAL for performance)
CREATE INDEX idx_timesheet_date ON timesheet_entries(date);
CREATE INDEX idx_timesheet_person_name ON timesheet_entries(person_name);
CREATE INDEX idx_timesheet_project_name ON timesheet_entries(project_name);
CREATE INDEX idx_timesheet_upload_id ON timesheet_entries(upload_id);
CREATE INDEX idx_timesheet_date_person ON timesheet_entries(date, person_name);

-- Composite index for common queries
CREATE INDEX idx_timesheet_analytics ON timesheet_entries(date, person_name, project_name);
```

**Notes:**
- No unique constraint (multiple entries per person/day allowed)
- person_id, project_id, activity_id are hash-generated from names
- upload_id links to upload_history (cascade delete)
- description can be NULL (optional column)

---

#### Table: upload_history
```sql
CREATE TABLE upload_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by_email TEXT NOT NULL,
  uploaded_by_name TEXT,
  total_rows INTEGER NOT NULL,
  successful_rows INTEGER NOT NULL,
  failed_rows INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
  data_date_from DATE,
  data_date_to DATE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_upload_history_uploaded_by ON upload_history(uploaded_by_email);
CREATE INDEX idx_upload_history_created_at ON upload_history(created_at DESC);
CREATE INDEX idx_upload_history_status ON upload_history(status);
```

**Notes:**
- Tracks every upload attempt
- data_date_from/to extracted from file
- Status lifecycle: processing → completed/failed/partial

---

#### Table: planned_fte
```sql
CREATE TABLE planned_fte (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_name TEXT NOT NULL,
  fte_value DECIMAL(3, 2) NOT NULL CHECK (fte_value >= 0 AND fte_value <= 1),
  valid_from DATE NOT NULL,
  valid_to DATE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Prevent overlapping date ranges for same person
  CONSTRAINT no_overlapping_dates EXCLUDE USING gist (
    person_name WITH =,
    daterange(valid_from, valid_to, '[]') WITH &&
  )
);

-- Indexes
CREATE INDEX idx_planned_fte_person ON planned_fte(person_name);
CREATE INDEX idx_planned_fte_valid_from ON planned_fte(valid_from);
CREATE INDEX idx_planned_fte_valid_to ON planned_fte(valid_to);
CREATE INDEX idx_planned_fte_temporal ON planned_fte(person_name, valid_from, valid_to);
```

**Notes:**
- Temporal versioning: valid_from/valid_to define date range
- valid_to = NULL means "currently active"
- Constraint prevents overlapping ranges for same person
- user_id can be NULL (for bulk imports)

**Query Pattern:**
```sql
-- Get FTE for person on specific date
SELECT * FROM planned_fte
WHERE person_name = 'John Doe'
  AND valid_from <= '2024-11-15'
  AND (valid_to IS NULL OR valid_to >= '2024-11-15')
ORDER BY valid_from DESC
LIMIT 1;
```

---

#### Table: activity_keywords
```sql
CREATE TABLE activity_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'OPS_Hiring', 'OPS_Jobs', 'OPS_Reviews', 'OPS_Guiding'
  )),
  case_sensitive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE(keyword, category)
);

-- Indexes
CREATE INDEX idx_keywords_category ON activity_keywords(category);
CREATE INDEX idx_keywords_active ON activity_keywords(is_active);
CREATE INDEX idx_keywords_keyword ON activity_keywords(LOWER(keyword));
```

**Notes:**
- Keywords stored lowercase for case-insensitive matching
- Multiple categories can have same keyword (different meanings)
- is_active allows soft-delete (deactivate without losing history)

---

#### Table: audit_log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_user_email ON audit_log(user_email);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_details ON audit_log USING gin(details);
```

**Notes:**
- Immutable (insert-only, no updates/deletes)
- details is JSONB for flexible storage
- All admin actions logged here

**Example Details:**
```json
{
  "person_name": "John Doe",
  "old_fte": 0.4,
  "new_fte": 0.5,
  "valid_from": "2024-12-01"
}
```

---

#### Table: settings
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  value_type TEXT NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'date')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_public ON settings(is_public);
```

**Notes:**
- Key-value store for app configuration
- value_type helps with parsing/validation
- is_public controls API exposure (all false for now)

---

#### Table: ignored_timesheets
```sql
CREATE TABLE ignored_timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_entry_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(timesheet_entry_id, user_id)
);

-- Indexes
CREATE INDEX idx_ignored_timesheets_user_id ON ignored_timesheets(user_id);
CREATE INDEX idx_ignored_timesheets_entry_id ON ignored_timesheets(timesheet_entry_id);
```

**Notes:**
- Allows users to hide specific entries from their view
- User-specific (other users still see the entry)
- Reason is optional explanation

---

### 10.2 TypeScript Interfaces

#### Timesheet Entry
```typescript
interface TimesheetEntry {
  id: string
  date: string // YYYY-MM-DD
  person_id: number
  person_name: string
  project_id: number
  project_name: string
  activity_id: number
  activity_name: string
  hours: number
  description: string | null
  is_billable: boolean | null
  upload_id: string
  created_at: string
}
```

#### Upload History
```typescript
interface UploadHistory {
  id: string
  filename: string
  file_size: number
  uploaded_by_email: string
  uploaded_by_name: string | null
  total_rows: number
  successful_rows: number
  failed_rows: number
  status: 'processing' | 'completed' | 'failed' | 'partial'
  data_date_from: string | null
  data_date_to: string | null
  error_message: string | null
  created_at: string
}
```

#### Planned FTE
```typescript
interface PlannedFTE {
  id: string
  person_name: string
  fte_value: number // 0.00-1.00
  valid_from: string // YYYY-MM-DD
  valid_to: string | null // YYYY-MM-DD or null
  user_id: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}
```

#### Activity Keyword
```typescript
interface ActivityKeyword {
  id: string
  keyword: string
  category: 'OPS_Hiring' | 'OPS_Jobs' | 'OPS_Reviews' | 'OPS_Guiding'
  case_sensitive: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}
```

#### Audit Log Entry
```typescript
interface AuditLogEntry {
  id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}
```

---

## 11. Tech Stack

### 11.1 Frontend

**Framework:**
- Next.js 14.2+ (App Router, React Server Components)

**Language:**
- TypeScript 5.3+ (strict mode enabled)

**Styling:**
- Tailwind CSS 3.4+
- shadcn/ui components (copy-paste, not npm package)
- next-themes for dark mode

**State Management:**
- React Server Components (server-side data fetching)
- URL state for filters/periods (searchParams)
- Local state with useState for UI only

**Charts:**
- Recharts 2.10+ (line charts, bar charts)
- Custom tooltips and labels

**Forms:**
- React Hook Form 7.48+ (form state management)
- Zod 3.22+ (validation schemas)

**File Upload:**
- Native HTML5 drag-and-drop
- PapaParse 5.4+ (CSV parsing)
- XLSX 0.18+ (Excel parsing)

---

### 11.2 Backend

**Framework:**
- Next.js API Routes (serverless functions)

**Database:**
- Supabase (managed PostgreSQL)
- Supabase JS Client 2.38+

**Authentication:**
- NextAuth.js v5 (beta)
- Google OAuth Provider
- JWT sessions (no database adapter)

**Admin Client:**
- CRITICAL: All database operations use `createServerAdminClient()`
- Why: NextAuth uses JWT, not Supabase Auth, so RLS doesn't work
- Regular client would be blocked by RLS policies

**File Processing:**
- PapaParse (CSV parsing, browser + Node.js)
- XLSX (Excel parsing)
- Node.js streams for large files

**Validation:**
- Zod schemas for API input validation
- Custom business logic validation

---

### 11.3 Infrastructure

**Hosting:**
- Vercel (free tier)
- Serverless functions for API routes
- Edge runtime for middleware
- Automatic deployments from GitHub

**Database:**
- Supabase (free tier)
- PostgreSQL 15+
- Auto backups, point-in-time recovery
- Connection pooling (PgBouncer)

**Environment:**
- Development: Local Next.js server + Supabase local
- Production: Vercel + Supabase cloud

**Monitoring:**
- Vercel Analytics (web vitals, performance)
- Supabase Dashboard (database metrics)
- Browser console errors (logged to server)

---

### 11.4 Development Tools

**Package Manager:**
- npm 10+ (lock file v3)

**Code Quality:**
- ESLint (Next.js config + TypeScript)
- Prettier (code formatting)
- Husky (pre-commit hooks) - optional

**Version Control:**
- Git
- GitHub
- Conventional commits

**IDE:**
- VS Code recommended
- Extensions: ESLint, Prettier, Tailwind IntelliSense

---

### 11.5 Libraries & Versions

```json
{
  "dependencies": {
    "next": "14.2.35",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "typescript": "5.3.3",
    "@supabase/supabase-js": "2.38.4",
    "next-auth": "5.0.0-beta.4",
    "@auth/supabase-adapter": "1.0.0",
    "papaparse": "5.4.1",
    "xlsx": "0.18.5",
    "recharts": "2.10.3",
    "react-hook-form": "7.48.2",
    "zod": "3.22.4",
    "@hookform/resolvers": "3.3.2",
    "next-themes": "0.2.1",
    "date-fns": "3.0.0",
    "date-holidays": "3.21.5"
  },
  "devDependencies": {
    "@types/node": "20.10.4",
    "@types/react": "18.2.42",
    "@types/react-dom": "18.2.17",
    "@types/papaparse": "5.3.14",
    "eslint": "8.55.0",
    "eslint-config-next": "14.2.35",
    "tailwindcss": "3.4.0",
    "postcss": "8.4.32",
    "autoprefixer": "10.4.16"
  }
}
```

---

## 12. Authentication & Authorization

### 12.1 Authentication Flow

```
User → Google OAuth → NextAuth → Session (JWT) → Protected Route
  ↓                                    ↓
  Check @2fresh.cz            Sync to Supabase users table
  ↓
  Check is_team_member = true
  ↓
  Grant access
```

**Step by Step:**
1. User clicks "Sign in with Google" on /login
2. Redirected to Google OAuth consent screen
3. Google verifies user is from @2fresh.cz domain (hd parameter)
4. User approves access (email, profile, avatar)
5. Callback to /api/auth/callback/google
6. NextAuth signIn callback runs:
   - Check email domain (@2fresh.cz)
   - Query Supabase for user with that email
   - Check is_team_member = true (allowlist)
   - If not in allowlist: return false (login rejected)
   - If in allowlist: update name/avatar, return true
7. NextAuth creates JWT session (no database session)
8. JWT stored in httpOnly cookie (secure)
9. User redirected to /overview

### 12.2 Session Management

**JWT Payload:**
```json
{
  "sub": "google-oauth-id",
  "email": "john@2fresh.cz",
  "name": "John Doe",
  "picture": "https://lh3.googleusercontent.com/...",
  "iat": 1699876543,
  "exp": 1702468543
}
```

**Session Duration:** 30 days (configurable)

**Session Refresh:** Automatic via NextAuth

**Why JWT instead of database sessions?**
- Simpler setup with NextAuth v5 + Supabase
- No adapter compatibility issues
- Serverless-friendly (no database writes per request)
- Users still synced to Supabase for app data

### 12.3 Authorization Levels

**Level 1: Public (no auth required)**
- / (redirect page)
- /login

**Level 2: Authenticated (any @2fresh.cz user in allowlist)**
- /overview
- /upload
- /review-buddy
- /monthly-detail
- /help

**Level 3: Team Member (is_team_member = true)**
- All Level 2 pages
- /admin/* (all admin pages)

**No Level 4:** All team members have same admin access (no roles)

### 12.4 Protected Route Pattern

```typescript
// app/overview/layout.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OverviewLayout({ children }) {
  const session = await auth()

  if (!session) {
    redirect('/login?callbackUrl=/overview')
  }

  return (
    <div>
      <Header user={session.user} />
      <Nav />
      <main>{children}</main>
    </div>
  )
}
```

### 12.5 API Route Protection

```typescript
// app/api/analytics/overview/route.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Fetch data using admin client
  const supabase = createServerAdminClient()
  const { data } = await supabase.from('timesheet_entries').select('*')

  return NextResponse.json({ data })
}
```

### 12.6 Logout Flow

**CRITICAL: Use server actions, NOT form POST**

```typescript
// app/actions/auth.ts
'use server'
import { signOut } from '@/lib/auth'

export async function handleSignOut() {
  await signOut({ redirectTo: '/login' })
}

// components/user-menu.tsx
'use client'
import { handleSignOut } from '@/app/actions/auth'

export function UserMenu() {
  return (
    <DropdownMenuItem onClick={() => handleSignOut()}>
      Sign Out
    </DropdownMenuItem>
  )
}
```

**Why server action?**
- NextAuth v5 CSRF protection requires server action
- Form POST causes CSRF token errors
- Server action is cleaner and more reliable

---

## 13. File Upload System

### 13.1 Supported Formats

| Format | Extension | Parser | Max Size |
|--------|-----------|--------|----------|
| CSV | .csv | PapaParse | 10MB |
| Excel 2007+ | .xlsx | XLSX | 10MB |
| Excel 97-2003 | .xls | XLSX | 10MB |

### 13.2 Column Name Mapping

The parser supports flexible column name matching (case-insensitive):

| Required Data | Czech | English Variants |
|--------------|-------|------------------|
| Date | Datum | date, day |
| Person | Osoba | person_name, name, user, person |
| Project | Projekt | project_name, project |
| Activity | Činnost, Úkol | activity_name, activity, task |
| Hours | Natrackováno | hours, duration, time, tracked |

**Optional Columns:**
- Description: Popis, description, note, comment
- Billable: Placené, billable, is_billable

### 13.3 Date Format Handling

**Supported Formats:**
1. ISO 8601: `2025-11-28` (YYYY-MM-DD)
2. Czech format: `28. 11. 2025` (DD. MM. YYYY with spaces and dots)
3. Excel serial date: `45962` (numeric days since 1900-01-01)

**Excel Serial Date Conversion (CRITICAL):**
```typescript
function parseExcelDate(serial: number): string {
  // Adjust for Excel's 1900 leap year bug
  if (serial > 59) {
    serial -= 1
  }

  // Excel's "January 0, 1900" = December 31, 1899 in JavaScript
  const baseDate = new Date(Date.UTC(1899, 11, 31))
  const milliseconds = serial * 86400000 // days to ms
  const date = new Date(baseDate.getTime() + milliseconds)

  // Use UTC to prevent timezone shifts
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
```

**Why UTC?**
- Prevents date shifts due to timezone offsets
- Nov 1 stays Nov 1, doesn't become Oct 31
- Ensures consistency across all users

**Why adjust for leap year bug?**
- Excel incorrectly treats 1900 as a leap year
- Serial dates > 59 are off by 1 day without adjustment

### 13.4 Number Format Handling

**Hours (decimal):**
- Supports comma: `0,25` (Czech)
- Supports dot: `0.25` (English)
- Parser: `parseFloat(value.replace(',', '.'))`

**Validation:**
- Must be positive number
- Max 24 hours per entry (sanity check)

### 13.5 ID Generation

Since Costlocker doesn't export database IDs, we generate consistent IDs from names:

```typescript
function generateIdFromString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Usage
const personId = generateIdFromString('John Doe')
const projectId = generateIdFromString('Design tým OPS_2025')
const activityId = generateIdFromString('Hiring')
```

**Benefits:**
- Same name always produces same ID
- Deterministic (repeatable)
- No need for ID mapping table
- Works with any export format

### 13.6 Upload Flow

```
Client                          Server                          Database
  │                               │                               │
  │ 1. Select file                │                               │
  ├─────────────────────────────→ │                               │
  │                               │ 2. Validate file              │
  │                               │    (type, size)               │
  │                               │                               │
  │                               │ 3. Parse file                 │
  │                               │    (PapaParse/XLSX)           │
  │                               │                               │
  │                               │ 4. Map columns                │
  │                               │    (Czech → English)          │
  │                               │                               │
  │                               │ 5. Validate data              │
  │                               │    (required fields, types)   │
  │                               │                               │
  │                               │ 6. Check date range           │
  │                               ├─────────────────────────────→ │
  │                               │ ← Get min/max dates           │
  │                               │                               │
  │                               │ 7. Delete existing            │
  │                               ├─────────────────────────────→ │
  │                               │ ← DELETE FROM timesheet_entries
  │                               │    WHERE date BETWEEN x AND y │
  │                               │                               │
  │                               │ 8. Create upload_history      │
  │                               ├─────────────────────────────→ │
  │                               │ ← INSERT INTO upload_history  │
  │                               │                               │
  │                               │ 9. Batch insert (1000/batch) │
  │                               ├─────────────────────────────→ │
  │                               │ ← INSERT INTO timesheet_entries
  │                               │                               │
  │                               │ 10. Update upload status      │
  │                               ├─────────────────────────────→ │
  │                               │ ← UPDATE upload_history       │
  │                               │                               │
  │ ← 11. Return success          │                               │
  ├───────────────────────────────┤                               │
  │                               │                               │
```

**Processing Time:**
- 100 rows: ~1 second
- 500 rows: ~5 seconds
- 1000 rows: ~10 seconds

### 13.7 Error Handling

**File Validation Errors:**
```json
{
  "error": "Invalid file type",
  "message": "Only CSV and Excel files are supported",
  "code": "INVALID_FILE_TYPE"
}
```

**Parse Errors:**
```json
{
  "error": "Parse error",
  "message": "Failed to parse CSV file",
  "details": "Row 42: Invalid date format",
  "code": "PARSE_ERROR"
}
```

**Validation Errors:**
```json
{
  "error": "Validation failed",
  "message": "10 rows have validation errors",
  "errors": [
    { "row": 5, "field": "date", "message": "Invalid date format" },
    { "row": 12, "field": "hours", "message": "Hours must be positive" }
  ],
  "code": "VALIDATION_ERROR"
}
```

**Database Errors:**
```json
{
  "error": "Import failed",
  "message": "Failed to save data to database",
  "code": "DATABASE_ERROR"
}
```

---

## 14. Analytics & Calculations

### 14.1 FTE Calculation

**Formula:**
```
FTE = Total Hours ÷ Working Hours in Period
```

**Example (Single Month):**
```
November 2024:
- Working days: 20
- Working hours: 20 × 8 = 160
- Person tracked: 120 hours
- FTE = 120 ÷ 160 = 0.75
```

**Example (Quarter):**
```
Q4 2024 (Oct, Nov, Dec):
- October: 23 days × 8 = 184 hours
- November: 20 days × 8 = 160 hours
- December: 21 days × 8 = 168 hours
- Total working hours: 512
- Person tracked: 384 hours
- FTE = 384 ÷ 512 = 0.75
```

**CRITICAL: Rounding Rule**
```typescript
// ✅ CORRECT: Sum hours first, then divide
const totalFTE = Number((totalHours / workingHours).toFixed(2))

// ❌ WRONG: Round individual FTEs, then sum (causes 0.01 errors)
const totalFTE = people
  .map(p => Number((p.hours / workingHours).toFixed(2)))
  .reduce((sum, fte) => sum + fte, 0)
```

### 14.2 Working Days Calculation

**Czech Holidays (2024-2026):**
- New Year's Day (Jan 1)
- Easter Monday (varies)
- Labour Day (May 1)
- Liberation Day (May 8)
- Saints Cyril and Methodius Day (Jul 5)
- Jan Hus Day (Jul 6)
- Czech Statehood Day (Sep 28)
- Independent Czechoslovak State Day (Oct 28)
- Struggle for Freedom and Democracy Day (Nov 17)
- Christmas Eve (Dec 24)
- Christmas Day (Dec 25)
- St. Stephen's Day (Dec 26)

**Library:** `date-holidays` (npm package)

**Calculation:**
```typescript
import Holidays from 'date-holidays'

function getWorkingDays(startDate: Date, endDate: Date): number {
  const hd = new Holidays('CZ')
  let workingDays = 0

  const current = new Date(startDate)
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isHoliday = hd.isHoliday(current)

    if (!isWeekend && !isHoliday) {
      workingDays++
    }

    current.setDate(current.getDate() + 1)
  }

  return workingDays
}

function getWorkingHours(startDate: Date, endDate: Date): number {
  return getWorkingDays(startDate, endDate) * 8
}
```

### 14.3 Project Categorization

**Mapping Logic:**
```typescript
const PROJECT_MAPPING: Record<string, ProjectCategory> = {
  // OPS projects
  'Design tým OPS_2025': 'OPS',
  'Design tým OPS_2024': 'OPS',
  'Design tým OPS': 'OPS',

  // Guiding projects
  'Design tým Guiding_2025': 'Guiding',
  'Design tým Guiding_2024': 'Guiding',

  // Internal projects
  'Design tým Interní_2025': 'Internal',
  'Design tým Interní_2024': 'Internal',
  'Design tým Internal': 'Internal',

  // R&D projects
  'Design tým R&D_2025': 'R&D',
  'Design tým R&D_2024': 'R&D',

  // PR projects
  'Design tým PR_2025': 'PR',
  'Design tým PR_2024': 'PR',

  // UX Maturity
  'UX Maturity_2025': 'UX Maturity',
  'UX Maturity_2024': 'UX Maturity',
}

type ProjectCategory =
  | 'OPS'
  | 'Guiding'
  | 'Internal'
  | 'R&D'
  | 'PR'
  | 'UX Maturity'
  | 'Other'

function categorizeProject(projectName: string): ProjectCategory {
  return PROJECT_MAPPING[projectName] || 'Other'
}
```

**Fallback:** Any unmapped project → "Other"

### 14.4 Activity Categorization

**Categories:**
- OPS_Hiring: Interviews, candidate screening, recruitment
- OPS_Jobs: Job postings, job descriptions, talent pool
- OPS_Reviews: Performance reviews, feedback sessions
- OPS_Guiding: Mentoring, coaching, guidance, consultations
- Unpaired: OPS entries without keywords
- Other: Non-OPS entries (ignored in quality metrics)

**Dual Validation Modes:**

**Strict Mode (Review Buddy):**
```typescript
function categorizeActivity(
  activityName: string,
  description: string | null,
  projectName: string,
  keywords: ActivityKeyword[],
  strictValidation: boolean = true
): ActivityCategory {
  const projectCategory = categorizeProject(projectName)
  const text = `${activityName} ${description || ''}`.toLowerCase()

  // Check keywords
  for (const kw of keywords) {
    const keywordLower = kw.keyword.toLowerCase()
    if (text.includes(keywordLower)) {
      // Strict: OPS-specific keywords ONLY on OPS projects
      if (kw.category !== 'OPS_Guiding') {
        if (projectCategory !== 'OPS') {
          return 'Unpaired' // Mistake: wrong project
        }
      }

      // Guiding keywords on Guiding projects
      if (kw.category === 'OPS_Guiding') {
        if (projectCategory === 'Guiding') {
          return 'OPS_Guiding'
        }
        if (projectCategory === 'OPS') {
          return 'Unpaired' // Need specific category
        }
      }

      return kw.category
    }
  }

  // Fallback: Guiding projects without keywords
  if (projectCategory === 'Guiding') {
    return 'OPS_Guiding'
  }

  // Fallback: OPS projects without keywords
  if (projectCategory === 'OPS') {
    return 'Unpaired'
  }

  // Other projects
  return 'Other'
}
```

**Lenient Mode (Analytics):**
- Same as strict, but OPS_Guiding keywords on OPS → OPS_Guiding
- Allows historical data with ambiguous categorization

### 14.5 Deviation Calculation

**Formula:**
```
Deviation = ((Actual FTE - Planned FTE) / Planned FTE) × 100
```

**Example:**
```
Planned: 0.50 FTE
Actual: 0.45 FTE
Deviation = ((0.45 - 0.50) / 0.50) × 100 = -10%
```

**Badge Colors:**
- Positive (≥ 0%): Green (#7BD4B4)
- Minor negative (-0.01% to -20%): Blue (#8AB5FA)
- Major negative (< -20%): Pink (#EB4899)

### 14.6 Temporal FTE Queries

**Date-Aware FTE Lookup:**
```typescript
async function getPlannedFTE(
  personName: string,
  date: string
): Promise<number | null> {
  const { data } = await supabase
    .from('planned_fte')
    .select('fte_value')
    .eq('person_name', personName)
    .lte('valid_from', date)
    .or(`valid_to.is.null,valid_to.gte.${date}`)
    .order('valid_from', { ascending: false })
    .limit(1)
    .single()

  return data?.fte_value ?? null
}
```

**For Period (e.g., November 2024):**
```typescript
async function getPlannedFTEForPeriod(
  personName: string,
  dateFrom: string,
  dateTo: string
): Promise<number | null> {
  // Get all records that overlap with the period
  const { data: records } = await supabase
    .from('planned_fte')
    .select('*')
    .eq('person_name', personName)
    .lte('valid_from', dateTo)
    .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

  if (!records || records.length === 0) return null

  // Pick record valid at period end
  const validRecord = records
    .filter(r => r.valid_from <= dateTo)
    .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]

  return validRecord?.fte_value ?? null
}
```

---

## 15. Non-Functional Requirements

### 15.1 Performance

**Page Load Times:**
- Overview (6 months): < 2 seconds
- Monthly Detail: < 1 second
- Upload page: < 500ms
- Admin pages: < 1 second

**Upload Processing:**
- 100 rows: < 1 second
- 500 rows: < 5 seconds
- 1000 rows: < 10 seconds

**Database Queries:**
- Analytics queries: < 500ms
- Admin queries: < 200ms
- Authentication: < 100ms

### 15.2 Scalability

**Data Volume:**
- 10,000 timesheet entries (1 year for 10-person team)
- 100 upload history records
- 50 planned FTE records
- 100 activity keywords
- 1,000 audit log entries

**Concurrent Users:**
- 10 concurrent users (team size)
- 5 concurrent uploads

**Database Connection Pool:**
- Max connections: 15 (Supabase free tier)
- Connection pooling via PgBouncer

### 15.3 Security

**Authentication:**
- Google OAuth with domain restriction
- JWT sessions with httpOnly cookies
- Session expiry: 30 days
- CSRF protection via NextAuth

**Authorization:**
- Allowlist-based (is_team_member check)
- Server-side auth checks on all routes
- API routes require valid session

**Data Protection:**
- No sensitive data stored (just timesheet hours)
- Database hosted in EU (GDPR compliance)
- Supabase automatic backups
- No client-side storage of auth tokens

**Input Validation:**
- All API inputs validated with Zod
- SQL injection prevented (parameterized queries)
- XSS prevented (React escapes by default)
- File upload size limits (10MB)

### 15.4 Accessibility

**WCAG 2.1 Level AA:**
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators visible
- Color contrast ratios ≥ 4.5:1

**Screen Reader Support:**
- Table headers properly labeled
- Form inputs have labels
- Error messages announced
- Loading states announced

### 15.5 Browser Support

**Supported Browsers:**
- Chrome 100+ ✅
- Firefox 100+ ✅
- Safari 15+ ✅
- Edge 100+ ✅

**Mobile Browsers:**
- Mobile Safari (iOS 15+) ✅
- Chrome Mobile (Android) ✅

**Not Supported:**
- Internet Explorer ❌
- Opera Mini ❌

### 15.6 Error Recovery

**Upload Failures:**
- Show error message with specific issue
- Allow retry without losing file selection
- Log error to server for debugging

**Network Failures:**
- Show "Connection lost" message
- Automatic retry for transient failures
- Manual retry button for user

**Database Failures:**
- Graceful degradation (show cached data if available)
- Error message with contact support option
- Log errors to Vercel/Supabase

---

## 16. Success Metrics

### 16.1 Adoption Metrics

**Target:** 100% of design team using within 1 month

**Metrics:**
- Weekly active users: 10/10 team members
- Average uploads per week: 4+ (one per team member)
- Upload success rate: >95%

### 16.2 Data Quality Metrics

**Target:** 90%+ quality score before upload

**Metrics:**
- Review Buddy usage: 50%+ of uploads validated first
- Pre-validation quality score: 70% average
- Post-validation quality score: 95% average
- Reduction in unpaired items: 50% month-over-month

### 16.3 Performance Metrics

**Target:** Fast, reliable uploads

**Metrics:**
- Upload processing time: <10s for 500 rows
- Page load time: <2s for overview
- API response time: <500ms for analytics
- Zero data loss on upload

### 16.4 Usage Metrics

**Target:** Tool becomes primary capacity planning resource

**Metrics:**
- Monthly active users: 100% of team
- Average session duration: 10+ minutes
- Pages per session: 5+ pages
- Repeat usage: Weekly for managers, monthly for team members

### 16.5 Business Impact Metrics

**Target:** Improve capacity planning accuracy

**Metrics:**
- Time saved vs Excel: 80% reduction (5 min vs 25 min)
- FTE prediction accuracy: ±10% of actual
- Capacity issues identified: 2 weeks advance notice
- Manager satisfaction: 9/10 rating

---

## Appendix A: API Endpoints Reference

### Analytics Endpoints

```
GET /api/analytics/overview
  Query: dateFrom, dateTo
  Returns: { totalHours, totalFTE, workingDays, workingHours }

GET /api/analytics/fte-trends
  Query: dateFrom, dateTo
  Returns: { trends: [{ month, avgFTE, totalHours }] }

GET /api/analytics/team
  Query: dateFrom, dateTo
  Returns: { team: [{ person, actualFTE, plannedFTE, deviation }] }

GET /api/analytics/projects
  Query: dateFrom, dateTo
  Returns: { projects: [{ category, hours, fte, percentage }] }

GET /api/analytics/activities
  Query: dateFrom, dateTo
  Returns: { activities: [{ category, hours, percentage }] }
```

### Upload Endpoints

```
POST /api/upload/timesheet
  Body: FormData { file }
  Returns: { success, upload_id, total_rows, successful_rows, failed_rows }

GET /api/upload/history
  Returns: { history: [{ id, filename, status, created_at, ... }] }
```

### Review Buddy Endpoints

```
POST /api/review-buddy/validate-file
  Body: FormData { file }
  Returns: { success, qualityScore, unpairedItems, people }
```

### Admin Endpoints

```
GET /api/admin/team-members
  Returns: { users: [{ id, email, name, is_team_member }] }

POST /api/admin/team-members
  Body: { email, name? }
  Returns: { success, user }

DELETE /api/admin/team-members
  Body: { userId }
  Returns: { success }

GET /api/admin/fte
  Returns: { fte_records: [{ id, person_name, fte_value, valid_from, valid_to }] }

POST /api/admin/fte
  Body: { personName, fteValue, validFrom }
  Returns: { success, record }

GET /api/admin/fte/history
  Query: personName
  Returns: { history: [{ fte_value, valid_from, valid_to, updated_by }] }

GET /api/admin/keywords
  Returns: { keywords: [{ id, keyword, category, is_active }] }

POST /api/admin/keywords
  Body: { keyword, category, case_sensitive?, is_active? }
  Returns: { success, keyword }

PUT /api/admin/keywords
  Body: { id, keyword?, category?, case_sensitive?, is_active? }
  Returns: { success, keyword }

DELETE /api/admin/keywords
  Body: { id }
  Returns: { success }

GET /api/admin/settings
  Returns: { settings: { key: value } }

POST /api/admin/settings
  Body: { key, value }
  Returns: { success, setting }

GET /api/admin/audit-log
  Query: dateFrom?, dateTo?, user?, action?, entityType?
  Returns: { logs: [{ user_email, action, entity_type, details, created_at }] }
```

---

## Appendix B: Environment Variables

```bash
# Next.js
NEXT_PUBLIC_APP_URL=https://timesheet-dashboard.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# NextAuth
NEXTAUTH_URL=https://timesheet-dashboard.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Costlocker (optional, not used)
COSTLOCKER_API_URL=https://api.costlocker.com
COSTLOCKER_API_TOKEN=xxx
```

---

## Appendix C: Deployment Checklist

**Pre-Deployment:**
- [ ] All environment variables set in Vercel
- [ ] Google OAuth redirect URIs updated with production URL
- [ ] Supabase database migrations applied
- [ ] At least one user added to allowlist (is_team_member = true)
- [ ] Test upload with sample CSV file
- [ ] Verify analytics calculations match Excel

**Deployment:**
- [ ] Push to main branch (triggers Vercel deploy)
- [ ] Wait for build to complete (~2 minutes)
- [ ] Check deployment logs for errors

**Post-Deployment:**
- [ ] Test login with @2fresh.cz account
- [ ] Test upload functionality
- [ ] Test analytics pages load
- [ ] Test admin panel access
- [ ] Verify no console errors

**Rollback Plan:**
- [ ] Revert to previous Vercel deployment
- [ ] Check database state (migrations may need manual rollback)

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-05 | Complete PRD based on actual implementation | Generated from learnings |

---

**END OF DOCUMENT**
