-- Create activity_keywords table
-- Stores keywords used for categorizing timesheet activities
-- Example: "hiring", "interview" -> OPS Hiring category

CREATE TABLE IF NOT EXISTS activity_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL, -- Keyword to match (case-insensitive)
  category TEXT NOT NULL, -- Category name (e.g., "OPS Hiring", "OPS Jobs", "OPS Reviews")
  description TEXT, -- Optional description of what this keyword matches
  is_active BOOLEAN DEFAULT true, -- Allow disabling keywords without deleting
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) -- Admin who created this keyword
);

-- Create indexes for common queries
CREATE INDEX idx_activity_keywords_keyword ON activity_keywords(keyword);
CREATE INDEX idx_activity_keywords_category ON activity_keywords(category);
CREATE INDEX idx_activity_keywords_is_active ON activity_keywords(is_active);

-- Create index for case-insensitive keyword lookups
CREATE INDEX idx_activity_keywords_keyword_lower ON activity_keywords(LOWER(keyword));

-- Create updated_at trigger
CREATE TRIGGER update_activity_keywords_updated_at
  BEFORE UPDATE ON activity_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE activity_keywords ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read keywords
CREATE POLICY activity_keywords_select_authenticated
  ON activity_keywords
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role can insert/update/delete
CREATE POLICY activity_keywords_all_for_service_role
  ON activity_keywords
  FOR ALL
  USING (auth.role() = 'service_role');
