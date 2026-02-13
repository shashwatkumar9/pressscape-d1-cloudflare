-- Payouts table for tracking withdrawal requests
CREATE TABLE IF NOT EXISTS payouts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer', 'wallet_transfer', 'bank_transfer')),
    payout_email TEXT,
    balance_type TEXT NOT NULL CHECK (balance_type IN ('publisher', 'affiliate', 'contributor')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_id TEXT,
    notes TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at);

-- Add payout_method column to users if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payoneer_email TEXT;
