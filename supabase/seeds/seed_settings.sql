-- Seed data for default application settings
-- These settings configure the default behavior of the timesheet analytics application

-- Analysis period (in months)
-- Default: 12 months (show data for the last 12 months)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('analysis_period_months', '12', 'Number of months to include in trend analysis', 'number', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Default date range start
-- Default: October 2024 (start of fiscal year or analysis period)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('date_range_start', '"2024-10-01"', 'Default start date for analysis (ISO 8601 format)', 'date', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Default date range end
-- Default: Current month (NULL means use current date)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('date_range_end', 'null', 'Default end date for analysis (NULL = current month)', 'date', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Working hours per day
-- Default: 8 hours
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('working_hours_per_day', '8', 'Standard working hours per day', 'number', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Costlocker API sync interval (in minutes)
-- Default: 60 minutes (1 hour)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('costlocker_sync_interval_minutes', '60', 'How often to sync data from Costlocker API (in minutes)', 'number', false)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Enable automatic categorization
-- Default: true
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('enable_auto_categorization', 'true', 'Whether to automatically categorize activities using keywords', 'boolean', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Minimum FTE threshold for alerts
-- Default: 0.7 (70%)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('min_fte_threshold', '0.7', 'Minimum FTE threshold for quality control alerts', 'number', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- Maximum FTE threshold for alerts
-- Default: 1.1 (110%)
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('max_fte_threshold', '1.1', 'Maximum FTE threshold for quality control alerts', 'number', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;

-- App version (for tracking)
-- Default: 2.0.0
INSERT INTO settings (key, value, description, value_type, is_public) VALUES
  ('app_version', '"2.0.0"', 'Current version of the application', 'string', true)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  value_type = EXCLUDED.value_type,
  is_public = EXCLUDED.is_public;
