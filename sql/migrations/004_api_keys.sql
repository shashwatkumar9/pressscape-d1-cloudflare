-- API Keys for Buyer API Authentication
-- Migration: 004_api_keys.sql

-- API Keys table for authentication
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    prefix TEXT NOT NULL,  -- First 8 chars of key for identification (e.g., "ps_abc123")
    permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],  -- read, write, orders
    rate_limit INTEGER DEFAULT 100,  -- requests per minute
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    request_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ  -- NULL means no expiration
);

-- Rate limiting tracking table
CREATE TABLE IF NOT EXISTS api_rate_limits (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER DEFAULT 0,
    UNIQUE(api_key_id, window_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_key ON api_rate_limits(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON api_rate_limits(window_start);

-- Clean up old rate limit records (run periodically)
-- DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
