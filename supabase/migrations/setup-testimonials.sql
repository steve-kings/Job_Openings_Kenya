CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_photo_url TEXT,
    opportunity_won TEXT NOT NULL,
    story TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view approved testimonials
CREATE POLICY "Approved testimonials are viewable by everyone" ON testimonials
    FOR SELECT USING (status = 'approved');

-- Users can view their own testimonials
CREATE POLICY "Users can view their own testimonials" ON testimonials
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own testimonials
CREATE POLICY "Users can insert their own testimonials" ON testimonials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials" ON testimonials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update all testimonials
CREATE POLICY "Admins can update all testimonials" ON testimonials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can delete all testimonials
CREATE POLICY "Admins can delete all testimonials" ON testimonials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
