-- Create ignored_timesheets table
-- Stores timesheet entries that users want to exclude from analysis
-- Allows filtering out incorrect or irrelevant entries

CREATE TABLE IF NOT EXISTS ignored_timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who owns this timesheet
  costlocker_timesheet_id INTEGER NOT NULL, -- ID from Costlocker API
  person_name TEXT NOT NULL, -- Name of person who tracked the time
  project_name TEXT NOT NULL, -- Project name
  activity_name TEXT NOT NULL, -- Activity description
  date DATE NOT NULL, -- Date of the timesheet entry
  hours DECIMAL(5, 2) NOT NULL, -- Hours tracked
  reason TEXT, -- Optional reason for ignoring this entry
  ignored_at TIMESTAMPTZ DEFAULT NOW(), -- When this was ignored
  ignored_by UUID REFERENCES users(id), -- Who ignored this entry

  -- Unique constraint to prevent duplicate ignores
  CONSTRAINT unique_ignored_timesheet UNIQUE (user_id, costlocker_timesheet_id)
);

-- Create indexes for common queries
CREATE INDEX idx_ignored_timesheets_user_id ON ignored_timesheets(user_id);
CREATE INDEX idx_ignored_timesheets_costlocker_id ON ignored_timesheets(costlocker_timesheet_id);
CREATE INDEX idx_ignored_timesheets_date ON ignored_timesheets(date);
CREATE INDEX idx_ignored_timesheets_person_name ON ignored_timesheets(person_name);

-- Create composite index for filtering by user and date range
CREATE INDEX idx_ignored_timesheets_user_date ON ignored_timesheets(user_id, date);

-- Add RLS (Row Level Security) policies
ALTER TABLE ignored_timesheets ENABLE ROW LEVEL SECURITY;

-- Users can read their own ignored timesheets
CREATE POLICY ignored_timesheets_select_own
  ON ignored_timesheets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own ignored timesheets
CREATE POLICY ignored_timesheets_insert_own
  ON ignored_timesheets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own ignored timesheets
CREATE POLICY ignored_timesheets_delete_own
  ON ignored_timesheets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY ignored_timesheets_all_for_service_role
  ON ignored_timesheets
  FOR ALL
  USING (auth.role() = 'service_role');
