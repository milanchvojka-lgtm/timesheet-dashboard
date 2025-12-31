-- Remove incorrect keywords and add correct ones
-- Based on the actual keywords we use for categorization

-- First, remove all existing keywords (clean slate)
DELETE FROM activity_keywords;

-- OPS Hiring keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('hiring', 'OPS_Hiring', 'Hiring activities', true),
  ('interview', 'OPS_Hiring', 'Interview activities', true),
  ('interviews', 'OPS_Hiring', 'Multiple interviews', true),
  ('hire', 'OPS_Hiring', 'Hiring process', true);

-- OPS Jobs keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('jobs', 'OPS_Jobs', 'Job postings (plural)', true),
  ('job', 'OPS_Jobs', 'Job posting', true),
  ('joby', 'OPS_Jobs', 'Jobs (Czech variant)', true);

-- OPS Reviews keywords
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('reviews', 'OPS_Reviews', 'Review activities (plural)', true),
  ('review', 'OPS_Reviews', 'Review activity', true),
  ('review s', 'OPS_Reviews', 'Review with space variant', true);

-- OPS Guiding keywords (general keywords for OPS and Guiding projects)
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES
  ('meeting', 'OPS_Guiding', 'General meetings', true),
  ('sync', 'OPS_Guiding', 'Sync meetings', true),
  ('planning', 'OPS_Guiding', 'Planning activities', true),
  ('internal', 'OPS_Guiding', 'Internal activities', true),
  ('admin', 'OPS_Guiding', 'Administrative work', true),
  ('onboarding', 'OPS_Guiding', 'Onboarding activities', true),
  ('training', 'OPS_Guiding', 'Training sessions', true),
  ('documentation', 'OPS_Guiding', 'Documentation work', true);
