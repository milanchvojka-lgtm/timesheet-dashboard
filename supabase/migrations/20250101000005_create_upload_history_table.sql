-- Create upload_history table
-- Tracks CSV/Excel file uploads and import status

CREATE TABLE IF NOT EXISTS upload_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Upload information
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- in bytes
  file_type TEXT NOT NULL, -- 'csv' or 'xlsx'

  -- Upload user
  uploaded_by_email TEXT NOT NULL,
  uploaded_by_name TEXT,

  -- Import statistics
  total_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  skipped_rows INTEGER NOT NULL DEFAULT 0,

  -- Date range of imported data
  data_date_from DATE,
  data_date_to DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'partial'
  error_message TEXT,
  validation_errors JSONB, -- Array of validation errors

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('processing', 'completed', 'failed', 'partial'))
);

-- Create indexes
CREATE INDEX idx_upload_history_uploaded_by ON upload_history(uploaded_by_email);
CREATE INDEX idx_upload_history_status ON upload_history(status);
CREATE INDEX idx_upload_history_created_at ON upload_history(created_at DESC);
CREATE INDEX idx_upload_history_date_range ON upload_history(data_date_from, data_date_to);

-- Enable RLS
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Team members can read all upload history
CREATE POLICY upload_history_select_team_members
  ON upload_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND users.is_team_member = true
    )
  );

-- Service role can do everything
CREATE POLICY upload_history_all_service_role
  ON upload_history
  FOR ALL
  USING (auth.role() = 'service_role');
