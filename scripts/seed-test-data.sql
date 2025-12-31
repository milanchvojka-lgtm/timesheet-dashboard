-- Test Data for Phase 9 Notifications
-- Run this in Supabase SQL Editor

-- 1. Insert test timesheets with unpaired activities (will trigger "Unpaired Items" notification)
INSERT INTO timesheet_entries (date, person_name, project_name, activity_name, hours, description)
VALUES
  -- Paired activities (match keywords)
  ('2024-11-15', 'Milan Chvojka', 'Design tým OPS_2025', 'Hiring new designer', 8.0, 'Conducting interviews'),
  ('2024-11-16', 'Milan Chvojka', 'Design tým OPS_2025', 'Review candidate portfolio', 6.0, 'Portfolio reviews'),
  ('2024-11-17', 'Milan Chvojka', 'Design tým OPS_2025', 'Job posting updates', 4.0, 'Update job descriptions'),

  -- Unpaired activities (will NOT match any keywords - trigger notification)
  ('2024-11-18', 'Milan Chvojka', 'Design tým Interní_2025', 'Design system work', 8.0, 'Working on components'),
  ('2024-11-19', 'Milan Chvojka', 'Design tým Interní_2025', 'Client meeting', 5.0, 'Meeting with stakeholders'),
  ('2024-11-20', 'Milan Chvojka', 'Design tým Interní_2025', 'Documentation', 3.0, 'Writing docs'),
  ('2024-11-21', 'Jan Novák', 'Design tým OPS_2025', 'Team coordination', 7.0, 'Planning sprint'),
  ('2024-11-22', 'Jan Novák', 'Design tým Interní_2025', 'Prototype creation', 8.0, 'Creating prototypes'),

  -- More entries to create volume
  ('2024-11-25', 'Petra Svobodová', 'Design tým OPS_2025', 'Hiring coordination', 6.0, 'Scheduling interviews'),
  ('2024-11-26', 'Petra Svobodová', 'Design tým Interní_2025', 'Research activities', 8.0, 'User research'),
  ('2024-11-27', 'Petra Svobodová', 'Design tým Interní_2025', 'Design reviews', 7.0, 'Reviewing designs');

-- 2. Add planned FTE values (to trigger "FTE Deviation" notification)
-- Milan Chvojka: planned 1.0 FTE but tracked only ~40 hours = 0.25 FTE in Nov (75% deviation!)
INSERT INTO planned_fte (person_name, fte_value, valid_from, valid_to, user_id)
VALUES
  ('Milan Chvojka', 1.0, '2024-11-01', NULL, NULL),
  ('Jan Novák', 0.5, '2024-11-01', NULL, NULL),
  ('Petra Svobodová', 0.8, '2024-11-01', NULL, NULL);

-- 3. Check current team members
-- The notification system will detect people in timesheets who aren't team members
-- Let's verify Jan Novák and Petra Svobodová are NOT in users table
-- (If they exist, the "New Team Members" notification will trigger)

-- 4. Verify data was inserted
SELECT
  'Timesheets' as table_name,
  COUNT(*) as count,
  MIN(date) as earliest,
  MAX(date) as latest
FROM timesheet_entries
WHERE date >= '2024-11-01'

UNION ALL

SELECT
  'Planned FTE' as table_name,
  COUNT(*) as count,
  MIN(valid_from::text) as earliest,
  MAX(COALESCE(valid_to::text, 'NULL')) as latest
FROM planned_fte
WHERE valid_to IS NULL;

-- 5. Preview what notifications should trigger:
-- a) Unpaired items check
SELECT
  COUNT(*) as total_entries,
  COUNT(CASE
    WHEN activity_name ILIKE '%hiring%'
      OR activity_name ILIKE '%interview%'
      OR activity_name ILIKE '%job%'
      OR activity_name ILIKE '%review%'
      OR activity_name ILIKE '%guiding sync%'
    THEN 1
  END) as paired_entries,
  COUNT(*) - COUNT(CASE
    WHEN activity_name ILIKE '%hiring%'
      OR activity_name ILIKE '%interview%'
      OR activity_name ILIKE '%job%'
      OR activity_name ILIKE '%review%'
      OR activity_name ILIKE '%guiding sync%'
    THEN 1
  END) as unpaired_entries
FROM timesheet_entries
WHERE date >= '2024-11-01';

-- b) FTE deviations check
WITH actual_hours AS (
  SELECT
    person_name,
    SUM(hours) as total_hours,
    ROUND(SUM(hours) / 160.0, 2) as actual_fte
  FROM timesheet_entries
  WHERE date >= '2024-11-01' AND date < '2024-12-01'
  GROUP BY person_name
)
SELECT
  pf.person_name,
  pf.fte_value as planned_fte,
  COALESCE(ah.actual_fte, 0) as actual_fte,
  ROUND(ABS(pf.fte_value - COALESCE(ah.actual_fte, 0)) / pf.fte_value * 100, 1) as deviation_percent
FROM planned_fte pf
LEFT JOIN actual_hours ah ON pf.person_name = ah.person_name
WHERE pf.valid_to IS NULL
ORDER BY deviation_percent DESC;
