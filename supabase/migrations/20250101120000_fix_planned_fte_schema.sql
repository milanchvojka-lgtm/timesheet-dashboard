-- Fix planned_fte table schema issues
-- 1. Make user_id optional (nullable) - not all people in timesheets are users
-- 2. Change FTE range from 0-1 to 0-2
-- 3. Remove overlapping dates constraint (too complex, not needed)

-- Drop existing constraint
ALTER TABLE planned_fte DROP CONSTRAINT IF EXISTS no_overlapping_dates;

-- Make user_id nullable
ALTER TABLE planned_fte ALTER COLUMN user_id DROP NOT NULL;

-- Drop old FTE value constraint
ALTER TABLE planned_fte DROP CONSTRAINT IF EXISTS planned_fte_fte_value_check;

-- Add new FTE value constraint (0 to 2)
ALTER TABLE planned_fte ADD CONSTRAINT planned_fte_fte_value_check
  CHECK (fte_value >= 0 AND fte_value <= 2);

-- Add comment
COMMENT ON COLUMN planned_fte.fte_value IS 'FTE value from 0.00 to 2.00 in increments of 0.05';
COMMENT ON COLUMN planned_fte.user_id IS 'Optional reference to users table - may be NULL for people not in the system';
