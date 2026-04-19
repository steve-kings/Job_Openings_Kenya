-- Update seeded opportunity deadlines to be in the future
-- Run this in your Supabase SQL Editor

UPDATE public.opportunities
SET deadline = '2026-07-15'
WHERE title = 'Software Developer Intern';

UPDATE public.opportunities
SET deadline = '2026-08-30'
WHERE title = 'Masters Scholarship 2025';

UPDATE public.opportunities
SET deadline = '2026-06-20'
WHERE title = 'Agri-Business Grant';

UPDATE public.opportunities
SET deadline = '2026-09-20'
WHERE title = 'Digital Marketing Bootcamp';

UPDATE public.opportunities
SET deadline = '2026-07-25'
WHERE title = 'Data Analyst Position';
