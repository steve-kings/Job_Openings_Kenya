-- ============================================================
-- Job Openings Kenya — Employer Portal Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── PART 1: Extend profiles role to include 'employer' ──────
-- Drop existing role constraint and recreate with employer
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'admin', 'employer'));

-- ── PART 2: Create employer_job_submissions table ────────────
CREATE TABLE IF NOT EXISTS public.employer_job_submissions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title       TEXT NOT NULL,
  company_name    TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  job_type        TEXT DEFAULT 'Full-time' 
                  CHECK (job_type IN ('Full-time','Part-time','Contract','Internship','Remote')),
  location        TEXT NOT NULL,
  deadline        DATE,
  short_description TEXT,
  description     TEXT NOT NULL,
  requirements    TEXT,
  apply_url       TEXT NOT NULL,
  logo_url        TEXT,
  status          TEXT DEFAULT 'pending' 
                  CHECK (status IN ('pending','approved','rejected')),
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PART 3: Enable RLS ───────────────────────────────────────
ALTER TABLE public.employer_job_submissions ENABLE ROW LEVEL SECURITY;

-- Employers can view their own submissions
CREATE POLICY "Employers can view own submissions"
  ON public.employer_job_submissions FOR SELECT
  USING (
    auth.uid() = employer_id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employers (and admins) can insert their own submissions
CREATE POLICY "Employers can insert submissions"
  ON public.employer_job_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('employer', 'admin')
    )
  );

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions"
  ON public.employer_job_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
  ON public.employer_job_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── PART 4: Indexes ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employer_submissions_employer_id 
  ON public.employer_job_submissions(employer_id);

CREATE INDEX IF NOT EXISTS idx_employer_submissions_status 
  ON public.employer_job_submissions(status);

CREATE INDEX IF NOT EXISTS idx_employer_submissions_created_at 
  ON public.employer_job_submissions(created_at DESC);

-- ── PART 5: Updated_at trigger ───────────────────────────────
DROP TRIGGER IF EXISTS update_employer_submissions_updated_at 
  ON public.employer_job_submissions;

CREATE TRIGGER update_employer_submissions_updated_at
  BEFORE UPDATE ON public.employer_job_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── PART 6: Update handle_new_user to respect role metadata ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── PART 7: Grant permissions ────────────────────────────────
GRANT ALL ON public.employer_job_submissions TO authenticated;
GRANT SELECT ON public.employer_job_submissions TO anon;

-- ============================================================
-- DONE! Run supabase-setup.sql and SUPABASE_SCHEMA_UPDATE.sql
-- first if this is a fresh database.
-- ============================================================
