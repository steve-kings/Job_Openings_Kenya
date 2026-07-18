-- ============================================================
-- Job Openings Kenya — Consolidated Database Schema
-- Supabase PostgreSQL — Single source of truth
-- ============================================================
-- To apply a fresh database: Run this entire file in
-- Supabase SQL Editor (supabase.com/dashboard).
--
-- Last updated: 2026-06-23
-- Consolidates: supabase-setup.sql, schema.sql,
--   SUPABASE_SCHEMA_UPDATE.sql, employer-portal.sql,
--   create-subscribers.sql, create-scheduled-emails.sql,
--   fix-rls-recursion.sql, setup-testimonials.sql
-- ============================================================

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Helper: Auto-update `updated_at` trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Helper: is_admin() — security definer to avoid RLS recursion
-- ============================================================
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

-- ============================================================
-- Helper: increment_thread_views(thread_id)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_thread_views(thread_id UUID)
RETURNS void AS $$
  UPDATE forum_threads SET views = views + 1 WHERE id = thread_id;
$$ LANGUAGE SQL;

-- ============================================================
-- Table: profiles
-- Extended user profile linked to Supabase auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT,
    role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'admin', 'employer')),
    full_name   TEXT,
    username    TEXT UNIQUE,
    avatar_url  TEXT,
    bio         TEXT,
    headline    TEXT,
    location    TEXT,
    website     TEXT,
    skills      TEXT[] DEFAULT '{}',
    education   TEXT,
    experience  TEXT,
    linkedin_url TEXT,
    github_url  TEXT,
    twitter_url TEXT,
    website_url TEXT,
    is_public   BOOLEAN DEFAULT FALSE,
    open_to_work BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by all"
    ON profiles FOR SELECT
    USING (is_public = true OR auth.uid() = id);

CREATE POLICY "System can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- Admin policies via is_admin() to avoid recursion
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (public.is_admin());

-- ============================================================
-- Table: opportunities
-- Job listings and training opportunities
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('Job', 'Training', 'Grant', 'Scholarship', 'Banner')),
    company         TEXT NOT NULL,
    location        TEXT,
    description     TEXT,
    short_description TEXT,
    requirements    TEXT[],
    responsibilities TEXT[],
    benefits        TEXT[],
    deadline        DATE,
    apply_url       TEXT,
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'closed', 'draft', 'expired')),
    views           INTEGER NOT NULL DEFAULT 0,
    salary_min      INTEGER,
    salary_max      INTEGER,
    salary_currency  TEXT DEFAULT 'KES',
    contact_email   TEXT,
    contact_phone   TEXT,
    thumbnail_url   TEXT,
    source          TEXT,
    source_job_id   TEXT,
    source_url      TEXT,
    scraped_at      TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunities_source_job ON opportunities(source, source_job_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_last_seen ON opportunities(last_seen_at DESC) WHERE source IS NOT NULL;

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active opportunities"
    ON opportunities FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can insert opportunities"
    ON opportunities FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update opportunities"
    ON opportunities FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete opportunities"
    ON opportunities FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- Table: partners
-- Organization partners / sponsors
-- ============================================================
CREATE TABLE IF NOT EXISTS partners (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url    TEXT,
    website_url TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partners"
    ON partners FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage partners"
    ON partners FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: blog_posts
-- Content / blog articles
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    excerpt         TEXT,
    content         TEXT,
    category        TEXT,
    author_name     TEXT,
    author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    featured_image  TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
    views           INTEGER NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
    ON blog_posts FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can insert blog posts"
    ON blog_posts FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update blog posts"
    ON blog_posts FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete blog posts"
    ON blog_posts FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- Table: subscribers
-- Newsletter subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'unsubscribed')),
    interests   JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
    ON subscribers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view subscribers"
    ON subscribers FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can delete subscribers"
    ON subscribers FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- Table: applications
-- User job applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'applied'
                    CHECK (status IN ('applied', 'saved', 'interviewing', 'offered', 'rejected')),
    notes           TEXT,
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity_id ON applications(opportunity_id);

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own applications"
    ON applications FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (public.is_admin());

-- ============================================================
-- Table: scheduled_emails
-- Scheduled newsletter emails
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject         TEXT NOT NULL,
    html_content    TEXT NOT NULL,
    send_at         TIMESTAMPTZ NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at         TIMESTAMPTZ,
    recipient_count INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status_send_at ON scheduled_emails(status, send_at);

ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled emails"
    ON scheduled_emails FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: testimonials
-- User testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    role        TEXT,
    company     TEXT,
    content     TEXT NOT NULL,
    avatar_url  TEXT,
    featured    BOOLEAN NOT NULL DEFAULT false,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials"
    ON testimonials FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Admins can manage testimonials"
    ON testimonials FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: employer_job_submissions
-- Job posts submitted by employer users
-- ============================================================
CREATE TABLE IF NOT EXISTS employer_job_submissions (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_title       TEXT NOT NULL,
    company_name    TEXT NOT NULL,
    contact_email   TEXT NOT NULL,
    job_type        TEXT DEFAULT 'Full-time'
                    CHECK (job_type IN ('Full-time', 'Part-time', 'Contract', 'Internship', 'Remote')),
    location        TEXT NOT NULL,
    deadline        DATE,
    short_description TEXT,
    description     TEXT NOT NULL,
    requirements    TEXT,
    apply_url       TEXT NOT NULL,
    logo_url        TEXT,
    status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_submissions_employer_id ON employer_job_submissions(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_submissions_status ON employer_job_submissions(status);
CREATE INDEX IF NOT EXISTS idx_employer_submissions_created_at ON employer_job_submissions(created_at DESC);

DROP TRIGGER IF EXISTS update_employer_submissions_updated_at ON employer_job_submissions;
CREATE TRIGGER update_employer_submissions_updated_at
    BEFORE UPDATE ON employer_job_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE employer_job_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own submissions"
    ON employer_job_submissions FOR SELECT
    USING (
        auth.uid() = employer_id
        OR public.is_admin()
    );

CREATE POLICY "Employers can insert submissions"
    ON employer_job_submissions FOR INSERT
    WITH CHECK (
        auth.uid() = employer_id
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('employer', 'admin')
        )
    );

CREATE POLICY "Admins can update submissions"
    ON employer_job_submissions FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete submissions"
    ON employer_job_submissions FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- Table: saved_searches
-- User saved job search criteria
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_searches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT,
    query       TEXT NOT NULL,
    filters     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved searches"
    ON saved_searches FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================
-- Table: courses
-- Course listings linking to KingsLearn LMS
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT,
    external_url    TEXT,
    level           TEXT DEFAULT 'beginner'
                    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_hours  INTEGER,
    category        TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published')),
    thumbnail_url   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
    ON courses FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage courses"
    ON courses FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: lessons
-- Individual lessons within a course
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title           TEXT NOT NULL,
    content         TEXT,
    order_index     INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    video_url       TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published lessons"
    ON lessons FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage lessons"
    ON lessons FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: certificates
-- Issued when a user completes a course on KingsLearn
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    issued_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view certificates"
    ON certificates FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage certificates"
    ON certificates FOR ALL
    USING (public.is_admin());

-- ============================================================
-- Table: forum_categories
-- Community forum category groups
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_categories (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    description  TEXT,
    icon         TEXT DEFAULT '💬',
    color        TEXT DEFAULT '#1976D2',
    thread_count INT DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
    ON forum_categories FOR SELECT
    USING (true);

-- ============================================================
-- Table: forum_threads
-- Community forum discussion threads
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_threads (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title         TEXT NOT NULL,
    content       TEXT NOT NULL,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id   UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
    upvotes       INT DEFAULT 0,
    views         INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_pinned     BOOLEAN DEFAULT FALSE,
    is_locked     BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_forum_threads_updated_at ON forum_threads;
CREATE TRIGGER update_forum_threads_updated_at
    BEFORE UPDATE ON forum_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read threads"
    ON forum_threads FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can create threads"
    ON forum_threads FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own threads"
    ON forum_threads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
    ON forum_threads FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- Table: forum_comments
-- Comments on forum threads
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_comments (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id   UUID REFERENCES forum_threads(id) ON DELETE CASCADE NOT NULL,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content     TEXT NOT NULL,
    upvotes     INT DEFAULT 0,
    parent_id   UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
    ON forum_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can create comments"
    ON forum_comments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own comments"
    ON forum_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON forum_comments FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- Table: forum_votes
-- Upvote/downvote tracking (one per user per thread/comment)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_votes (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    thread_id   UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    comment_id  UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
    vote_type   TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, thread_id),
    UNIQUE(user_id, comment_id)
);

ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes"
    ON forum_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated can vote"
    ON forum_votes FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can change own vote"
    ON forum_votes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vote"
    ON forum_votes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- Default forum categories
-- ============================================================
INSERT INTO forum_categories (name, description, icon, color) VALUES
    ('Career Advice', 'Get tips on job hunting, CVs, interviews and career growth', '🚀', '#1976D2'),
    ('Scholarships', 'Discuss scholarship opportunities and application tips', '🎓', '#7B1FA2'),
    ('Grants & Funding', 'Talk about grants, funding opportunities and proposals', '💰', '#4CAF50'),
    ('Interview Experiences', 'Share your interview stories and help others prepare', '🎤', '#F57C00'),
    ('General Discussion', 'Chat about anything career or opportunity related', '💬', '#1565C0'),
    ('Success Stories', 'Celebrate wins and inspire others with your journey', '🏆', '#4CAF50')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.blog_posts TO authenticated;
GRANT ALL ON public.opportunities TO authenticated;
GRANT ALL ON public.partners TO authenticated;
GRANT ALL ON public.applications TO authenticated;
GRANT ALL ON public.saved_searches TO authenticated;
GRANT ALL ON public.employer_job_submissions TO authenticated;
GRANT ALL ON public.forum_threads TO authenticated;
GRANT ALL ON public.forum_comments TO authenticated;
GRANT ALL ON public.forum_votes TO authenticated;
GRANT ALL ON public.courses TO authenticated;
GRANT ALL ON public.lessons TO authenticated;
GRANT ALL ON public.certificates TO authenticated;

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.forum_categories TO anon;
GRANT SELECT ON public.forum_threads TO anon;
GRANT SELECT ON public.forum_comments TO anon;
GRANT SELECT ON public.forum_votes TO anon;
GRANT SELECT ON public.employer_job_submissions TO anon;
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.lessons TO anon;
GRANT SELECT ON public.certificates TO anon;

-- ============================================================
-- VERIFICATION QUERIES (run to verify setup)
-- ============================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- ============================================================
-- Migration: CV Builder — Store PDFs & Track Payments
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. CV Documents table (store user CVs)
CREATE TABLE IF NOT EXISTS cv_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    template_id     TEXT NOT NULL,
    cv_data         JSONB NOT NULL,               -- full form data
    status          TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'deleted')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_documents_user_id ON cv_documents(user_id);

ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CVs"
    ON cv_documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
    ON cv_documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs"
    ON cv_documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all CVs"
    ON cv_documents FOR SELECT
    USING (public.is_admin());

-- 2. Payment Transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reference       TEXT NOT NULL UNIQUE,         -- Paystack transaction reference
    amount          INTEGER NOT NULL,             -- in KES
    currency        TEXT DEFAULT 'KES',
    product         TEXT NOT NULL,                -- 'cv_builder', 'cv_pro_design', etc.
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
    email           TEXT,
    metadata        JSONB,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
    ON payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments"
    ON payment_transactions FOR ALL
    USING (public.is_admin());

-- 3. Settings table for admin-configurable pricing
CREATE TABLE IF NOT EXISTS site_settings (
    key     TEXT PRIMARY KEY,
    value   TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
    ON site_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage settings"
    ON site_settings FOR ALL
    USING (public.is_admin());

-- Insert default pricing
INSERT INTO site_settings (key, value) VALUES
    ('cv_price', '50'),
    ('cv_pro_design_price', '200'),
    ('cover_letter_price', '20')
ON CONFLICT (key) DO NOTHING;
