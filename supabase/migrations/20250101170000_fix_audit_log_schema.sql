-- Fix audit_log table schema to match API usage
-- The API uses user_email and details instead of user_id, old_values, new_values

-- Add new columns that the API actually uses
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS details JSONB;

-- Make user_id nullable (since we're using user_email instead)
ALTER TABLE audit_log ALTER COLUMN user_id DROP NOT NULL;

-- Create index on user_email for filtering
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email ON audit_log(user_email);

-- Update RLS policy to allow service role to insert with user_email
-- (existing policy already allows service_role, just documenting)
