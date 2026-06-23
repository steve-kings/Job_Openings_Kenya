-- ============================================================
-- Migration: Create courses, lessons, and certificates tables
-- Run this in your Supabase SQL Editor.
--
-- These tables are referenced by:
--   src/app/courses/          (public course pages)
--   src/app/admin/courses/    (admin CRUD)
--   src/app/certificates/      (certificate verification page)
-- ============================================================

-- 1. COURSES table
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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses"
    ON courses FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage courses"
    ON courses FOR ALL
    USING (public.is_admin());

-- 2. LESSONS table
CREATE TABLE IF NOT EXISTS lessons (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id   UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT,
    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    video_url   TEXT,
    status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- 3. CERTIFICATES table
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
