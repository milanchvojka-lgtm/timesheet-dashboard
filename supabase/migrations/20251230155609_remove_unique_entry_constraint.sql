-- Remove overly strict unique constraint
-- People can have multiple entries for same activity on same day
ALTER TABLE timesheet_entries 
DROP CONSTRAINT IF EXISTS unique_entry;

-- Optional: Add a more flexible constraint that prevents exact duplicates
-- (same person, activity, date, hours, description in same upload)
-- Commented out for now since it still might be too strict
-- ALTER TABLE timesheet_entries 
-- ADD CONSTRAINT unique_detailed_entry UNIQUE (
--   person_id, activity_id, date, hours, 
--   COALESCE(description, ''), upload_id
-- );
