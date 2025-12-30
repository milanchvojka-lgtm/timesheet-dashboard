-- Seed data for activity keywords
-- These keywords are used to categorize timesheet activities into specific categories

-- OPS Hiring keywords
INSERT INTO activity_keywords (keyword, category, description, is_active) VALUES
  ('hiring', 'OPS Hiring', 'Matches activities related to hiring process', true),
  ('interview', 'OPS Hiring', 'Matches activities related to interviewing candidates', true),
  ('interviews', 'OPS Hiring', 'Matches activities related to interviewing candidates (plural)', true),
  ('recruitment', 'OPS Hiring', 'Matches activities related to recruitment', true),
  ('candidate', 'OPS Hiring', 'Matches activities related to candidate evaluation', true),
  ('onboarding', 'OPS Hiring', 'Matches activities related to new employee onboarding', true)
ON CONFLICT (keyword) DO NOTHING;

-- OPS Jobs keywords
INSERT INTO activity_keywords (keyword, category, description, is_active) VALUES
  ('jobs', 'OPS Jobs', 'Matches activities related to job postings (plural)', true),
  ('job', 'OPS Jobs', 'Matches activities related to job postings', true),
  ('job posting', 'OPS Jobs', 'Matches activities related to creating job postings', true),
  ('job description', 'OPS Jobs', 'Matches activities related to writing job descriptions', true),
  ('vacancy', 'OPS Jobs', 'Matches activities related to job vacancies', true)
ON CONFLICT (keyword) DO NOTHING;

-- OPS Reviews keywords
INSERT INTO activity_keywords (keyword, category, description, is_active) VALUES
  ('reviews', 'OPS Reviews', 'Matches activities related to performance reviews (plural)', true),
  ('review', 'OPS Reviews', 'Matches activities related to performance reviews', true),
  ('performance review', 'OPS Reviews', 'Matches activities related to performance reviews', true),
  ('evaluation', 'OPS Reviews', 'Matches activities related to employee evaluation', true),
  ('feedback', 'OPS Reviews', 'Matches activities related to giving feedback', true),
  ('1:1', 'OPS Reviews', 'Matches one-on-one meetings and reviews', true),
  ('one-on-one', 'OPS Reviews', 'Matches one-on-one meetings and reviews', true)
ON CONFLICT (keyword) DO NOTHING;

-- Additional OPS-related keywords
INSERT INTO activity_keywords (keyword, category, description, is_active) VALUES
  ('team meeting', 'OPS General', 'Matches team meeting activities', true),
  ('standup', 'OPS General', 'Matches standup meeting activities', true),
  ('retrospective', 'OPS General', 'Matches retrospective meeting activities', true),
  ('planning', 'OPS General', 'Matches planning activities', true),
  ('admin', 'OPS General', 'Matches administrative tasks', true),
  ('administration', 'OPS General', 'Matches administrative tasks', true)
ON CONFLICT (keyword) DO NOTHING;
