-- Create users table
-- Stores user account information for authentication and team member tracking

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  costlocker_person_id INTEGER UNIQUE, -- Link to Costlocker API person ID
  is_team_member BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on costlocker_person_id for API data linking
CREATE INDEX idx_users_costlocker_person_id ON users(costlocker_person_id);

-- Create index on is_team_member for filtering team members
CREATE INDEX idx_users_is_team_member ON users(is_team_member);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Service role can do everything
CREATE POLICY users_all_for_service_role
  ON users
  FOR ALL
  USING (auth.role() = 'service_role');
