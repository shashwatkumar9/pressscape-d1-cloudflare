-- Payment System Schema Updates for Multi-Gateway Support
-- Run this migration to add PayPal, Razorpay, and Payout support

-- =====================================================
-- UPDATE ORDERS TABLE - Add Payment Gateway Support
-- =====================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'stripe' CHECK (payment_gateway IN ('stripe', 'paypal', 'razorpay')),
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- =====================================================
-- PAYOUT SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer')),
  paypal_email TEXT,
  payoneer_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- PAYOUT REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payout_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  payout_method TEXT NOT NULL CHECK (payout_method IN ('paypal', 'payoneer')),
  payout_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'rejected')),
  
  -- Admin Processing
  processed_by TEXT REFERENCES admin_users(id),
  processed_at TIMESTAMPTZ,
  admin_notes TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payout_settings_user_id ON payout_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);
