-- Create timesheet_entries table
-- Stores uploaded timesheet data from Costlocker CSV/Excel exports

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Person information
  person_id INTEGER NOT NULL,
  person_name TEXT NOT NULL,
  person_email TEXT,

  -- Project information
  project_id INTEGER NOT NULL,
  project_name TEXT NOT NULL,
  project_category TEXT NOT NULL, -- Mapped category (OPS, Internal, R&D, etc.)

  -- Activity information
  activity_id INTEGER NOT NULL,
  activity_name TEXT NOT NULL,

  -- Time tracking
  date DATE NOT NULL,
  hours DECIMAL(10, 2) NOT NULL CHECK (hours >= 0),
  description TEXT,

  -- Status
  approved BOOLEAN DEFAULT false,
  billable BOOLEAN DEFAULT false,

  -- Upload tracking
  upload_id UUID REFERENCES upload_history(id) ON DELETE CASCADE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Composite index for common queries
  CONSTRAINT unique_entry UNIQUE (person_id, activity_id, date, upload_id)
);

-- Create indexes for performance
CREATE INDEX idx_timesheet_entries_person_id ON timesheet_entries(person_id);
CREATE INDEX idx_timesheet_entries_project_id ON timesheet_entries(project_id);
CREATE INDEX idx_timesheet_entries_project_category ON timesheet_entries(project_category);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(date);
CREATE INDEX idx_timesheet_entries_upload_id ON timesheet_entries(upload_id);
CREATE INDEX idx_timesheet_entries_date_range ON timesheet_entries(date DESC);

-- Create updated_at trigger
CREATE TRIGGER update_timesheet_entries_updated_at
  BEFORE UPDATE ON timesheet_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Team members can read all entries
CREATE POLICY timesheet_entries_select_team_members
  ON timesheet_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_team_member = true
    )
  );

-- Service role can do everything
CREATE POLICY timesheet_entries_all_service_role
  ON timesheet_entries
  FOR ALL
  USING (auth.role() = 'service_role');
