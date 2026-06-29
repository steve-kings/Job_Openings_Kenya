-- ============================================================================
-- Fix: Community threads/comments could not load.
--
-- The community pages query `forum_threads.select('*, profiles(...)')` and
-- `forum_comments.select('*, profiles(...)')`, but user_id originally referenced
-- auth.users — so PostgREST had NO relationship to public.profiles and returned:
--   400 PGRST200: Could not find a relationship between 'forum_threads' and 'profiles'
-- which made the thread page show "Thread not found" and replies fail.
--
-- This adds the missing foreign keys to public.profiles so the embeds resolve.
-- Run ONCE in the Supabase SQL editor (or psql). Requires that every existing
-- thread/comment author already has a row in public.profiles (normally true).
-- ============================================================================

ALTER TABLE public.forum_threads
  ADD CONSTRAINT forum_threads_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.forum_comments
  ADD CONSTRAINT forum_comments_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Reload PostgREST's schema cache so the new relationships are picked up immediately.
NOTIFY pgrst, 'reload schema';
