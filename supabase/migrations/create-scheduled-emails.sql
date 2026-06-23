-- Run this in your Supabase SQL Editor to create the scheduled_emails table

CREATE TABLE IF NOT EXISTS scheduled_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage scheduled emails
CREATE POLICY "Admins can manage scheduled emails"
    ON scheduled_emails FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
