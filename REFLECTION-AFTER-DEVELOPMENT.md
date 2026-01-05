# Development Process Reflection

**Date:** 2026-01-05
**Project:** Timesheet Analytics Dashboard

This document reflects on the development process, identifies what caused rework, and provides recommendations for future projects.

---

## What Caused the Most Rework in This Project

### 1. Route Structure Changes
- Started with `/dashboard` route group
- Later moved to root-level routes (`/overview`, `/upload`, `/review-buddy`)
- This required updating: layouts, navigation, auth redirects, and all documentation

### 2. Page Hierarchy Evolution
- Initial structure wasn't clear about parent/child relationships
- Changed multiple times during development

### 3. Feature Scope Creep
- Debug pages were created then removed
- Landing page was built then converted to a redirect

---

## Recommendations for Next Time

### 1. Create a Route Map First (Before any code)

Start your PRD with a visual route structure:

```
PRD Section: Application Structure
================================

Route Hierarchy:
/
├── / (public - redirect based on auth)
├── /login (public)
├── /overview (protected - main analytics)
├── /upload (protected)
├── /review-buddy (protected)
├── /monthly-detail (protected)
├── /help (protected)
└── /admin
    ├── /admin/team-members
    ├── /admin/planned-fte
    ├── /admin/keywords
    ├── /admin/settings
    └── /admin/audit-log

Navigation Structure:
- Header: Logo, User Menu
- Main Nav: Overview, Upload, Review Buddy, Admin, Help
```

**Why this helps:**
- Forces you to think about information architecture upfront
- Makes it clear what's a parent/child vs sibling relationship
- Easy to spot if something doesn't fit
- Helps you see the navigation before building it

### 2. Write User Flows, Not Just Features

Instead of:
> "The app should have an upload feature"

Write:
> **User Flow: Upload Timesheet Data**
> 1. User clicks "Upload" in main navigation
> 2. User arrives at `/upload` page
> 3. User sees upload history at bottom of page
> 4. User drags CSV file to upload area
> 5. System validates and shows progress
> 6. System shows success message with stats
> 7. Upload appears in history list below
>
> **Key Question:** Should upload be under /dashboard/upload or /upload?
> **Decision:** /upload (root level) - it's a primary action, not nested

**Why this helps:**
- Forces you to think about URLs and page transitions
- Reveals navigation hierarchy naturally
- Helps you spot inconsistencies early
- Makes it clear what the "happy path" looks like

### 3. Create a "Page Inventory" Section in PRD

Add a table to your PRD:

| Page | Route | Auth | Parent | Purpose | Priority |
|------|-------|------|--------|---------|----------|
| Home | / | Public | - | Redirect to login/overview | P0 |
| Login | /login | Public | - | Google OAuth login | P0 |
| Overview | /overview | Protected | - | Main analytics dashboard | P0 |
| Upload | /upload | Protected | - | CSV/Excel import | P0 |
| Review Buddy | /review-buddy | Protected | - | Pre-upload validation | P1 |
| Admin Home | /admin | Protected | - | Admin panel landing | P1 |
| Team Members | /admin/team-members | Protected | /admin | Manage users | P1 |

**Why this helps:**
- Single source of truth for all pages
- See the full structure at a glance
- Easy to spot inconsistencies (is /help under /admin or root?)
- Priority column helps you build incrementally
- "Parent" column forces you to think about hierarchy

### 4. Define Core vs Optional Features Early

In your PRD, create two clear sections:

```markdown
## MVP (Must Have) - Phase 1
- Login with Google OAuth (@2fresh.cz only)
- Upload CSV/Excel files
- View upload history
- Basic analytics on /overview
- Admin: Team member management

## Nice to Have - Phase 2
- Review Buddy validation
- Monthly detail breakdown
- Advanced FTE planning
- Audit log

## Out of Scope
- Real-time Costlocker API integration
- Mobile app
- Multi-tenant support
```

**Why this helps:**
- Prevents scope creep
- You can build MVP first, validate it works, then add features
- Avoids building things you later remove
- Makes it clear what's a "stretch goal"

### 5. Include "Key Decisions" Section

Add a decisions log to your PRD as you plan:

```markdown
## Key Architectural Decisions

### Decision 1: Route Structure
**Question:** Should main pages be under /dashboard or at root level?
**Options:**
- A: /dashboard/overview, /dashboard/upload, /dashboard/review-buddy
- B: /overview, /upload, /review-buddy (with /dashboard removed)

**Decision:** Option B
**Rationale:** Simpler URLs, less nesting, these are primary actions not secondary

### Decision 2: Landing Page
**Question:** Should / show a landing page or redirect?
**Options:**
- A: Show marketing landing page
- B: Redirect to /login or /overview based on auth

**Decision:** Option B
**Rationale:** Internal tool, users go straight to app
```

**Why this helps:**
- Forces you to think through alternatives
- Documents why you chose something
- Prevents "I wonder why we did it this way" moments
- Makes it easier to change your mind early (when it's cheap)

### 6. Prototype Navigation First

Before writing any code, create a simple text-based navigation structure:

```markdown
## Navigation Mockup

Header:
[Logo] [Overview] [Upload] [Review Buddy] [Admin ▾] [Help]    [User Menu ▾]

When Admin clicked:
- Team Members
- Planned FTE
- Keywords
- Settings
- Audit Log

User Menu:
- [Username]
- Sign Out
```

**Why this helps:**
- See the full navigation before building
- Spot problems (too many items? unclear labels?)
- Easy to share with stakeholders
- Takes 5 minutes, saves hours of rework

### 7. Use a "Pages & Features Matrix"

Create a table showing which features appear on which pages:

| Feature | Overview | Upload | Review Buddy | Monthly Detail | Admin |
|---------|----------|--------|--------------|----------------|-------|
| Date Selector | ✅ | ❌ | ❌ | ✅ | ❌ |
| FTE Trends | ✅ | ❌ | ❌ | ❌ | ❌ |
| Upload History | ❌ | ✅ | ❌ | ❌ | ❌ |
| Quality Score | ❌ | ❌ | ✅ | ❌ | ❌ |
| Team Members | ❌ | ❌ | ❌ | ❌ | ✅ |

**Why this helps:**
- Prevents duplicate features across pages
- Shows which pages are "heavy" vs "light"
- Helps you see if a feature belongs on multiple pages
- Makes scope very concrete

---

## Recommended PRD Structure

For a **Next.js dashboard app** like this, use this PRD structure:

1. **Overview** (What & Why)
2. **User Personas & Goals**
3. **Route Map** ← Add this!
4. **Page Inventory Table** ← Add this!
5. **Navigation Mockup** ← Add this!
6. **Feature Specifications** (detailed)
7. **Key Decisions Log** ← Add this!
8. **Data Models**
9. **Tech Stack**
10. **MVP vs Phase 2** ← Add this!

---

## Example: What This Project's PRD Could Have Included

```markdown
# Route Map (decided upfront)

All main features at root level (no /dashboard group):
- / → redirect
- /login
- /overview (main dashboard)
- /upload
- /review-buddy
- /monthly-detail
- /help
- /admin/* (grouped because all admin features)

Rationale: Keep main features as siblings, not nested. Only group admin
because it's a distinct section with its own navigation.
```

If we had this upfront, we would have avoided:
- Creating /dashboard route group
- Moving pages from /dashboard to root
- Updating all documentation twice
- Changing auth redirects
- Updating navigation components

---

## The Golden Rule

**"If you can't draw it on paper, you're not ready to code it."**

Before starting implementation:
1. Draw the page structure on paper
2. Draw the navigation flow
3. List all pages in a table
4. Show it to someone and ask "Does this make sense?"

If you can't explain it clearly with a simple diagram, the structure isn't clear enough yet.

---

## What We Did Well

Don't discount these - several things were done right:

✅ **Clear data model** - The timesheet entry structure was well-defined
✅ **Authentication approach** - Google OAuth + team member allowlist was clear from the start
✅ **Upload logic** - CSV/Excel parsing requirements were solid
✅ **Activity categorization** - The rules for OPS vs Guiding vs Other were well thought out

The main issue was **navigation/route structure**, which is very common! Most rework in web apps comes from changing URL structure and page hierarchy.

---

## Start with Paper

Next time, before writing any PRD:
1. Get a piece of paper
2. Draw boxes for each page
3. Draw arrows showing how users navigate between them
4. Label each box with a URL
5. Take a photo and put it in your PRD

This 10-minute exercise will save you hours of rework.

---

## Key Takeaways

1. **Route structure is critical** - Decide upfront, document clearly
2. **Visual mockups are cheap** - Text/paper mockups take minutes, prevent hours of rework
3. **Page inventory table** - Single source of truth for all pages
4. **User flows over features** - Think about navigation paths, not just functionality
5. **MVP vs Phase 2** - Be ruthless about what's truly needed first
6. **Document decisions** - Write down why you chose something, not just what

---

## Template PRD Sections to Add

For your next project, include these sections in your PRD:

### Route Map
```
Visual hierarchy of all routes with auth requirements
```

### Page Inventory
```
| Page | Route | Auth | Parent | Purpose | Priority |
```

### Navigation Mockup
```
Text-based layout of header, nav, and menus
```

### Key Decisions
```
Question → Options → Decision → Rationale
```

### MVP Definition
```
Must Have / Nice to Have / Out of Scope
```

### Pages & Features Matrix
```
Which features appear on which pages
```

These six additions would have prevented most of the rework in this project.
