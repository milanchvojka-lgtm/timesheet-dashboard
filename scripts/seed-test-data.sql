-- Test Data for Phase 9 Notifications
-- Run this in Supabase SQL Editor

-- 1. Insert test timesheets with unpaired activities (will trigger "Unpaired Items" notification)
-- Note: Using sequential IDs for person_id, project_id, activity_id (Costlocker assigns these)
INSERT INTO timesheet_entries (
  person_id, person_name, person_email,
  project_id, project_name, project_category,
  activity_id, activity_name,
  date, hours, description,
  approved, billable
)
VALUES
  -- Paired activities (match keywords)
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 201, 'Design tým OPS_2025', 'OPS', 301, 'Hiring new designer', '2024-11-15', 8.0, 'Conducting interviews', false, true),
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 201, 'Design tým OPS_2025', 'OPS', 302, 'Review candidate portfolio', '2024-11-16', 6.0, 'Portfolio reviews', false, true),
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 201, 'Design tým OPS_2025', 'OPS', 303, 'Job posting updates', '2024-11-17', 4.0, 'Update job descriptions', false, true),

  -- Unpaired activities (will NOT match any keywords - trigger notification)
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 202, 'Design tým Interní_2025', 'Internal', 304, 'Design system work', '2024-11-18', 8.0, 'Working on components', false, false),
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 202, 'Design tým Interní_2025', 'Internal', 305, 'Client meeting', '2024-11-19', 5.0, 'Meeting with stakeholders', false, true),
  (101, 'Milan Chvojka', 'milan@2fresh.cz', 202, 'Design tým Interní_2025', 'Internal', 306, 'Documentation', '2024-11-20', 3.0, 'Writing docs', false, false),
  (102, 'Jan Novák', 'jan.novak@example.com', 201, 'Design tým OPS_2025', 'OPS', 307, 'Team coordination', '2024-11-21', 7.0, 'Planning sprint', false, false),
  (102, 'Jan Novák', 'jan.novak@example.com', 202, 'Design tým Interní_2025', 'Internal', 308, 'Prototype creation', '2024-11-22', 8.0, 'Creating prototypes', false, false),

  -- More entries to create volume
  (103, 'Petra Svobodová', 'petra@example.com', 201, 'Design tým OPS_2025', 'OPS', 309, 'Hiring coordination', '2024-11-25', 6.0, 'Scheduling interviews', false, true),
  (103, 'Petra Svobodová', 'petra@example.com', 202, 'Design tým Interní_2025', 'Internal', 310, 'Research activities', '2024-11-26', 8.0, 'User research', false, false),
  (103, 'Petra Svobodová', 'petra@example.com', 202, 'Design tým Interní_2025', 'Internal', 311, 'Design reviews', '2024-11-27', 7.0, 'Reviewing designs', false, false);

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
