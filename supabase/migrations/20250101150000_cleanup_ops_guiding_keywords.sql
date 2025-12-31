-- Cleanup OPS_Guiding keywords
-- Remove all OPS_Guiding keywords and keep only "guiding sync"

-- Delete all OPS_Guiding keywords
DELETE FROM activity_keywords WHERE category = 'OPS_Guiding';

-- Add back only "guiding sync"
INSERT INTO activity_keywords (keyword, category, description, is_active)
VALUES ('guiding sync', 'OPS_Guiding', 'Guiding synchronization meetings', true);
