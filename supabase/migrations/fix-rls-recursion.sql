-- Fix infinite recursion in profiles RLS policies
-- Run this in your Supabase SQL Editor

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Simple non-recursive policies (use JWT claim instead of querying profiles table)
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "System can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- For admins: use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Admin policies using the function (breaks the recursion)
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- Also fix blog_posts and opportunities policies to use the function
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts"
    ON public.blog_posts FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts"
    ON public.blog_posts FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts"
    ON public.blog_posts FOR DELETE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active opportunities" ON public.opportunities;
CREATE POLICY "Anyone can view active opportunities"
    ON public.opportunities FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert opportunities" ON public.opportunities;
CREATE POLICY "Admins can insert opportunities"
    ON public.opportunities FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update opportunities" ON public.opportunities;
CREATE POLICY "Admins can update opportunities"
    ON public.opportunities FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete opportunities" ON public.opportunities;
CREATE POLICY "Admins can delete opportunities"
    ON public.opportunities FOR DELETE
    USING (public.is_admin());
