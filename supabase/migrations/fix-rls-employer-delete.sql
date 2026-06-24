-- ============================================================
-- Migration: Allow employers to delete their own job submissions
--             Fix application RLS for status updates
-- Run this in Supabase SQL Editor
-- Date: 2026-06-24
-- ============================================================

-- 1. Allow employers to delete their own pending/rejected submissions
CREATE POLICY "Employers can delete own submissions"
    ON employer_job_submissions FOR DELETE
    USING (auth.uid() = employer_id);

-- 2. Allow users to update their own applications (for status changes)
--    (Check if policy already exists to avoid error)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can update own applications'
        AND tablename = 'applications'
    ) THEN
        CREATE POLICY "Users can update own applications"
            ON applications FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Allow users to delete their own applications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can delete own applications'
        AND tablename = 'applications'
    ) THEN
        CREATE POLICY "Users can delete own applications"
            ON applications FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
