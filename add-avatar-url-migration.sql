-- Migration: Add avatar_url column to profiles table
-- Run this in your Supabase SQL Editor

-- Add avatar_url column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update comment
COMMENT ON COLUMN public.profiles.avatar_url IS 'User profile picture URL (from Google OAuth or uploaded)';
