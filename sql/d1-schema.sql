-- PressScape Database Schema for Cloudflare D1 (SQLite)
-- =====================================================
-- KEY DIFFERENCES FROM POSTGRESQL:
-- 1. UUIDs generated in application code
-- 2. TIMESTAMPTZ replaced with TEXT (ISO 8601 format)
-- 3. JSONB replaced with TEXT (JSON strings)
-- 4. DECIMAL replaced with REAL
-- 5. Arrays stored as JSON text
-- =====================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- =====================================================
-- USER & AUTHENTICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  password_hash TEXT,
  name TEXT NOT NULL,
  avatar_url TEXT,

  -- Role flags (user can have multiple)
  is_buyer INTEGER DEFAULT 0,
  is_publisher INTEGER DEFAULT 0,
  is_affiliate INTEGER DEFAULT 0,

  -- Balances (in cents)
  buyer_balance INTEGER DEFAULT 0,
  publisher_balance INTEGER DEFAULT 0,
  affiliate_balance INTEGER DEFAULT 0,
  contributor_balance INTEGER DEFAULT 0,

  -- Settings
  preferred_currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  notification_email INTEGER DEFAULT 1,
  notification_orders INTEGER DEFAULT 1,

  -- Verification
  is_verified INTEGER DEFAULT 0,
  verified_at TEXT,

  -- Affiliate
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,

  -- Status
  is_active INTEGER DEFAULT 1,
  is_banned INTEGER DEFAULT 0,
  ban_reason TEXT,

  -- Stripe
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,

  FOREIGN KEY (referred_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id TEXT,
  description TEXT,
  icon TEXT,
  website_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- =====================================================
-- WEBSITES (Publisher Inventory)
-- =====================================================

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,

  -- Basic Info
  domain TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Categories
  primary_category_id TEXT,

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

  metrics_updated_at TEXT,
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
  allows_casino INTEGER DEFAULT 0,
  allows_cbd INTEGER DEFAULT 0,
  allows_adult INTEGER DEFAULT 0,
  allows_crypto INTEGER DEFAULT 0,

  -- Turnaround
  turnaround_days INTEGER DEFAULT 7,
  offers_urgent INTEGER DEFAULT 0,

  -- Publishing Details
  link_type TEXT DEFAULT 'dofollow',
  sponsored_tag INTEGER DEFAULT 0,
  indexed_guarantee INTEGER DEFAULT 1,

  -- Content Options
  accepts_buyer_content INTEGER DEFAULT 1,
  offers_writing_service INTEGER DEFAULT 1,
  writing_fee INTEGER DEFAULT 0,

  -- Sample Post
  sample_post_url TEXT,

  -- Verification
  verification_status TEXT DEFAULT 'pending',
  verified_at TEXT,
  verification_method TEXT,
  verification_code TEXT,

  -- Status
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  featured_until TEXT,

  -- Stats
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (primary_category_id) REFERENCES categories(id)
);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,

  -- Parties
  buyer_id TEXT NOT NULL,
  website_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,

  -- Affiliate
  affiliate_id TEXT,
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
  secondary_links TEXT DEFAULT '[]',

  -- Requirements from buyer
  buyer_notes TEXT,
  keywords TEXT DEFAULT '[]',
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
  contributor_id TEXT,
  contributor_earnings INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'writing', 'content_submitted',
    'revision_needed', 'approved', 'published', 'completed',
    'cancelled', 'refunded', 'disputed'
  )),

  -- Deadlines
  turnaround_days INTEGER NOT NULL,
  is_urgent INTEGER DEFAULT 0,
  deadline_at TEXT,

  -- Timestamps
  accepted_at TEXT,
  content_submitted_at TEXT,
  approved_at TEXT,
  published_at TEXT,
  completed_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  cancelled_by TEXT,

  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'released', 'refunded', 'disputed'
  )),
  stripe_payment_intent_id TEXT,
  paid_at TEXT,
  released_at TEXT,

  -- Review
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  buyer_review TEXT,
  reviewed_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (website_id) REFERENCES websites(id),
  FOREIGN KEY (publisher_id) REFERENCES users(id),
  FOREIGN KEY (affiliate_id) REFERENCES users(id),
  FOREIGN KEY (contributor_id) REFERENCES users(id),
  FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

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
  metadata TEXT DEFAULT '{}',

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- AFFILIATE SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,

  referral_code TEXT NOT NULL,
  referral_url TEXT,
  landing_page TEXT,

  status TEXT DEFAULT 'signed_up' CHECK (status IN (
    'signed_up', 'converted', 'active'
  )),

  total_orders INTEGER DEFAULT 0,
  total_commission INTEGER DEFAULT 0,

  first_order_at TEXT,
  first_commission_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (affiliate_id) REFERENCES users(id),
  FOREIGN KEY (referred_user_id) REFERENCES users(id),
  UNIQUE(affiliate_id, referred_user_id)
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL,
  referral_id TEXT NOT NULL,
  order_id TEXT NOT NULL,

  order_amount INTEGER NOT NULL,
  commission_rate REAL DEFAULT 7.5,
  commission_amount INTEGER NOT NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  )),

  approved_at TEXT,
  paid_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (affiliate_id) REFERENCES users(id),
  FOREIGN KEY (referral_id) REFERENCES affiliate_referrals(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- =====================================================
-- MESSAGING SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  publisher_id TEXT NOT NULL,
  last_message_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (publisher_id) REFERENCES users(id),
  UNIQUE(order_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  attachments TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- =====================================================
-- PAYMENT GATEWAYS
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_gateways (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'razorpay')),

  -- Gateway-specific IDs
  gateway_customer_id TEXT,
  gateway_account_id TEXT,

  -- Status
  is_active INTEGER DEFAULT 1,
  is_default INTEGER DEFAULT 0,

  -- Metadata
  account_email TEXT,
  account_country TEXT,
  capabilities TEXT DEFAULT '[]',

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- LINK VERIFICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS link_verifications (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  article_url TEXT NOT NULL,
  target_url TEXT NOT NULL,

  -- Verification status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'verified', 'failed', 'removed'
  )),

  -- Verification details
  verified_at TEXT,
  last_checked_at TEXT,
  check_count INTEGER DEFAULT 0,

  -- Link status
  link_found INTEGER DEFAULT 0,
  is_dofollow INTEGER DEFAULT 0,
  anchor_text TEXT,

  -- Indexing
  is_indexed INTEGER DEFAULT 0,
  indexed_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =====================================================
-- API KEYS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Permissions
  scopes TEXT DEFAULT '[]',

  -- Usage
  last_used_at TEXT,
  usage_count INTEGER DEFAULT 0,

  -- Rate limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,

  -- Status
  is_active INTEGER DEFAULT 1,
  expires_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- PAYOUTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',

  balance_type TEXT NOT NULL CHECK (balance_type IN (
    'publisher', 'affiliate', 'contributor'
  )),

  -- Gateway info
  gateway TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'razorpay')),
  gateway_payout_id TEXT,
  gateway_account_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'paid', 'failed', 'cancelled'
  )),

  -- Timestamps
  requested_at TEXT DEFAULT (datetime('now')),
  processed_at TEXT,
  paid_at TEXT,
  failed_at TEXT,

  -- Details
  failure_reason TEXT,
  admin_notes TEXT,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- WEBSITE CONTRIBUTORS
-- =====================================================

CREATE TABLE IF NOT EXISTS website_contributors (
  id TEXT PRIMARY KEY,
  website_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,

  -- Permissions
  can_write INTEGER DEFAULT 1,
  can_publish INTEGER DEFAULT 0,

  -- Earnings
  earnings_per_article INTEGER DEFAULT 0,
  commission_rate REAL DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'pending', 'active', 'inactive', 'removed'
  )),

  -- Stats
  articles_written INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,

  invited_at TEXT DEFAULT (datetime('now')),
  accepted_at TEXT,

  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(website_id, contributor_id)
);

-- =====================================================
-- BUYER DASHBOARD / FAVORITES
-- =====================================================

CREATE TABLE IF NOT EXISTS buyer_favorites (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  website_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
  UNIQUE(buyer_id, website_id)
);

CREATE TABLE IF NOT EXISTS buyer_saved_searches (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  filters TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- DISPUTES
-- =====================================================

CREATE TABLE IF NOT EXISTS disputes (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,

  -- Parties
  filed_by TEXT NOT NULL,
  filed_against TEXT NOT NULL,

  -- Dispute details
  reason TEXT NOT NULL CHECK (reason IN (
    'quality', 'guidelines', 'deadline', 'link_removed', 'payment', 'other'
  )),
  description TEXT NOT NULL,
  evidence TEXT DEFAULT '[]',

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN (
    'open', 'under_review', 'resolved', 'closed'
  )),

  -- Resolution
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TEXT,

  -- Outcome
  outcome TEXT CHECK (outcome IN (
    'buyer_favor', 'publisher_favor', 'partial_refund', 'no_action'
  )),
  refund_amount INTEGER DEFAULT 0,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (filed_by) REFERENCES users(id),
  FOREIGN KEY (filed_against) REFERENCES users(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dispute_messages (
  id TEXT PRIMARY KEY,
  dispute_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_websites_owner ON websites(owner_id);
CREATE INDEX IF NOT EXISTS idx_websites_domain ON websites(domain);
CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);
CREATE INDEX IF NOT EXISTS idx_websites_category ON websites(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(verification_status, is_active);
CREATE INDEX IF NOT EXISTS idx_websites_metrics ON websites(domain_authority DESC, domain_rating DESC);
CREATE INDEX IF NOT EXISTS idx_websites_active ON websites(is_active, verification_status);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_publisher ON orders(publisher_id);
CREATE INDEX IF NOT EXISTS idx_orders_website ON orders(website_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_affiliate ON orders(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_order ON conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_publisher ON conversations(publisher_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(is_read, conversation_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referred ON affiliate_referrals(referred_user_id);

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order ON affiliate_commissions(order_id);

CREATE INDEX IF NOT EXISTS idx_link_verifications_order ON link_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_link_verifications_status ON link_verifications(status);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- =====================================================
-- SEED DATA: Categories
-- =====================================================

INSERT OR IGNORE INTO categories (id, name, slug, display_order) VALUES
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
('general', 'General', 'general', 20);
