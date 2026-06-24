-- ============================================================
-- Migration: Fix opportunities table — add missing columns
--             and update CHECK constraints
-- Run this in Supabase SQL Editor
-- Date: 2026-06-24
-- ============================================================

-- 1. Add missing columns (safe — IF NOT EXISTS avoids errors)
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS salary_min INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max INTEGER,
  ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'KES';

-- 2. Relax NOT NULL constraints for Banner-type listings
--    (Banners don't need company, location, deadline, etc.)
ALTER TABLE public.opportunities ALTER COLUMN location DROP NOT NULL;
ALTER TABLE public.opportunities ALTER COLUMN deadline DROP NOT NULL;
ALTER TABLE public.opportunities ALTER COLUMN apply_url DROP NOT NULL;
ALTER TABLE public.opportunities ALTER COLUMN description DROP NOT NULL;

-- 3. Fix type CHECK constraint to include all types
--    (Drop and recreate because CHECK constraints can't be altered in-place)
ALTER TABLE public.opportunities
  DROP CONSTRAINT IF EXISTS opportunities_type_check;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_type_check
  CHECK (type IN ('Job', 'Training', 'Banner', 'Grant', 'Scholarship'));

-- 4. Fix status CHECK constraint to include 'expired'
ALTER TABLE public.opportunities
  DROP CONSTRAINT IF EXISTS opportunities_status_check;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_status_check
  CHECK (status IN ('active', 'inactive', 'closed', 'draft', 'expired'));

-- 5. Add missing blog_posts columns
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 5b. Add phone column to profiles (used by CV builder)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 6. Insert default cover letter price if not set
INSERT INTO site_settings (key, value)
VALUES ('cover_letter_price', '20')
ON CONFLICT (key) DO NOTHING;

-- 6. Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'opportunities'
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint
WHERE conrelid = 'opportunities'::regclass
  AND contype = 'c';
