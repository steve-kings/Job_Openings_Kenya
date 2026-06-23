-- Run this in your Supabase SQL Editor to create the subscribers table

CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a subscription (public API)
CREATE POLICY "Anyone can subscribe" 
    ON subscribers FOR INSERT 
    WITH CHECK (true);

-- Allow viewing for authenticated users (admins)
CREATE POLICY "Admins can view subscribers" 
    ON subscribers FOR SELECT 
    USING (auth.role() = 'authenticated');
