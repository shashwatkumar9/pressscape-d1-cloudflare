-- Link Verification System Migration
-- Adds fields to track whether published articles contain the buyer's backlink

ALTER TABLE orders ADD COLUMN IF NOT EXISTS link_verified BOOLEAN;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS link_verified_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS link_verification_error TEXT;

-- Index for finding orders that need verification
CREATE INDEX IF NOT EXISTS idx_orders_link_verified ON orders(link_verified) WHERE status = 'published';

COMMENT ON COLUMN orders.link_verified IS 'Whether the target_url was found in the published article_url';
COMMENT ON COLUMN orders.link_verified_at IS 'Timestamp of last link verification check';
COMMENT ON COLUMN orders.link_verification_error IS 'Error message if verification failed (e.g., 404, timeout)';
