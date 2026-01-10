# Data Processing & Calculations

## FTE Calculation

```typescript
// lib/calculations/fte.ts
export function calculateFTE(
  trackedHours: number,
  workingHoursInMonth: number
): number {
  return parseFloat((trackedHours / workingHoursInMonth).toFixed(2))
}
```

---

## Planned FTE & Temporal Versioning

The app tracks planned FTE (Full-Time Equivalent) for each team member with full temporal versioning support.

### Features

- Tracking FTE changes over time (e.g., Petra: 0.4 FTE → 0.5 FTE in October 2025)
- Handling team members who leave (e.g., Martin left end of May 2025)
- Showing historically accurate FTE values when viewing past periods

### Database Schema

```sql
CREATE TABLE planned_fte (
  id UUID PRIMARY KEY,
  person_name TEXT NOT NULL,
  fte_value DECIMAL(3, 2) NOT NULL CHECK (fte_value >= 0 AND fte_value <= 1),
  valid_from DATE NOT NULL,  -- Start date for this FTE value
  valid_to DATE,             -- End date (NULL = current/active)
  user_id UUID,
  created_at TIMESTAMPTZ,

  -- Prevent overlapping date ranges for same person
  CONSTRAINT no_overlapping_dates EXCLUDE USING gist (
    user_id WITH =,
    daterange(valid_from, valid_to, '[]') WITH &&
  )
);
```

### Date-Aware Querying

All FTE calculations use date-aware queries to fetch records valid during the selected period:

```typescript
// Query: valid_from <= dateTo AND (valid_to IS NULL OR valid_to >= dateFrom)
const { data: plannedFTEs } = await supabase
  .from('planned_fte')
  .select('*')
  .in('person_name', activeTrackers)
  .lte('valid_from', dateTo)
  .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

// For each person, pick the record with latest valid_from <= dateTo
const validRecord = personRecords
  .filter((r) => r.valid_from <= dateTo)
  .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]
```

### Setting Up Historical FTE Records

The Admin UI is designed for creating future FTE changes. For historical data, use SQL:

```sql
-- Example: Petra's FTE changed from 0.4 to 0.5 on Oct 1, 2025
INSERT INTO planned_fte (person_name, fte_value, valid_from, valid_to, user_id)
VALUES
  ('Petra Panáková', 0.40, '2024-01-01', '2025-09-30', NULL),
  ('Petra Panáková', 0.50, '2025-10-01', NULL, NULL);

-- Example: Martin left the team on May 31, 2025
INSERT INTO planned_fte (person_name, fte_value, valid_from, valid_to, user_id)
VALUES
  ('Martin Hrtánek', 0.50, '2024-01-01', '2025-05-31', NULL);
```

### Analytics Consistency

Both FTE Trends and Personnel Performance use identical date-aware logic:
- Only include people who actually tracked time in the period
- Query FTE records valid during the period
- For people with multiple records, use the one valid at period end

### CRITICAL - Rounding

To avoid rounding errors, always sum hours first, then divide:

```typescript
// ✅ CORRECT - Matches across all views
const totalFTE = (sumOfAllHours / workingHours).toFixed(2)

// ❌ WRONG - Causes 0.01 discrepancies
const totalFTE = people.map(p => (p.hours / workingHours).toFixed(2))
                       .reduce((sum, fte) => sum + fte)
```

This ensures FTE Trends "Average FTE" exactly matches Personnel Performance "Total Actual FTE".

---

## Working Days Calculation

- Use `date-holidays` library for Czech holidays
- Formula: `(weekdays - holidays) × 8 hours`
- Location: `lib/calculations/working-days.ts`

---

## Activity Categorization

Activity categorization matches timesheet entries to predefined categories using keywords. The system supports two validation modes:

### Validation Modes

- **Strict Mode** (`strictValidation: true`) - Used by Review Buddy for pre-upload validation
- **Lenient Mode** (`strictValidation: false`) - Used by Analytics/Reports for historical data

### Categorization Rules

1. **OPS_Hiring, OPS_Jobs, OPS_Reviews** - ONLY valid on OPS projects
   - Keywords: "hiring", "interview", "jobs", "job", "reviews", "review"
   - If found on any other project → Marked as `Unpaired` (strict mode) or flagged as mistake

2. **OPS_Guiding** - Valid on Guiding projects, general keywords
   - Valid on Guiding projects → Returns `OPS_Guiding`
   - On OPS projects → Returns `Unpaired` (strict mode) or `OPS_Guiding` (lenient mode)
   - On other projects (Internal, R&D, PR) → Ignored (not flagged)

3. **Fallback Rules:**
   - Guiding projects without keywords → Auto-categorized as `OPS_Guiding`
   - OPS projects without keywords → `Unpaired` (strict) or `OPS_Guiding` (lenient)
   - Other projects without OPS keywords → Categorized as `Other` (not tracked)

### Code Example

```typescript
// lib/calculations/activity-pairing.ts
export function categorizeActivity(
  activityName: string,
  description: string | null,
  projectName: string,
  keywords: ActivityKeyword[],
  strictValidation: boolean = false
): ActivityCategory {
  // Returns: 'OPS_Hiring' | 'OPS_Jobs' | 'OPS_Reviews' | 'OPS_Guiding' | 'Unpaired' | 'Other'
}

export function categorizeTimesheet(
  entries: Array<TimesheetEntry>,
  keywords: ActivityKeyword[],
  strictValidation: boolean = false
): CategorizedEntry[]
```

### Usage Examples

```typescript
// Review Buddy (strict validation)
const categorized = categorizeTimesheet(entries, keywords, true)

// Analytics/Monthly Detail (lenient validation)
const categorized = categorizeTimesheet(entries, keywords, false)
// or simply:
const categorized = categorizeTimesheet(entries, keywords)
```

---

## Project Name Mapping

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
