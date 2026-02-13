-- PressScape Database Schema for Vercel Postgres
-- =====================================================
-- USER & AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  password_hash TEXT,
  name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role flags (user can have multiple)
  is_buyer BOOLEAN DEFAULT false,
  is_publisher BOOLEAN DEFAULT false,
  is_affiliate BOOLEAN DEFAULT false,
  
  -- Balances (in cents)
  buyer_balance INTEGER DEFAULT 0,
  publisher_balance INTEGER DEFAULT 0,
  affiliate_balance INTEGER DEFAULT 0,
  contributor_balance INTEGER DEFAULT 0,
  
  -- Settings
  preferred_currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  notification_email BOOLEAN DEFAULT true,
  notification_orders BOOLEAN DEFAULT true,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Affiliate
  affiliate_code TEXT UNIQUE,
  referred_by TEXT REFERENCES users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id TEXT REFERENCES categories(id),
  description TEXT,
  icon TEXT,
  website_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBSITES (Publisher Inventory)
-- =====================================================

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Categories
  primary_category_id TEXT REFERENCES categories(id),
  
  -- Languages
  primary_language TEXT DEFAULT 'English',
  
  -- Metrics (updated periodically)
  domain_authority INTEGER,
  domain_rating INTEGER,
  trust_flow INTEGER,
  citation_flow INTEGER,
  organic_traffic INTEGER,
  referring_domains INTEGER,
  spam_score INTEGER,
  
  metrics_updated_at TIMESTAMPTZ,
  metrics_source TEXT,
  
  -- Traffic Details
  traffic_country_1 TEXT,
  traffic_country_1_percent INTEGER,
  traffic_country_2 TEXT,
  traffic_country_2_percent INTEGER,
  traffic_country_3 TEXT,
  traffic_country_3_percent INTEGER,
  
  -- Pricing (in cents USD)
  price_guest_post INTEGER,
  price_link_insertion INTEGER,
  price_homepage_link INTEGER,
  price_content_writing INTEGER,
  price_extra_link INTEGER DEFAULT 0,
  price_urgent INTEGER DEFAULT 0,
  
  -- Content Requirements
  min_word_count INTEGER DEFAULT 500,
  max_word_count INTEGER DEFAULT 2000,
  max_links INTEGER DEFAULT 2,
  allows_casino BOOLEAN DEFAULT false,
  allows_cbd BOOLEAN DEFAULT false,
  allows_adult BOOLEAN DEFAULT false,
  allows_crypto BOOLEAN DEFAULT false,
  
  -- Turnaround
  turnaround_days INTEGER DEFAULT 7,
  offers_urgent BOOLEAN DEFAULT false,
  
  -- Publishing Details
  link_type TEXT DEFAULT 'dofollow',
  sponsored_tag BOOLEAN DEFAULT false,
  indexed_guarantee BOOLEAN DEFAULT true,
  
  -- Content Options
  accepts_buyer_content BOOLEAN DEFAULT true,
  offers_writing_service BOOLEAN DEFAULT true,
  writing_fee INTEGER DEFAULT 0,
  
  -- Sample Post
  sample_post_url TEXT,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  verification_method TEXT,
  verification_code TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  
  -- Stats
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_number TEXT UNIQUE NOT NULL,
  
  -- Parties
  buyer_id TEXT NOT NULL REFERENCES users(id),
  website_id TEXT NOT NULL REFERENCES websites(id),
  publisher_id TEXT NOT NULL REFERENCES users(id),
  
  -- Affiliate
  affiliate_id TEXT REFERENCES users(id),
  affiliate_code TEXT,
  
  -- Order Type
  order_type TEXT NOT NULL CHECK (order_type IN (
    'guest_post', 'link_insertion', 'homepage_link', 'content_only'
  )),
  
  -- Content
  content_source TEXT NOT NULL CHECK (content_source IN (
    'buyer_provided', 'publisher_writes', 'contributor_writes', 'platform_writes'
  )),
  
  -- Article Details
  article_title TEXT,
  article_content TEXT,
  article_url TEXT,
  target_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  secondary_links JSONB DEFAULT '[]',
  
  -- Requirements from buyer
  buyer_notes TEXT,
  keywords TEXT[] DEFAULT '{}',
  word_count_requested INTEGER,
  
  -- Pricing (in cents)
  base_price INTEGER NOT NULL,
  writing_fee INTEGER DEFAULT 0,
  extra_links_fee INTEGER DEFAULT 0,
  urgent_fee INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  affiliate_fee INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  publisher_earnings INTEGER NOT NULL,
  
  -- Contributor
  contributor_id TEXT REFERENCES users(id),
  contributor_earnings INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'writing', 'content_submitted',
    'revision_needed', 'approved', 'published', 'completed',
    'cancelled', 'refunded', 'disputed'
  )),
  
  -- Deadlines
  turnaround_days INTEGER NOT NULL,
  is_urgent BOOLEAN DEFAULT false,
  deadline_at TIMESTAMPTZ,
  
  -- Timestamps
  accepted_at TIMESTAMPTZ,
  content_submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by TEXT REFERENCES users(id),
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'released', 'refunded', 'disputed'
  )),
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  
  -- Review
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  buyer_review TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  
  type TEXT NOT NULL CHECK (type IN (
    'deposit', 'purchase', 'earning', 'affiliate',
    'contributor', 'withdrawal', 'refund', 'fee'
  )),
  
  reference_type TEXT,
  reference_id TEXT,
  
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  balance_type TEXT CHECK (balance_type IN (
    'buyer', 'publisher', 'affiliate', 'contributor'
  )),
  balance_before INTEGER,
  balance_after INTEGER,
  
  status TEXT DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'failed', 'cancelled'
  )),
  
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AFFILIATE SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  affiliate_id TEXT NOT NULL REFERENCES users(id),
  referred_user_id TEXT NOT NULL REFERENCES users(id),
  
  referral_code TEXT NOT NULL,
  referral_url TEXT,
  landing_page TEXT,
  
  status TEXT DEFAULT 'signed_up' CHECK (status IN (
    'signed_up', 'converted', 'active'
  )),
  
  total_orders INTEGER DEFAULT 0,
  total_commission INTEGER DEFAULT 0,
  
  first_order_at TIMESTAMPTZ,
  first_commission_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(affiliate_id, referred_user_id)
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  affiliate_id TEXT NOT NULL REFERENCES users(id),
  referral_id TEXT NOT NULL REFERENCES affiliate_referrals(id),
  order_id TEXT NOT NULL REFERENCES orders(id),
  
  order_amount INTEGER NOT NULL,
  commission_rate DECIMAL(4,2) DEFAULT 7.5,
  commission_amount INTEGER NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  )),
  
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_owner ON websites(owner_id);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);
CREATE INDEX IF NOT EXISTS idx_websites_category ON websites(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(verification_status, is_active);
CREATE INDEX IF NOT EXISTS idx_websites_metrics ON websites(domain_authority DESC, domain_rating DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_publisher ON orders(publisher_id);
CREATE INDEX IF NOT EXISTS idx_orders_website ON orders(website_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);

-- =====================================================
-- SEED DATA: Categories
-- =====================================================

INSERT INTO categories (id, name, slug, display_order) VALUES
('tech', 'Technology', 'technology', 1),
('business', 'Business & Finance', 'business-finance', 2),
('health', 'Health & Wellness', 'health-wellness', 3),
('lifestyle', 'Lifestyle', 'lifestyle', 4),
('travel', 'Travel', 'travel', 5),
('food', 'Food & Drink', 'food-drink', 6),
('fashion', 'Fashion & Beauty', 'fashion-beauty', 7),
('home', 'Home & Garden', 'home-garden', 8),
('auto', 'Automotive', 'automotive', 9),
('sports', 'Sports & Fitness', 'sports-fitness', 10),
('education', 'Education', 'education', 11),
('entertainment', 'Entertainment', 'entertainment', 12),
('news', 'News & Media', 'news-media', 13),
('marketing', 'Marketing & SEO', 'marketing-seo', 14),
('legal', 'Legal', 'legal', 15),
('realestate', 'Real Estate', 'real-estate', 16),
('crypto', 'Crypto & Blockchain', 'crypto-blockchain', 17),
('gaming', 'Gaming', 'gaming', 18),
('pets', 'Pets & Animals', 'pets-animals', 19),
('general', 'General', 'general', 20)
ON CONFLICT (id) DO NOTHING;
