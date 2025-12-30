-- Create settings table
-- Stores application-wide configuration settings
-- Uses key-value pattern with JSON for flexibility

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- Setting key (e.g., "analysis_period_months", "date_range_start")
  value JSONB NOT NULL, -- Setting value (JSON for flexibility)
  description TEXT, -- Human-readable description of the setting
  value_type TEXT NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'date', 'object', 'array')), -- Type hint for UI
  is_public BOOLEAN DEFAULT false, -- Whether setting is visible to all users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) -- Last admin who updated this setting
);

-- Create indexes for common queries
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_public ON settings(is_public);

-- Create updated_at trigger
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read public settings
CREATE POLICY settings_select_public
  ON settings
  FOR SELECT
  USING (is_public = true AND auth.role() = 'authenticated');

-- Service role can read all settings
CREATE POLICY settings_select_service_role
  ON settings
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Only service role can insert/update/delete settings
CREATE POLICY settings_modify_for_service_role
  ON settings
  FOR ALL
  USING (auth.role() = 'service_role');
