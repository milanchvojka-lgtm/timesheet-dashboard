-- Create planned_fte table
-- Stores planned FTE (Full-Time Equivalent) values for team members
-- Supports temporal tracking with valid_from/valid_to dates

-- Enable btree_gist extension for UUID exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS planned_fte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL, -- Name of the person
  fte_value DECIMAL(3, 2) NOT NULL CHECK (fte_value >= 0 AND fte_value <= 1), -- FTE value (0.00 to 1.00)
  valid_from DATE NOT NULL, -- Start date for this FTE value
  valid_to DATE, -- End date (NULL means current/active)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id), -- Admin who created this record

  -- Ensure no overlapping date ranges for the same user
  CONSTRAINT no_overlapping_dates EXCLUDE USING gist (
    user_id WITH =,
    daterange(valid_from, valid_to, '[]') WITH &&
  )
);

-- Create indexes for common queries
CREATE INDEX idx_planned_fte_user_id ON planned_fte(user_id);
CREATE INDEX idx_planned_fte_valid_to ON planned_fte(valid_to);
CREATE INDEX idx_planned_fte_valid_from ON planned_fte(valid_from);

-- Index for querying current FTE values (where valid_to IS NULL)
CREATE INDEX idx_planned_fte_current ON planned_fte(user_id, valid_to) WHERE valid_to IS NULL;

-- Create updated_at trigger
CREATE TRIGGER update_planned_fte_updated_at
  BEFORE UPDATE ON planned_fte
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE planned_fte ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read planned FTE data
CREATE POLICY planned_fte_select_authenticated
  ON planned_fte
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update/delete
CREATE POLICY planned_fte_all_for_service_role
  ON planned_fte
  FOR ALL
  USING (auth.role() = 'service_role');
