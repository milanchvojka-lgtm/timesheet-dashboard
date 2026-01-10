# Troubleshooting

## Excel Date Import Issues

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
   - Open the Excel file
   - Click on a date cell
   - Change format to "Number" (not "Date")
   - Check the serial number (e.g., Nov 1, 2025 = 45962)

2. **Use the debug page:**
   - Navigate to `/debug/parse-test`
   - Upload your Excel file
   - Click "Check Raw Excel"
   - Verify serial numbers are present

3. **Check the fix:**
   The `parseDate()` function in `/lib/upload/parser.ts` should:
   - Use UTC dates (prevents timezone shifts)
   - Account for Excel's 1900 leap year bug
   - Convert serial numbers correctly

**Fixed in:** Commit that updated `/lib/upload/parser.ts` to use UTC-based Excel serial date conversion.

---

## Activity Categorization Not Working

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

## Duplicate Entries After Re-upload

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
```bash
POST /api/admin/cleanup-duplicates
```

---

## FTE Values Don't Match Between Sections

**Problem:** FTE Trends "Average FTE" (2.34) doesn't match Personnel Performance "Total Actual FTE" (2.35)

**Root Cause:**

Rounding error caused by rounding each person's FTE before summing:

```typescript
// ❌ Wrong approach (causes 0.01 discrepancies)
Person 1: 100/160 = 0.625 → rounds to 0.63
Person 2: 120/160 = 0.75 → stays 0.75
Total = 0.63 + 0.75 = 1.38

// ✅ Correct approach
Total hours: 100 + 120 = 220
Total FTE: 220/160 = 1.375 → rounds to 1.38
```

**Solution:**

The Personnel Performance table now uses the correctly calculated `totalFTE` from the API:

```typescript
// app/api/analytics/team/route.ts
const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
const totalFTE = workingHours > 0 ? Number((totalHours / workingHours).toFixed(2)) : 0

return NextResponse.json({
  team,
  totalFTE, // Use this in UI, not sum of rounded values
})
```

Both sections now show identical values.

---

## Planned FTE Shows Wrong Historical Values

**Problem:** Viewing September 2025 shows Petra's current 0.5 FTE instead of her historical 0.4 FTE

**Root Cause:**

The API is querying only active FTE records (`valid_to IS NULL`) instead of using date-aware queries.

**Solution:**

Use date-aware queries that filter by the period being viewed:

```typescript
// Query records valid during the selected period
const { data: plannedFTEs } = await supabase
  .from('planned_fte')
  .select('*')
  .in('person_name', activeTrackers)
  .lte('valid_from', dateTo)
  .or(`valid_to.is.null,valid_to.gte.${dateFrom}`)

// Pick the record with latest valid_from <= dateTo
const validRecord = personRecords
  .filter((r) => r.valid_from <= dateTo)
  .sort((a, b) => b.valid_from.localeCompare(a.valid_from))[0]
```

**Files to check:**
- `app/api/analytics/fte-trends/route.ts`
- `app/api/analytics/team/route.ts`

---

## Admin UI Fails When Setting Historical FTE

**Problem:** Clicking "Update" for Petra with `valid_from = 2024-01-01` fails with "range lower bound must be less than or equal to range upper bound"

**Root Cause:**

The Admin UI is designed for creating **future** FTE changes, not historical ones. When you try to create a record in the past, it tries to close the current record (e.g., `valid_from = 2025-10-01`) with a `valid_to` date before it (e.g., `2024-01-01 - 1 day`), creating an invalid date range.

**Solution:**

Use SQL to set up historical FTE records:

```sql
-- First, delete existing records
DELETE FROM planned_fte WHERE person_name = 'Petra Panáková';

-- Insert historical records with proper date ranges
INSERT INTO planned_fte (person_name, fte_value, valid_from, valid_to, user_id)
VALUES
  ('Petra Panáková', 0.40, '2024-01-01', '2025-09-30', NULL),
  ('Petra Panáková', 0.50, '2025-10-01', NULL, NULL);
```

Run this in Supabase SQL Editor. The Admin UI can then be used for future FTE changes.

---

## Getting Help

### Documentation Resources

- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **NextAuth:** https://next-auth.js.org/
- **Tailwind:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org/

### When Stuck

1. Check this troubleshooting guide
2. Check relevant documentation in `/docs`
3. Check existing similar code
4. Search external documentation
5. Ask for clarification if unclear
