-- Create NextAuth.js required tables for Supabase Adapter
-- These tables are needed for database session storage
-- See: https://authjs.dev/reference/adapter/supabase

-- Users table (we already have this, but need to ensure compatibility)
-- Skip if already created

-- Accounts table - Links users to OAuth providers
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(provider, "providerAccountId")
);

-- Sessions table - Stores user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification tokens table - For email verification
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (identifier, token)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions("sessionToken");

-- Enable RLS on NextAuth tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for accounts
CREATE POLICY accounts_select_own
  ON accounts
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY accounts_all_for_service_role
  ON accounts
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for sessions
CREATE POLICY sessions_select_own
  ON sessions
  FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY sessions_all_for_service_role
  ON sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for verification_tokens
CREATE POLICY verification_tokens_all_for_service_role
  ON verification_tokens
  FOR ALL
  USING (auth.role() = 'service_role');
