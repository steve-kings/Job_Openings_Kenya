-- ============================================================
-- Migration: Create scheduled_emails table
-- Run this in your Supabase SQL Editor to fix the missing table.
--
-- This table is referenced by:
--   src/app/admin/newsletter/page.tsx
--   src/app/api/admin/newsletter/schedule/route.ts
--   src/app/api/cron/scheduled-emails/route.ts
-- ============================================================

-- 1. Create the table
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

-- 2. Index for cron job queries (find pending emails due to send)
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status_send_at
    ON scheduled_emails(status, send_at);

-- 3. Enable RLS
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- 4. Admin access policy
DROP POLICY IF EXISTS "Admins can manage scheduled emails" ON scheduled_emails;
CREATE POLICY "Admins can manage scheduled emails"
    ON scheduled_emails FOR ALL
    USING (public.is_admin());
