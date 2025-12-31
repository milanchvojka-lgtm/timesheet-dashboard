-- Seed activity keywords
-- Insert default keywords for activity categorization

-- OPS Hiring keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('hiring', 'OPS_Hiring', 'Hiring and recruitment activities', true),
  ('interview', 'OPS_Hiring', 'Interview activities', true),
  ('nábor', 'OPS_Hiring', 'Czech: recruitment', true),
  ('pohovor', 'OPS_Hiring', 'Czech: interview', true)
ON CONFLICT DO NOTHING;

-- OPS Jobs keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('jobs', 'OPS_Jobs', 'Job posting and management', true),
  ('job', 'OPS_Jobs', 'Job posting activities', true),
  ('inzerce', 'OPS_Jobs', 'Czech: job advertisement', true),
  ('pozice', 'OPS_Jobs', 'Czech: position', true)
ON CONFLICT DO NOTHING;

-- OPS Reviews keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('reviews', 'OPS_Reviews', 'Review and feedback activities', true),
  ('review', 'OPS_Reviews', 'Review activities', true),
  ('hodnocení', 'OPS_Reviews', 'Czech: evaluation/review', true),
  ('feedback', 'OPS_Reviews', 'Feedback activities', true)
ON CONFLICT DO NOTHING;

-- OPS Guiding keywords (general/fallback)
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('meeting', 'OPS_Guiding', 'General meeting activities', true),
  ('sync', 'OPS_Guiding', 'Synchronization meetings', true),
  ('planning', 'OPS_Guiding', 'Planning activities', true),
  ('internal', 'OPS_Guiding', 'Internal activities', true),
  ('admin', 'OPS_Guiding', 'Administrative activities', true),
  ('onboarding', 'OPS_Guiding', 'Onboarding activities', true),
  ('training', 'OPS_Guiding', 'Training activities', true),
  ('documentation', 'OPS_Guiding', 'Documentation work', true)
ON CONFLICT DO NOTHING;
