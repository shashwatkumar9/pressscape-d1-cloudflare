-- Migration: 008_disputes.sql
-- Add buyer confirmation workflow and disputes system

-- =====================================================
-- ADD BUYER CONFIRMATION COLUMNS TO ORDERS
-- =====================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmation_deadline TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_rejected_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_rejection_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_protection_until TIMESTAMPTZ;

-- =====================================================
-- CREATE DISPUTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Who raised the dispute
  raised_by TEXT NOT NULL REFERENCES users(id),
  raised_by_role TEXT NOT NULL CHECK (raised_by_role IN ('buyer', 'publisher')),
  
  -- Dispute details
  reason TEXT NOT NULL CHECK (reason IN (
    'link_removed',        -- Backlink was removed
    'content_changed',     -- Article content was modified
    'wrong_url',           -- Published on wrong URL
    'nofollow_added',      -- Link was changed to nofollow
    'terms_violated',      -- Publisher claims buyer violated terms
    'quality_issues',      -- Content quality doesn't match expectations
    'deadline_missed',     -- Deadline was not met
    'other'                -- Other reason
  )),
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  
  -- Status tracking
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open',               -- Just created
    'under_review',       -- Admin is reviewing
    'awaiting_response',  -- Waiting for other party's response
    'resolved_buyer',     -- Resolved in favor of buyer (refund)
    'resolved_publisher', -- Resolved in favor of publisher
    'closed'              -- Closed without action
  )),
  
  -- Response from other party
  respondent_id TEXT REFERENCES users(id),
  respondent_comment TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Admin resolution
  admin_notes TEXT,
  resolution TEXT,
  refund_amount INTEGER DEFAULT 0,
  resolved_by TEXT REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_deadline ON orders(buyer_confirmation_deadline) WHERE buyer_confirmation_deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_dispute_protection ON orders(dispute_protection_until) WHERE dispute_protection_until IS NOT NULL;
