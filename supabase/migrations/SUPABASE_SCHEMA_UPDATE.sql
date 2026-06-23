-- ============================================================
-- 1000JOBS: Talent Directory + Community Forum Schema
-- Run this ENTIRE script in your Supabase SQL Editor
-- ============================================================

-- ── PART 1: Extend profiles table for Talent Directory ──────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS open_to_work BOOLEAN DEFAULT TRUE;

-- ── PART 2: Community Forum Tables ──────────────────────────

-- Forum categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT '#1976D2',
  thread_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO forum_categories (name, description, icon, color) VALUES
  ('Career Advice', 'Get tips on job hunting, CVs, interviews and career growth', '🚀', '#1976D2'),
  ('Scholarships', 'Discuss scholarship opportunities and application tips', '🎓', '#7B1FA2'),
  ('Grants & Funding', 'Talk about grants, funding opportunities and proposals', '💰', '#4CAF50'),
  ('Interview Experiences', 'Share your interview stories and help others prepare', '🎤', '#F57C00'),
  ('General Discussion', 'Chat about anything career or opportunity related', '💬', '#1565C0'),
  ('Success Stories', 'Celebrate wins and inspire others with your journey', '🏆', '#4CAF50')
ON CONFLICT (name) DO NOTHING;

-- Forum threads
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  upvotes INT DEFAULT 0,
  views INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum comments
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  parent_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum votes (one vote per user per thread/comment)
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, comment_id)
);

-- ── PART 3: Row Level Security (RLS) ────────────────────────

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

-- Forum categories: public read
CREATE POLICY "Anyone can read categories" ON forum_categories FOR SELECT USING (true);

-- Forum threads: public read, authenticated write
CREATE POLICY "Anyone can read threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated can create threads" ON forum_threads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own threads" ON forum_threads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own threads" ON forum_threads FOR DELETE USING (auth.uid() = user_id);

-- Forum comments: public read, authenticated write
CREATE POLICY "Anyone can read comments" ON forum_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can create comments" ON forum_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON forum_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Forum votes
CREATE POLICY "Anyone can read votes" ON forum_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated can vote" ON forum_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can change own vote" ON forum_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vote" ON forum_votes FOR DELETE USING (auth.uid() = user_id);

-- Profiles: public profiles readable by all
CREATE POLICY "Public profiles are viewable by all" ON profiles FOR SELECT USING (is_public = true OR auth.uid() = id);

-- ── PART 4: Helper Functions ─────────────────────────────────

-- Increment thread views
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id UUID)
RETURNS void AS $$
  UPDATE forum_threads SET views = views + 1 WHERE id = thread_id;
$$ LANGUAGE SQL;

-- ============================================================
-- DONE! All tables and policies created successfully.
-- ============================================================
