-- Create audit_log table
-- Tracks admin actions for compliance and debugging
-- Records changes to FTE values, keywords, settings, etc.

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id), -- Admin who performed the action
  action TEXT NOT NULL, -- Action type (e.g., "UPDATE_FTE", "CREATE_KEYWORD", "DELETE_KEYWORD")
  entity_type TEXT NOT NULL, -- Type of entity affected (e.g., "planned_fte", "activity_keywords")
  entity_id UUID, -- ID of the affected entity (if applicable)
  old_values JSONB, -- Previous values before the change
  new_values JSONB, -- New values after the change
  metadata JSONB, -- Additional context (e.g., reason, notes)
  ip_address TEXT, -- IP address of the user (for security)
  user_agent TEXT, -- Browser/client user agent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Create composite index for filtering by entity
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read audit logs (transparency)
CREATE POLICY audit_log_select_authenticated
  ON audit_log
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert audit logs (prevent tampering)
CREATE POLICY audit_log_insert_for_service_role
  ON audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Prevent updates and deletes (audit logs should be immutable)
CREATE POLICY audit_log_no_update
  ON audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY audit_log_no_delete
  ON audit_log
  FOR DELETE
  USING (false);
