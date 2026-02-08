-- Fix RLS policies for partners table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can insert partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can update partners" ON public.partners;
DROP POLICY IF EXISTS "Admins can delete partners" ON public.partners;

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view partners (public access)
CREATE POLICY "Anyone can view partners"
    ON public.partners FOR SELECT
    USING (true);

-- Allow admins to insert partners
CREATE POLICY "Admins can insert partners"
    ON public.partners FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update partners
CREATE POLICY "Admins can update partners"
    ON public.partners FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to delete partners
CREATE POLICY "Admins can delete partners"
    ON public.partners FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
