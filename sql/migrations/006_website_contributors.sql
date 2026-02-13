-- Migration: Website Contributors
-- Allows multiple writers to offer content writing services on the same website
-- with individual pricing, so buyers can choose based on ratings and cost.

-- Website Contributors table
CREATE TABLE IF NOT EXISTS website_contributors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Pricing (in cents USD)
  writing_price INTEGER NOT NULL,          -- Price for content writing
  
  -- Contributor profile
  display_name TEXT,                        -- Optional display name
  bio TEXT,                                 -- Short description
  specialties TEXT[] DEFAULT '{}',          -- e.g., ['tech', 'business', 'health']
  sample_work_url TEXT,                     -- Link to portfolio/sample
  
  -- Stats (updated after each completed order)
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,        -- Owner approval required
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Turnaround
  turnaround_days INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(website_id, user_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_website_contributors_website 
  ON website_contributors(website_id);

CREATE INDEX IF NOT EXISTS idx_website_contributors_user 
  ON website_contributors(user_id);

CREATE INDEX IF NOT EXISTS idx_website_contributors_active 
  ON website_contributors(website_id, is_active, is_approved);

CREATE INDEX IF NOT EXISTS idx_website_contributors_rating
  ON website_contributors(website_id, average_rating DESC);

-- Add contributor_id to orders if not exists (for tracking which contributor fulfilled the order)
-- Note: This column may already exist in the schema, so we use a DO block
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'selected_contributor_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN selected_contributor_id TEXT REFERENCES website_contributors(id);
  END IF;
END $$;

-- Add index for contributor orders
CREATE INDEX IF NOT EXISTS idx_orders_contributor 
  ON orders(selected_contributor_id) 
  WHERE selected_contributor_id IS NOT NULL;
