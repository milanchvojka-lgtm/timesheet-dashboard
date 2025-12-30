-- Seed data for team members and their planned FTE values
-- This creates initial user records and their FTE allocations

-- Insert team members
-- Note: In production, users will be created via OAuth, but we seed some for testing
INSERT INTO users (email, name, is_team_member, costlocker_person_id) VALUES
  ('jan.novak@2fresh.cz', 'Jan Novák', true, 1001),
  ('petra.svobodova@2fresh.cz', 'Petra Svobodová', true, 1002),
  ('martin.dvorak@2fresh.cz', 'Martin Dvořák', true, 1003),
  ('eva.novotna@2fresh.cz', 'Eva Novotná', true, 1004),
  ('tomas.prochazka@2fresh.cz', 'Tomáš Procházka', true, 1005),
  ('lucie.kralova@2fresh.cz', 'Lucie Králová', true, 1006),
  ('david.horak@2fresh.cz', 'David Horák', true, 1007),
  ('katerina.malikova@2fresh.cz', 'Kateřina Málková', true, 1008)
ON CONFLICT (email) DO NOTHING;

-- Insert planned FTE values for team members
-- Using subqueries to get user IDs dynamically

-- Jan Novák - Full time (1.0 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Jan Novák', 1.0, '2024-01-01', NULL
FROM users WHERE email = 'jan.novak@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Petra Svobodová - Full time (1.0 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Petra Svobodová', 1.0, '2024-01-01', NULL
FROM users WHERE email = 'petra.svobodova@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Martin Dvořák - Part time (0.8 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Martin Dvořák', 0.8, '2024-01-01', NULL
FROM users WHERE email = 'martin.dvorak@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Eva Novotná - Full time (1.0 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Eva Novotná', 1.0, '2024-01-01', NULL
FROM users WHERE email = 'eva.novotna@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Tomáš Procházka - Part time (0.6 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Tomáš Procházka', 0.6, '2024-01-01', NULL
FROM users WHERE email = 'tomas.prochazka@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Lucie Králová - Full time (1.0 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Lucie Králová', 1.0, '2024-01-01', NULL
FROM users WHERE email = 'lucie.kralova@2fresh.cz'
ON CONFLICT DO NOTHING;

-- David Horák - Full time (1.0 FTE), but changed to 0.5 FTE in October 2024
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'David Horák', 1.0, '2024-01-01', '2024-09-30'
FROM users WHERE email = 'david.horak@2fresh.cz'
ON CONFLICT DO NOTHING;

INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'David Horák', 0.5, '2024-10-01', NULL
FROM users WHERE email = 'david.horak@2fresh.cz'
ON CONFLICT DO NOTHING;

-- Kateřina Málková - Full time (1.0 FTE)
INSERT INTO planned_fte (user_id, person_name, fte_value, valid_from, valid_to)
SELECT id, 'Kateřina Málková', 1.0, '2024-01-01', NULL
FROM users WHERE email = 'katerina.malikova@2fresh.cz'
ON CONFLICT DO NOTHING;
