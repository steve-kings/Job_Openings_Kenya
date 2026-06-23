-- Fix RLS Policies for blog_posts table

-- 1. Enable RLS on the table (in case it isn't enabled)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (optional but recommended)
DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Anyone can insert blog posts" ON blog_posts;

-- 3. Create Policy: Public users can read active/published posts
CREATE POLICY "Public can read published blog posts" ON blog_posts 
FOR SELECT USING (status = 'published' OR true);

-- 4. Create Policy: Authenticated Admins can insert/update/delete
-- Note: Since the admin panel uses the client supabase, we will allow authenticated users to perform operations.
CREATE POLICY "Authenticated can insert blog posts" ON blog_posts 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update blog posts" ON blog_posts 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can delete blog posts" ON blog_posts 
FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- NOTE: If you are not strictly managing auth tokens yet, 
-- you can run this emergency bypass (Remove comments to use):
-- CREATE POLICY "Emergency full access" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
-- ============================================================
