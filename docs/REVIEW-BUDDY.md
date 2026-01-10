# Review Buddy - Pre-Upload Validation

Review Buddy is a pre-upload validation tool that checks timesheet files BEFORE importing to the database. This ensures data quality and catches mistakes early.

---

## Purpose

- Validate CSV/Excel files without saving to database
- Detect entries with incorrect activity categorization
- Identify OPS-specific keywords used on wrong projects
- Show exactly which entries need fixing in Costlocker

---

## How It Works

1. **File Upload**: User uploads CSV/Excel file on `/review-buddy` page
2. **Parsing**: File is parsed using same logic as regular upload (`parseAndMapFile`)
3. **Project Categorization**: All entries are mapped to project categories (OPS, Guiding, Internal, R&D, PR, UX Maturity, Other)
4. **Activity Categorization**: Entries are categorized using **strict validation mode**
5. **Quality Metrics**: Calculate paired vs unpaired ratios
6. **Results Display**: Show overall quality score and detailed list of unpaired items

---

## Validation Logic

**Files Validated:**
- `app/api/review-buddy/validate-file/route.ts` - Main validation endpoint

**What Gets Flagged as Unpaired:**
1. OPS projects without specific keywords (Hiring, Jobs, Reviews)
2. Entries with "Jobs", "Hiring", or "Reviews" keywords on non-OPS projects (Guiding, Internal, R&D, PR)
3. OPS_Guiding keywords found on OPS projects (need specific category)

**What Doesn't Get Flagged:**
- Guiding projects (auto-categorized as OPS_Guiding)
- Internal, R&D, PR, UX Maturity projects without OPS keywords (categorized as `Other`)
- General keywords on non-OPS/Guiding projects (normal work, ignored)

---

## API Endpoint

```typescript
// POST /api/review-buddy/validate-file
// Accepts: multipart/form-data with file field
// Returns: Quality metrics + unpaired items list

interface ValidationResult {
  success: boolean
  filename: string
  totalEntries: number        // Only OPS/Guiding + mistakes
  pairedEntries: number
  unpairedEntries: number
  qualityScore: number        // (paired / total) × 100
  totalHours: number
  unpairedHours: number
  unpairedItems: UnpairedItem[]  // Detailed list for fixing
  people: PersonQuality[]        // Per-person breakdown
}
```

---

## Component Structure

```
components/review-buddy/
  review-buddy-view.tsx    # Main UI with file upload & results display
```

---

## User Workflow

1. Export timesheet from Costlocker as CSV/Excel
2. Go to Review Buddy page
3. Upload file for validation
4. Review quality score and unpaired items
5. Fix mistakes in Costlocker
6. Re-validate until quality score is 100%
7. Upload via regular Upload page

---

## Key Differences from Regular Upload

| Aspect | Regular Upload | Review Buddy |
|--------|---------------|--------------|
| **Purpose** | Import data to database | Validate before import |
| **Data Storage** | Saves to database | No database changes |
| **Validation** | Lenient (historical data) | Strict (catch mistakes) |
| **OPS without keywords** | Auto-categorize as OPS_Guiding | Flag as Unpaired |
| **Ignore functionality** | Available | Not needed |

---

## Important Notes

- Review Buddy uses **strict validation mode** (`strictValidation: true`)
- Analytics pages use **lenient validation mode** to show historical data properly
- The core categorization logic is shared (`lib/calculations/activity-pairing.ts`)
- Project category mapping is done dynamically using `config/projects.ts`
