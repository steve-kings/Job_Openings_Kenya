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
    ('cv_pro_design_price', '200')
ON CONFLICT (key) DO NOTHING;
