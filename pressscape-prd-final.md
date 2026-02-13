# Table of Contents {#table-of-contents .TOC-Heading}

# PressScape - Product Requirements Document

## Guest Post & Sponsored Content Marketplace

### Solo Developer Edition

# SOLO DEVELOPER ADAPTATION

## Important Notice

This PRD outlines a comprehensive guest post marketplace connecting
content buyers with website publishers. Designed for solo developer
implementation with AI-assisted development (Claude Code).

**Domain:** pressscape.com

# 1. Executive Summary

## 1.1 Product Vision

**PressScape** is a premium guest post and sponsored content marketplace
that connects brands, agencies, and SEO professionals with quality
website publishers. We facilitate the buying and selling of guest posts,
sponsored articles, link insertions, and PR placements across thousands
of verified websites.

**Tagline:** "Where Quality Content Meets Premium Publishers"

**Mission:** Create the most transparent, efficient, and trustworthy
marketplace for guest posting and sponsored content, benefiting both
publishers seeking monetization and buyers seeking quality backlinks and
exposure.

## 1.2 Business Model

### Revenue Streams

  -----------------------------------------------------------------------
  Stream                  Rate                    Description
  ----------------------- ----------------------- -----------------------
  **Platform Commission** 25%                     Deducted from publisher
                                                  earnings

  **Affiliate Program**   7.5%                    Of total order value to
                                                  affiliates

  **Featured Listings**   Variable                Publishers pay for
                                                  visibility

  **Buyer Subscriptions** Monthly                 Premium buyer features
  -----------------------------------------------------------------------

### Transaction Flow Example

    Buyer Pays: $100 (order total)
    ├── Publisher Receives: $75 (75% of order)
    ├── Platform Commission: $25 (25% of order)
    │   └── If Affiliate Referred:
    │       ├── Affiliate Receives: $7.50 (7.5% of $100)
    │       └── Platform Net: $17.50

## 1.3 User Roles (Switchable)

Every user can activate multiple roles and switch between dashboards:

  -------------------------------------------------------------------------
  Role            Description                  Key Actions
  --------------- ---------------------------- ----------------------------
  **Buyer**       Purchases guest posts/links  Browse, order, manage
                                               campaigns

  **Publisher     Owns websites, full control  Add sites, set prices,
  Owner**                                      approve orders

  **Publisher     Writes content for           Accept writing tasks, submit
  Contributor**   publishers                   articles

  **Publisher     Reviews/approves content     Edit submissions, manage
  Editor**                                     quality

  **Affiliate**   Refers buyers/publishers     Share links, earn
                                               commissions
  -------------------------------------------------------------------------

## 1.4 Market Opportunity

### Global Guest Post Market

  -----------------------------------------------------------------------
  Metric                              Value
  ----------------------------------- -----------------------------------
  Global SEO Services Market          \$80+ Billion (2024)

  Link Building Market                \$5+ Billion

  Content Marketing                   \$70+ Billion

  Guest Post Platforms                \$500M+

  Average Guest Post Price            \$50-500

  Premium Placements                  \$500-5,000+
  -----------------------------------------------------------------------

### Target Customers

**Buyers:** \| Segment \| Size \| Avg. Monthly Spend \|
\|---------\|------\|-------------------\| \| SEO Agencies \| 50,000+ \|
\$2,000-50,000 \| \| In-house SEO Teams \| 100,000+ \| \$500-10,000 \|
\| Small Business Owners \| 500,000+ \| \$100-1,000 \| \| Affiliate
Marketers \| 200,000+ \| \$200-5,000 \| \| PR Agencies \| 20,000+ \|
\$5,000-100,000 \|

**Publishers:** \| Segment \| Count \| Motivation \|
\|---------\|-------\|------------\| \| Niche Bloggers \| 1M+ \|
Monetization \| \| News Sites \| 50,000+ \| Additional revenue \| \|
Magazine Sites \| 10,000+ \| Sponsored content \| \| Industry Blogs \|
100,000+ \| Monetization \|

## 1.5 Competitive Landscape

  ------------------------------------------------------------------------
  Platform           Commission        Strengths         Weaknesses
  ------------------ ----------------- ----------------- -----------------
  **PRNews.io**      30%               Large inventory   Expensive, slow

  **PRPosting**      25-30%            Good UI           Limited filters

  **Accessily**      20-25%            Affordable        Quality issues

  **Adsy**           30%               Large network     Complex pricing

  **Getfluence**     30%+              Premium brands    Very expensive

  **Collaborator**   25%               Good for EU       Limited US sites

  **PressScape**     **25%**           Modern UI,        New entrant
                                       transparent       
  ------------------------------------------------------------------------

## 1.6 PressScape Differentiators

  ------------------------------------------------------------------------------
  Feature                 Competitors             PressScape
  ----------------------- ----------------------- ------------------------------
  Commission              25-35%                  **25%**

  Affiliate Rate          5-10%                   **7.5%**

  Role Switching          Limited                 **Full flexibility**

  Publisher Roles         Owner only              **Owner/Editor/Contributor**

  Real-time Metrics       Delayed                 **Live Ahrefs/Moz data**

  Content Writing         Separate                **Built-in marketplace**

  Bulk Orders             Basic                   **Advanced campaign manager**

  API Access              Premium only            **All paid plans**
  ------------------------------------------------------------------------------

## 1.7 Solo Developer Context

  -----------------------------------------------------------------------
  Aspect                              Value
  ----------------------------------- -----------------------------------
  **Developer**                       Solo + Claude Code

  **Budget**                          \~\$12,000 over 18 months

  **Domain**                          pressscape.com

  **Target Launch**                   14 weeks (MVP)

  **Initial Focus**                   Core marketplace + Buyer/Publisher
                                      dashboards
  -----------------------------------------------------------------------

# 2. User Roles & Permissions

## 2.1 Role Architecture

    ┌─────────────────────────────────────────────────────────────────┐
    │                     USER ACCOUNT                                │
    │                   (Single Login)                                │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
    │  │   BUYER     │  │  PUBLISHER  │  │  AFFILIATE  │            │
    │  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │            │
    │  └─────────────┘  └─────────────┘  └─────────────┘            │
    │                          │                                     │
    │         ┌────────────────┼────────────────┐                   │
    │         │                │                │                   │
    │         ▼                ▼                ▼                   │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
    │  │    OWNER    │  │   EDITOR    │  │ CONTRIBUTOR │           │
    │  │ (per site)  │  │ (per site)  │  │ (per site)  │           │
    │  └─────────────┘  └─────────────┘  └─────────────┘           │
    │                                                                 │
    │  [Switch Role] button always visible in header                 │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘

## 2.2 Role Permissions Matrix

### 2.2.1 Buyer Permissions

  -----------------------------------------------------------------------
  Permission                          Description
  ----------------------------------- -----------------------------------
  Browse marketplace                  View all listed sites

  Filter & search                     Advanced search filters

  View site metrics                   DA, DR, traffic, etc.

  Place orders                        Purchase guest posts

  Submit content                      Provide article or request writing

  Track orders                        Monitor order status

  Request revisions                   Ask for content changes

  Leave reviews                       Rate publishers

  Manage campaigns                    Bulk order management

  Download invoices                   Access billing

  API access                          Programmatic ordering
  -----------------------------------------------------------------------

### 2.2.2 Publisher Owner Permissions

  -----------------------------------------------------------------------
  Permission                          Description
  ----------------------------------- -----------------------------------
  Add websites                        Register new sites

  Edit site details                   Update info, pricing

  Remove websites                     Delist sites

  Set pricing                         Configure all price points

  Accept/reject orders                Full order control

  Manage team                         Invite editors/contributors

  View earnings                       Full financial access

  Withdraw funds                      Request payouts

  View analytics                      Site performance data

  Respond to reviews                  Reply to buyer feedback
  -----------------------------------------------------------------------

### 2.2.3 Publisher Editor Permissions

  -----------------------------------------------------------------------
  Permission                          Description
  ----------------------------------- -----------------------------------
  View assigned sites                 See sites they edit for

  Review submissions                  Check contributor content

  Edit content                        Modify articles

  Approve/reject                      Content quality control

  Request revisions                   From contributors

  Communicate                         With contributors & buyers

  View site metrics                   Performance data

  **Cannot:**                         Set prices, withdraw funds, add
                                      sites
  -----------------------------------------------------------------------

### 2.2.4 Publisher Contributor Permissions

  -----------------------------------------------------------------------
  Permission                          Description
  ----------------------------------- -----------------------------------
  View writing tasks                  See available assignments

  Claim tasks                         Accept writing jobs

  Submit content                      Upload articles

  View feedback                       Editor comments

  Track earnings                      Contributor payments

  Withdraw earnings                   Request contributor payout

  **Cannot:**                         Edit others' work, approve content,
                                      manage sites
  -----------------------------------------------------------------------

### 2.2.5 Affiliate Permissions

  -----------------------------------------------------------------------
  Permission                          Description
  ----------------------------------- -----------------------------------
  Generate links                      Create referral URLs

  View referrals                      Track referred users

  Track earnings                      Commission tracking

  Withdraw earnings                   Request affiliate payout

  Access creatives                    Marketing materials

  View analytics                      Conversion data
  -----------------------------------------------------------------------

## 2.3 Role Activation Flow

    New User Signs Up
           │
           ▼
    ┌─────────────────────────────────────────┐
    │  "How would you like to use PressScape?" │
    │                                         │
    │  ☑ I want to BUY guest posts           │
    │  ☑ I want to SELL guest posts          │
    │  ☑ I want to EARN as an affiliate      │
    │                                         │
    │  [Continue]                             │
    └─────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │  Buyer: Ready immediately               │
    │  Publisher: Add your first site →       │
    │  Affiliate: Get your referral link →    │
    └─────────────────────────────────────────┘

## 2.4 Dashboard Switching

    ┌─────────────────────────────────────────────────────────────────┐
    │ HEADER                                                          │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │  ┌──────────────────────────────────────────┐                  │
    │  │ 👤 John Smith              ▼             │  [$ Balance]     │
    │  │ ┌──────────────────────────────────────┐ │                  │
    │  │ │ 🛒 Buyer Dashboard                   │ │                  │
    │  │ │ 📰 Publisher Dashboard        ●      │ │ ← Current       │
    │  │ │ 🔗 Affiliate Dashboard              │ │                  │
    │  │ │ ─────────────────────────────────── │ │                  │
    │  │ │ ⚙️ Account Settings                  │ │                  │
    │  │ │ 🚪 Logout                            │ │                  │
    │  │ └──────────────────────────────────────┘ │                  │
    │  └──────────────────────────────────────────┘                  │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘

# 3. Technical Architecture

## 3.1 Tech Stack

  -----------------------------------------------------------------------
  Component         Technology        Cost/Month        Rationale
  ----------------- ----------------- ----------------- -----------------
  **Frontend**      Next.js 14        Free              SSR, great DX

  **Backend**       Next.js API       Free              Unified codebase
                    Routes                              

  **Database**      Neon PostgreSQL   \$0→\$19          No pause,
                                                        reliable

  **Cache**         Upstash Redis     \$0→\$20          Sessions, rate
                                                        limiting

  **Search**        Meilisearch on    \$5→\$30          Fast site search
                    Railway                             

  **Hosting**       Vercel            \$0→\$20          Auto-scaling

  **Workers**       Railway           \$5→\$50          Background jobs

  **Storage**       Cloudflare R2     \$0→\$15          Articles, images

  **Auth**          Lucia Auth        Free              Flexible, secure

  **Payments**      Stripe            2.9% + \$0.30     Global payments

  **Email**         Resend            \$0→\$20          Transactional

  **Metrics API**   Ahrefs/Moz        \$99→\$199        Site metrics
  -----------------------------------------------------------------------

### 3.1.1 Architecture Diagram

    ┌──────────────────────────────────────────────────────────────────────┐
    │                      PRESSSCAPE ARCHITECTURE                         │
    ├──────────────────────────────────────────────────────────────────────┤
    │                                                                      │
    │     ┌────────────────────────────────────────────────────────────┐  │
    │     │                      Cloudflare                             │  │
    │     │              (CDN + DDoS + DNS + R2 Storage)               │  │
    │     └────────────────────────────────────────────────────────────┘  │
    │                              │                                       │
    │     ┌────────────────────────▼────────────────────────────────────┐ │
    │     │                       Vercel                                 │ │
    │     │  ┌────────────────────────────────────────────────────────┐ │ │
    │     │  │                   Next.js 14 App                        │ │ │
    │     │  │  • Marketplace (SSR)    • API Routes                   │ │ │
    │     │  │  • Dashboards (CSR)     • Webhooks                     │ │ │
    │     │  │  • Public Pages (ISR)   • Auth Middleware              │ │ │
    │     │  └────────────────────────────────────────────────────────┘ │ │
    │     └──────────────────────────────────────────────────────────────┘ │
    │                              │                                       │
    │     ┌──────────────┬─────────┴──────────┬──────────────┐           │
    │     │              │                    │              │           │
    │     ▼              ▼                    ▼              ▼           │
    │ ┌────────┐   ┌──────────┐        ┌──────────┐   ┌──────────┐      │
    │ │  Neon  │   │ Upstash  │        │Meilisearch│   │ Railway  │      │
    │ │  (DB)  │   │ (Redis)  │        │ (Search) │   │(Workers) │      │
    │ └────────┘   └──────────┘        └──────────┘   └──────────┘      │
    │                                                       │            │
    │     EXTERNAL SERVICES                                 │            │
    │     ┌──────────┬──────────┬──────────┬──────────┐   │            │
    │     │  Stripe  │  Resend  │ Ahrefs   │ Moz API  │   │            │
    │     │(Payments)│ (Email)  │(Metrics) │(Metrics) │   │            │
    │     └──────────┴──────────┴──────────┴──────────┘   │            │
    │                                                       │            │
    │     BACKGROUND JOBS (Railway)  ◄──────────────────────┘            │
    │     ┌────────────────────────────────────────────────────────────┐ │
    │     │ • Metrics refresh (daily)      • Payout processing         │ │
    │     │ • Order status updates         • Email notifications       │ │
    │     │ • Site verification            • Affiliate tracking        │ │
    │     │ • Report generation            • Cleanup tasks             │ │
    │     └────────────────────────────────────────────────────────────┘ │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘

## 3.2 Database Schema

### 3.2.1 Core Tables

    -- =====================================================
    -- USER & AUTHENTICATION
    -- =====================================================

    CREATE TABLE users (
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
      buyer_balance INTEGER DEFAULT 0,        -- For purchases
      publisher_balance INTEGER DEFAULT 0,    -- Earnings from sales
      affiliate_balance INTEGER DEFAULT 0,    -- Affiliate commissions
      contributor_balance INTEGER DEFAULT 0,  -- Writing earnings
      
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
      stripe_connect_id TEXT,  -- For publisher payouts
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    );

    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =====================================================
    -- WEBSITES (Publisher Inventory)
    -- =====================================================

    CREATE TABLE websites (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      
      -- Basic Info
      domain TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      
      -- Categories
      primary_category_id TEXT REFERENCES categories(id),
      secondary_categories TEXT[] DEFAULT '{}',
      
      -- Languages
      primary_language TEXT DEFAULT 'English',
      additional_languages TEXT[] DEFAULT '{}',
      
      -- Metrics (updated daily)
      domain_authority INTEGER,      -- Moz DA (0-100)
      domain_rating INTEGER,         -- Ahrefs DR (0-100)
      trust_flow INTEGER,            -- Majestic TF
      citation_flow INTEGER,         -- Majestic CF
      organic_traffic INTEGER,       -- Monthly organic
      referring_domains INTEGER,     -- Backlink profile
      spam_score INTEGER,            -- Moz spam score
      alexa_rank INTEGER,            -- Global rank
      
      metrics_updated_at TIMESTAMPTZ,
      metrics_source TEXT,           -- 'ahrefs', 'moz', 'manual'
      
      -- Traffic Details
      traffic_country_1 TEXT,
      traffic_country_1_percent INTEGER,
      traffic_country_2 TEXT,
      traffic_country_2_percent INTEGER,
      traffic_country_3 TEXT,
      traffic_country_3_percent INTEGER,
      
      -- Pricing (in cents USD)
      price_guest_post INTEGER,           -- Guest post with 1 link
      price_link_insertion INTEGER,       -- Add link to existing article
      price_homepage_link INTEGER,        -- Link from homepage
      price_content_writing INTEGER,      -- If platform writes content
      
      -- Additional Pricing
      price_extra_link INTEGER DEFAULT 0, -- Per additional link
      price_urgent INTEGER DEFAULT 0,     -- Rush fee (24-48h)
      
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
      link_type TEXT DEFAULT 'dofollow',  -- dofollow, nofollow, mixed
      sponsored_tag BOOLEAN DEFAULT false,
      indexed_guarantee BOOLEAN DEFAULT true,
      
      -- Content Options
      accepts_buyer_content BOOLEAN DEFAULT true,
      offers_writing_service BOOLEAN DEFAULT true,
      writing_fee INTEGER DEFAULT 0,      -- Additional if platform writes
      
      -- Sample Post
      sample_post_url TEXT,
      
      -- Verification
      verification_status TEXT DEFAULT 'pending', 
      -- pending, verified, rejected, suspended
      verified_at TIMESTAMPTZ,
      verification_method TEXT,           -- dns, meta_tag, file
      
      -- Status
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      featured_until TIMESTAMPTZ,
      
      -- Stats
      total_orders INTEGER DEFAULT 0,
      completed_orders INTEGER DEFAULT 0,
      average_rating DECIMAL(2,1) DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      
      -- SEO
      slug TEXT UNIQUE NOT NULL,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Website Team Members (Editors & Contributors)
    CREATE TABLE website_team (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('editor', 'contributor')),
      
      -- Contributor-specific
      rate_per_word DECIMAL(4,2),         -- e.g., $0.05/word
      flat_rate_per_article INTEGER,       -- Or flat rate per article
      
      -- Permissions
      can_accept_orders BOOLEAN DEFAULT false,
      can_set_prices BOOLEAN DEFAULT false,
      
      -- Status
      is_active BOOLEAN DEFAULT true,
      invited_at TIMESTAMPTZ DEFAULT NOW(),
      accepted_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      UNIQUE(website_id, user_id)
    );

    -- =====================================================
    -- CATEGORIES
    -- =====================================================

    CREATE TABLE categories (
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

    -- Seed Categories
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
    ('general', 'General', 'general', 20);

    -- =====================================================
    -- ORDERS
    -- =====================================================

    CREATE TABLE orders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_number TEXT UNIQUE NOT NULL,  -- PS-12345
      
      -- Parties
      buyer_id TEXT NOT NULL REFERENCES users(id),
      website_id TEXT NOT NULL REFERENCES websites(id),
      publisher_id TEXT NOT NULL REFERENCES users(id),  -- Website owner
      
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
      article_content TEXT,             -- Buyer-provided content
      article_url TEXT,                 -- Published URL
      target_url TEXT NOT NULL,         -- Link destination
      anchor_text TEXT NOT NULL,
      secondary_links JSONB DEFAULT '[]',  -- [{url, anchor}]
      
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
      platform_fee INTEGER NOT NULL,      -- 25% of subtotal
      affiliate_fee INTEGER DEFAULT 0,    -- 7.5% of subtotal
      total_amount INTEGER NOT NULL,      -- What buyer pays
      publisher_earnings INTEGER NOT NULL, -- What publisher gets (subtotal - platform_fee)
      
      -- If contributor writes
      contributor_id TEXT REFERENCES users(id),
      contributor_earnings INTEGER DEFAULT 0,
      
      -- Status
      status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Awaiting publisher acceptance
        'accepted',          -- Publisher accepted
        'writing',           -- Content being written
        'content_submitted', -- Waiting for publisher review
        'revision_needed',   -- Publisher requested changes
        'approved',          -- Content approved, pending publish
        'published',         -- Live on website
        'completed',         -- Order finalized
        'cancelled',         -- Cancelled
        'refunded',          -- Refunded to buyer
        'disputed'           -- Under dispute
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
      released_at TIMESTAMPTZ,           -- When publisher paid out
      
      -- Review
      buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
      buyer_review TEXT,
      reviewed_at TIMESTAMPTZ,
      
      -- Quality Check
      link_verified BOOLEAN DEFAULT false,
      link_verified_at TIMESTAMPTZ,
      indexed BOOLEAN DEFAULT false,
      indexed_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Order Messages (Communication)
    CREATE TABLE order_messages (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id),
      sender_role TEXT NOT NULL,  -- buyer, publisher, contributor, editor
      
      message TEXT NOT NULL,
      attachments JSONB DEFAULT '[]',  -- [{name, url, size}]
      
      is_read BOOLEAN DEFAULT false,
      read_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Order Activity Log
    CREATE TABLE order_activity (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id),
      
      action TEXT NOT NULL,
      details JSONB DEFAULT '{}',
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =====================================================
    -- PAYMENTS & TRANSACTIONS
    -- =====================================================

    CREATE TABLE transactions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id),
      
      -- Type
      type TEXT NOT NULL CHECK (type IN (
        'deposit',           -- Buyer adds funds
        'purchase',          -- Buyer pays for order
        'earning',           -- Publisher receives payment
        'affiliate',         -- Affiliate commission
        'contributor',       -- Contributor payment
        'withdrawal',        -- User withdraws
        'refund',            -- Refund to buyer
        'fee'                -- Platform fee
      )),
      
      -- Reference
      reference_type TEXT,   -- order, withdrawal, deposit
      reference_id TEXT,
      
      -- Amount (in cents, can be negative for debits)
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      
      -- Balance affected
      balance_type TEXT CHECK (balance_type IN (
        'buyer', 'publisher', 'affiliate', 'contributor'
      )),
      balance_before INTEGER,
      balance_after INTEGER,
      
      -- Status
      status TEXT DEFAULT 'completed' CHECK (status IN (
        'pending', 'completed', 'failed', 'cancelled'
      )),
      
      -- Stripe
      stripe_payment_intent_id TEXT,
      stripe_transfer_id TEXT,
      stripe_payout_id TEXT,
      
      -- Details
      description TEXT,
      metadata JSONB DEFAULT '{}',
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Withdrawal Requests
    CREATE TABLE withdrawals (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id),
      
      -- Amount
      amount INTEGER NOT NULL,           -- Requested amount in cents
      fee INTEGER DEFAULT 0,             -- Withdrawal fee
      net_amount INTEGER NOT NULL,       -- Amount after fee
      currency TEXT DEFAULT 'USD',
      
      -- Source balance
      balance_type TEXT NOT NULL CHECK (balance_type IN (
        'publisher', 'affiliate', 'contributor'
      )),
      
      -- Payment method
      payment_method TEXT NOT NULL CHECK (payment_method IN (
        'stripe', 'paypal', 'bank_transfer', 'wise'
      )),
      payment_details JSONB,             -- Account details
      
      -- Status
      status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'rejected', 'cancelled'
      )),
      
      -- Processing
      processed_at TIMESTAMPTZ,
      processed_by TEXT REFERENCES users(id),
      rejection_reason TEXT,
      
      -- Stripe/PayPal
      payout_id TEXT,
      payout_reference TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =====================================================
    -- AFFILIATE SYSTEM
    -- =====================================================

    CREATE TABLE affiliate_referrals (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id TEXT NOT NULL REFERENCES users(id),
      referred_user_id TEXT NOT NULL REFERENCES users(id),
      
      -- Attribution
      referral_code TEXT NOT NULL,
      referral_url TEXT,
      landing_page TEXT,
      
      -- Status
      status TEXT DEFAULT 'signed_up' CHECK (status IN (
        'signed_up', 'converted', 'active'
      )),
      
      -- Stats
      total_orders INTEGER DEFAULT 0,
      total_commission INTEGER DEFAULT 0,  -- Total earned from this referral
      
      -- First order
      first_order_at TIMESTAMPTZ,
      first_commission_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      
      UNIQUE(affiliate_id, referred_user_id)
    );

    CREATE TABLE affiliate_commissions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id TEXT NOT NULL REFERENCES users(id),
      referral_id TEXT NOT NULL REFERENCES affiliate_referrals(id),
      order_id TEXT NOT NULL REFERENCES orders(id),
      
      -- Commission
      order_amount INTEGER NOT NULL,      -- Total order value
      commission_rate DECIMAL(4,2) DEFAULT 7.5,  -- 7.5%
      commission_amount INTEGER NOT NULL, -- Calculated commission
      
      -- Status
      status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'paid', 'cancelled'
      )),
      
      -- Release (after order completion)
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =====================================================
    -- REVIEWS & RATINGS
    -- =====================================================

    CREATE TABLE reviews (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_id TEXT UNIQUE NOT NULL REFERENCES orders(id),
      website_id TEXT NOT NULL REFERENCES websites(id),
      buyer_id TEXT NOT NULL REFERENCES users(id),
      
      -- Rating
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      
      -- Detailed ratings
      rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
      rating_communication INTEGER CHECK (rating_communication >= 1 AND rating_communication <= 5),
      rating_timeliness INTEGER CHECK (rating_timeliness >= 1 AND rating_timeliness <= 5),
      rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
      
      -- Review
      title TEXT,
      review_text TEXT,
      
      -- Publisher response
      publisher_response TEXT,
      responded_at TIMESTAMPTZ,
      
      -- Moderation
      is_approved BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =====================================================
    -- CAMPAIGNS (Bulk Orders)
    -- =====================================================

    CREATE TABLE campaigns (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      buyer_id TEXT NOT NULL REFERENCES users(id),
      
      name TEXT NOT NULL,
      description TEXT,
      
      -- Target
      target_url TEXT NOT NULL,
      keywords TEXT[] DEFAULT '{}',
      
      -- Budget
      budget_total INTEGER,              -- Total budget in cents
      budget_spent INTEGER DEFAULT 0,
      
      -- Goals
      target_orders INTEGER,
      completed_orders INTEGER DEFAULT 0,
      
      -- Status
      status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'paused', 'completed'
      )),
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE campaign_orders (
      campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
      order_id TEXT NOT NULL REFERENCES orders(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (campaign_id, order_id)
    );

    -- =====================================================
    -- SAVED/FAVORITES
    -- =====================================================

    CREATE TABLE saved_websites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (user_id, website_id)
    );

    -- =====================================================
    -- INDEXES
    -- =====================================================

    -- Users
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_affiliate_code ON users(affiliate_code);
    CREATE INDEX idx_users_referred_by ON users(referred_by);

    -- Websites
    CREATE INDEX idx_websites_owner ON websites(owner_id);
    CREATE INDEX idx_websites_domain ON websites(domain);
    CREATE INDEX idx_websites_category ON websites(primary_category_id);
    CREATE INDEX idx_websites_status ON websites(verification_status, is_active);
    CREATE INDEX idx_websites_metrics ON websites(domain_authority DESC, domain_rating DESC);
    CREATE INDEX idx_websites_price ON websites(price_guest_post);
    CREATE INDEX idx_websites_featured ON websites(is_featured, featured_until);
    CREATE INDEX idx_websites_slug ON websites(slug);

    -- Orders
    CREATE INDEX idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX idx_orders_publisher ON orders(publisher_id);
    CREATE INDEX idx_orders_website ON orders(website_id);
    CREATE INDEX idx_orders_status ON orders(status);
    CREATE INDEX idx_orders_number ON orders(order_number);
    CREATE INDEX idx_orders_affiliate ON orders(affiliate_id);

    -- Transactions
    CREATE INDEX idx_transactions_user ON transactions(user_id);
    CREATE INDEX idx_transactions_type ON transactions(type);
    CREATE INDEX idx_transactions_reference ON transactions(reference_type, reference_id);

    -- Affiliate
    CREATE INDEX idx_affiliate_referrals ON affiliate_referrals(affiliate_id);
    CREATE INDEX idx_affiliate_commissions ON affiliate_commissions(affiliate_id, status);

    -- Full-text search
    CREATE INDEX idx_websites_fts ON websites USING gin(
      to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || domain)
    );

# 4. Dashboard Designs

## 4.1 Buyer Dashboard

### 4.1.1 Buyer Dashboard Layout

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ HEADER                                                                  │
    │ [PressScape Logo]  [Marketplace]  [My Orders]  [Campaigns]   [Profile ▼]│
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  BUYER DASHBOARD                                           [+ New Order]│
    │                                                                         │
    │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
    │  │ 💰 Balance    │ │ 📦 Total      │ │ ✅ Completed  │ │ ⏳ Pending  ││
    │  │ $1,250.00    │ │ Orders        │ │ Orders        │ │ Orders      ││
    │  │ [Add Funds]   │ │ 45            │ │ 38            │ │ 7           ││
    │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘│
    │                                                                         │
    │  ACTIVE ORDERS                                            [View All →] │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ #PS-12456 │ techcrunch.com │ Guest Post │ Writing │ Due: Jan 15 │  │
    │  │ #PS-12455 │ forbes.com     │ Link Insert│ Published│ Done ✓     │  │
    │  │ #PS-12454 │ medium.com     │ Guest Post │ Review  │ Due: Jan 12 │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  CAMPAIGNS                                               [View All →]  │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ Product Launch      │ 15/25 orders │ $3,500 spent │ Active      │  │
    │  │ Q1 SEO Campaign     │ 8/10 orders  │ $1,200 spent │ Completed   │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  QUICK ACTIONS                                                          │
    │  [🔍 Browse Sites] [📦 Bulk Order] [💳 Add Funds] [📊 Analytics]       │
    │                                                                         │
    │  SAVED WEBSITES (12)                                     [View All →]  │
    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                          │
    │  │site.com│ │blog.io │ │news.co │ │tech.net│                          │
    │  │DA: 75  │ │DA: 60  │ │DA: 85  │ │DA: 55  │                          │
    │  │$150    │ │$80     │ │$350    │ │$65     │                          │
    │  └────────┘ └────────┘ └────────┘ └────────┘                          │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

### 4.1.2 Buyer - Order History

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ MY ORDERS                                                               │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Filters: [All Status ▼] [All Types ▼] [Date Range ▼] [🔍 Search]     │
    │                                                                         │
    │  ┌─────────────────────────────────────────────────────────────────────┐
    │  │ ORDER      │ WEBSITE        │ TYPE       │ STATUS    │ AMOUNT  │ DATE│
    │  ├─────────────────────────────────────────────────────────────────────┤
    │  │ #PS-12456  │ techcrunch.com │ Guest Post │ 🟡 Writing│ $250.00│ Jan 10│
    │  │            │ DA: 92 DR: 89  │ 1000 words │           │         │      │
    │  │ [View] [Message] [Cancel]                                           │
    │  ├─────────────────────────────────────────────────────────────────────┤
    │  │ #PS-12455  │ forbes.com     │ Link Insert│ 🟢 Done   │ $400.00│ Jan 8 │
    │  │            │ DA: 95 DR: 93  │            │ ⭐ Rated  │         │      │
    │  │ [View] [Reorder]                                                    │
    │  ├─────────────────────────────────────────────────────────────────────┤
    │  │ #PS-12454  │ medium.com     │ Guest Post │ 🔵 Review │ $120.00│ Jan 5 │
    │  │            │ DA: 96 DR: 91  │ 800 words  │           │         │      │
    │  │ [View] [Message]                                                    │
    │  └─────────────────────────────────────────────────────────────────────┘
    │                                                                         │
    │  [← Previous]  Page 1 of 5  [Next →]                                   │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

### 4.1.3 Buyer - Marketplace Browse

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ MARKETPLACE                                           [📥 Export CSV]  │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  ┌─────────────────────────────────────────────────────────────────────┐
    │  │ FILTERS                                                             │
    │  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
    │  │ │ Category ▼   │ │ DA Range ▼   │ │ DR Range ▼   │ │ Traffic ▼   ││
    │  │ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘│
    │  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐│
    │  │ │ Price: $___  │ │ Language ▼   │ │ Link Type ▼  │ │ Country ▼   ││
    │  │ │ to $___      │ │              │ │              │ │             ││
    │  │ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘│
    │  │ ☐ Verified Only  ☐ Has Writing Service  ☐ Accepts Casino          │
    │  │ [Apply Filters] [Clear All]                                        │
    │  └─────────────────────────────────────────────────────────────────────┘
    │                                                                         │
    │  Showing 1,256 websites │ Sort by: [DA (High to Low) ▼]               │
    │                                                                         │
    │  ┌─────────────────────────────────────────────────────────────────────┐
    │  │ ┌────┐  techcrunch.com           ⭐ 4.8 (45)  ✓ Verified          │
    │  │ │LOGO│  Technology Blog                                            │
    │  │ └────┘  ────────────────────────────────────────────               │
    │  │         DA: 92 │ DR: 89 │ Traffic: 2.5M │ 🔗 Dofollow             │
    │  │         ────────────────────────────────────────────               │
    │  │         Guest Post: $250  │  Link Insert: $180  │  Urgent: +$50   │
    │  │         TAT: 5 days │ English │ USA 65%                            │
    │  │         ────────────────────────────────────────────               │
    │  │         [❤️ Save]  [View Details]  [Order Now]                     │
    │  └─────────────────────────────────────────────────────────────────────┘
    │                                                                         │
    │  ┌─────────────────────────────────────────────────────────────────────┐
    │  │ ┌────┐  entrepreneur.com         ⭐ 4.6 (32)  ✓ Verified          │
    │  │ │LOGO│  Business & Startups                                        │
    │  │ └────┘  ────────────────────────────────────────────               │
    │  │         DA: 89 │ DR: 86 │ Traffic: 1.8M │ 🔗 Dofollow             │
    │  │         ────────────────────────────────────────────               │
    │  │         Guest Post: $350  │  Link Insert: $250                     │
    │  │         TAT: 7 days │ English │ USA 55%, UK 15%                    │
    │  │         ────────────────────────────────────────────               │
    │  │         [❤️ Save]  [View Details]  [Order Now]                     │
    │  └─────────────────────────────────────────────────────────────────────┘
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 4.2 Publisher Dashboard

### 4.2.1 Publisher Owner Dashboard

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ HEADER                                                                  │
    │ [PressScape Logo]  [My Sites]  [Orders]  [Team]  [Earnings]  [Profile ▼]│
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  PUBLISHER DASHBOARD                                      [+ Add Site] │
    │                                                                         │
    │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
    │  │ 💰 Earnings   │ │ 📦 Pending    │ │ ✅ This Month │ │ ⭐ Rating   ││
    │  │ $4,850.00    │ │ Orders        │ │ Completed     │ │             ││
    │  │ [Withdraw]    │ │ 12            │ │ 28            │ │ 4.7 (156)   ││
    │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘│
    │                                                                         │
    │  MY WEBSITES                                              [View All →] │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ SITE              │ STATUS    │ ORDERS │ EARNINGS │ RATING      │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ techblog.com      │ ✓ Active  │ 45     │ $2,250   │ ⭐ 4.8 (32)│  │
    │  │ DA: 55 │ $80 GP   │ 3 pending │        │          │             │  │
    │  │ [Edit] [Pause] [Stats]                                          │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ marketingnews.io  │ ✓ Active  │ 28     │ $1,800   │ ⭐ 4.6 (24)│  │
    │  │ DA: 62 │ $120 GP  │ 5 pending │        │          │             │  │
    │  │ [Edit] [Pause] [Stats]                                          │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ startupweekly.com │ 🔄 Review │ --     │ --       │ --          │  │
    │  │ DA: 48 │ Pending  │ Awaiting verification                       │  │
    │  │ [Edit] [Check Status]                                           │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  PENDING ORDERS (12)                                     [View All →]  │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ #PS-12460 │ techblog.com │ Guest Post │ $80 │ New │ [Accept/Reject]│
    │  │ #PS-12459 │ techblog.com │ Link Insert│ $50 │ New │ [Accept/Reject]│
    │  │ #PS-12458 │ marketing... │ Guest Post │ $120│ Writing│ [View]      │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  TEAM MEMBERS                                            [Manage →]    │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ 👤 Sarah (Editor) │ techblog.com, marketingnews.io │ Active     │  │
    │  │ 👤 Mike (Writer)  │ techblog.com │ $0.05/word │ Active          │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  EARNINGS CHART (Last 30 Days)                                         │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │     $800 ─┤                           ╭──╮                      │  │
    │  │     $600 ─┤               ╭──╮  ╭──╮ │  │                      │  │
    │  │     $400 ─┤        ╭──╮  │  │  │  │ │  │  ╭──╮               │  │
    │  │     $200 ─┤  ╭──╮ │  │  │  │  │  │ │  │  │  │               │  │
    │  │       $0 ─┼──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──            │  │
    │  │           W1      W2      W3      W4                           │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

### 4.2.2 Publisher - Add/Edit Website

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ ADD NEW WEBSITE                                                         │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Step 1 of 4: Basic Information                                        │
    │  ═══════════════════════════════                                       │
    │                                                                         │
    │  Website URL *                                                          │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ https://                                                        │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Website Name *                                                         │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │                                                                 │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Description                                                            │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │                                                                 │  │
    │  │                                                                 │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Primary Category *                                                     │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ Select category...                                          ▼  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Primary Language *                                                     │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ English                                                     ▼  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Sample Guest Post URL                                                  │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ https://                                                        │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │                                                   [Next: Pricing →]    │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ ADD NEW WEBSITE                                                         │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Step 2 of 4: Pricing                                                  │
    │  ════════════════════                                                  │
    │                                                                         │
    │  GUEST POST (with 1 link) *                                            │
    │  ┌────────────────┐                                                    │
    │  │ $          80  │  You'll receive: $60.00 (after 25% fee)           │
    │  └────────────────┘                                                    │
    │                                                                         │
    │  LINK INSERTION (to existing article)                                   │
    │  ┌────────────────┐                                                    │
    │  │ $          50  │  You'll receive: $37.50                           │
    │  └────────────────┘                                                    │
    │                                                                         │
    │  HOMEPAGE LINK (if offered)                                            │
    │  ┌────────────────┐                                                    │
    │  │ $             │  ☐ I don't offer this                             │
    │  └────────────────┘                                                    │
    │                                                                         │
    │  ADDITIONAL OPTIONS                                                     │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ ☑ I offer content writing service                               │  │
    │  │   Writing fee: $ 25  (added to order)                           │  │
    │  │                                                                 │  │
    │  │ ☑ I offer urgent delivery (24-48 hours)                         │  │
    │  │   Urgent fee: $ 30  (added to order)                            │  │
    │  │                                                                 │  │
    │  │ Extra link fee: $ 15  (per additional link)                     │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  [← Back]                                     [Next: Requirements →]   │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ ADD NEW WEBSITE                                                         │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Step 3 of 4: Content Requirements                                     │
    │  ══════════════════════════════════                                    │
    │                                                                         │
    │  WORD COUNT                                                             │
    │  Minimum: ┌────────┐  Maximum: ┌────────┐                             │
    │           │   500  │           │  2000  │                              │
    │           └────────┘           └────────┘                              │
    │                                                                         │
    │  LINKS                                                                  │
    │  Maximum links allowed: ┌────────┐                                     │
    │                         │    2   │                                     │
    │                         └────────┘                                     │
    │                                                                         │
    │  LINK TYPE                                                              │
    │  ○ Dofollow only  ● Dofollow  ○ Nofollow  ○ Mixed                     │
    │                                                                         │
    │  ☐ Add sponsored/rel="sponsored" tag                                   │
    │  ☑ Guarantee Google indexing                                           │
    │                                                                         │
    │  TURNAROUND TIME                                                        │
    │  Standard delivery: ┌────────┐ days                                    │
    │                     │    7   │                                         │
    │                     └────────┘                                         │
    │                                                                         │
    │  CONTENT ACCEPTANCE                                                     │
    │  ☑ Accept buyer-provided content                                       │
    │  ☑ Accept content written by platform                                  │
    │                                                                         │
    │  NICHE RESTRICTIONS                                                     │
    │  ☐ Accept Casino/Gambling    ☐ Accept CBD/Cannabis                    │
    │  ☐ Accept Adult content      ☑ Accept Crypto                          │
    │                                                                         │
    │  [← Back]                                   [Next: Verification →]     │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

### 4.2.3 Publisher Editor Dashboard

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ EDITOR DASHBOARD                                                        │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Welcome, Sarah (Editor)                                               │
    │  Sites: techblog.com, marketingnews.io                                 │
    │                                                                         │
    │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                │
    │  │ 📝 To Review  │ │ ✅ Approved   │ │ 🔄 Revisions  │                │
    │  │ 5             │ │ This Week     │ │ Requested     │                │
    │  │               │ │ 12            │ │ 2             │                │
    │  └───────────────┘ └───────────────┘ └───────────────┘                │
    │                                                                         │
    │  CONTENT PENDING REVIEW                                                 │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ ORDER     │ SITE            │ WRITER   │ SUBMITTED │ ACTION     │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ #PS-12460 │ techblog.com    │ Mike     │ 2h ago    │            │  │
    │  │ "10 Best SEO Tools for 2024"                                    │  │
    │  │ 1,200 words │ 2 links                                           │  │
    │  │ [Preview] [Approve] [Request Revision] [Reject]                 │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ #PS-12458 │ marketingnews.io│ External │ 5h ago    │            │  │
    │  │ "Future of Content Marketing"                                   │  │
    │  │ 800 words │ 1 link │ Buyer-provided content                     │  │
    │  │ [Preview] [Approve] [Request Revision] [Reject]                 │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  REVISION REQUESTS                                                      │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ #PS-12455 │ techblog.com │ Mike │ Awaiting revision             │  │
    │  │ Feedback: "Please add more statistics and cite sources"         │  │
    │  │ [View Original] [Check Status]                                  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

### 4.2.4 Publisher Contributor Dashboard

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ CONTRIBUTOR DASHBOARD                                                   │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Welcome, Mike (Contributor)                                           │
    │  Writing for: techblog.com ($0.05/word)                                │
    │                                                                         │
    │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
    │  │ 💰 Balance    │ │ ✍️ Active     │ │ ✅ Completed  │ │ 📊 Words    ││
    │  │ $245.00      │ │ Tasks         │ │ This Month    │ │ This Month  ││
    │  │ [Withdraw]    │ │ 3             │ │ 8             │ │ 12,400      ││
    │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘│
    │                                                                         │
    │  AVAILABLE TASKS                                         [View All →]  │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ SITE            │ TOPIC              │ WORDS │ PAY    │ DUE     │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ techblog.com    │ AI Writing Tools   │ 1,000 │ $50.00 │ Jan 15  │  │
    │  │ Keywords: AI, writing, tools, automation                        │  │
    │  │ [View Brief] [Accept Task]                                      │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ techblog.com    │ Cloud Storage 2024 │ 1,500 │ $75.00 │ Jan 18  │  │
    │  │ Keywords: cloud, storage, comparison                            │  │
    │  │ [View Brief] [Accept Task]                                      │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  MY ACTIVE TASKS                                                        │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ #PS-12460 │ techblog.com │ SEO Tools │ Due: Jan 12 │ In Progress│  │
    │  │ 1,200 words │ $60.00                                            │  │
    │  │ [Write/Submit] [View Brief]                                     │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ #PS-12458 │ techblog.com │ Marketing │ Due: Jan 14 │ Revision  │  │
    │  │ Feedback: "Add more examples"                                   │  │
    │  │ [Revise & Resubmit] [View Feedback]                             │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  EARNINGS HISTORY                                                       │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ Jan 10 │ #PS-12450 │ techblog.com │ +$55.00 │ 1,100 words      │  │
    │  │ Jan 8  │ #PS-12445 │ techblog.com │ +$65.00 │ 1,300 words      │  │
    │  │ Jan 5  │ Withdrawal│ PayPal       │ -$200.00│ Completed        │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 4.3 Affiliate Dashboard

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ AFFILIATE DASHBOARD                                                     │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
    │  │ 💰 Balance    │ │ 👥 Referrals  │ │ 💵 Total      │ │ 📊 Conv.    ││
    │  │ $387.50      │ │ Total         │ │ Earned        │ │ Rate        ││
    │  │ [Withdraw]    │ │ 52            │ │ $1,250.00     │ │ 12.5%       ││
    │  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘│
    │                                                                         │
    │  YOUR AFFILIATE LINK                                                    │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ https://pressscape.com/?ref=MIKE2024                    [Copy]  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  COMMISSION RATE: 7.5% of all orders from your referrals               │
    │  Cookie Duration: 90 days                                              │
    │                                                                         │
    │  REFERRAL STATS                                          [This Month ▼]│
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ DATE    │ USER            │ STATUS    │ ORDERS │ COMMISSION     │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ Jan 10  │ john@email.com  │ Active    │ 5      │ $56.25         │  │
    │  │ Jan 8   │ sarah@email.com │ Converted │ 3      │ $33.75         │  │
    │  │ Jan 5   │ mike@email.com  │ Signed up │ 0      │ $0.00          │  │
    │  │ Jan 3   │ lisa@email.com  │ Active    │ 8      │ $112.50        │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  PENDING COMMISSIONS                                                    │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ ORDER     │ REFERRAL        │ ORDER AMT │ COMMISSION │ STATUS   │  │
    │  ├─────────────────────────────────────────────────────────────────┤  │
    │  │ #PS-12456 │ john@email.com  │ $250.00   │ $18.75     │ Pending  │  │
    │  │ #PS-12455 │ john@email.com  │ $150.00   │ $11.25     │ Pending  │  │
    │  │ Released after order completion (usually 7 days)                │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  MARKETING MATERIALS                                                    │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ 📄 Banner Ads (Multiple Sizes)                    [Download]    │  │
    │  │ 📄 Email Templates                                [Download]    │  │
    │  │ 📄 Social Media Graphics                          [Download]    │  │
    │  │ 📄 Text Links & Copy                              [View]        │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  PERFORMANCE CHART                                                      │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │  $150 ─┤                                    ╭──╮               │  │
    │  │  $100 ─┤              ╭──╮     ╭──╮        │  │               │  │
    │  │   $50 ─┤    ╭──╮     │  │     │  │  ╭──╮ │  │               │  │
    │  │    $0 ─┼────┴──┴─────┴──┴─────┴──┴──┴──┴──┴──┴────           │  │
    │  │        Week 1   Week 2   Week 3   Week 4                       │  │
    │  │        ── Clicks  ── Sign-ups  ── Commissions                  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

# 5. Order Workflow

## 5.1 Order Flow Diagram

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         ORDER LIFECYCLE                                 │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  BUYER                         SYSTEM                      PUBLISHER   │
    │    │                             │                             │       │
    │    │  1. Browse & Select Site    │                             │       │
    │    │─────────────────────────────>                             │       │
    │    │                             │                             │       │
    │    │  2. Configure Order         │                             │       │
    │    │  (type, content, links)     │                             │       │
    │    │─────────────────────────────>                             │       │
    │    │                             │                             │       │
    │    │  3. Pay for Order           │                             │       │
    │    │─────────────────────────────>                             │       │
    │    │                             │ 4. Create Order             │       │
    │    │                             │ (status: pending)           │       │
    │    │                             │─────────────────────────────>       │
    │    │                             │                             │       │
    │    │                             │ 5. Notify Publisher         │       │
    │    │                             │─────────────────────────────>       │
    │    │                             │                             │       │
    │    │                             │          6. Accept/Reject   │       │
    │    │                             │<─────────────────────────────       │
    │    │                             │                             │       │
    │    │      IF REJECTED:           │                             │       │
    │    │<───── 7. Refund ────────────│                             │       │
    │    │                             │                             │       │
    │    │      IF ACCEPTED:           │                             │       │
    │    │                             │ 8. Status: accepted         │       │
    │    │                             │                             │       │
    │    │      IF BUYER CONTENT:      │                             │       │
    │    │      9. Submit Article ─────>                             │       │
    │    │                             │─────────────────────────────>       │
    │    │                             │                             │       │
    │    │      IF PUBLISHER WRITES:   │                             │       │
    │    │                             │<───── 10. Submit Content ───│       │
    │    │                             │                             │       │
    │    │      IF CONTRIBUTOR WRITES: │                             │       │
    │    │                             │    (internal workflow)      │       │
    │    │                             │                             │       │
    │    │                             │          11. Review/Approve │       │
    │    │                             │<─────────────────────────────       │
    │    │                             │                             │       │
    │    │                             │          12. Publish        │       │
    │    │                             │<─────────────────────────────       │
    │    │                             │                             │       │
    │    │  13. Verify Published Link  │                             │       │
    │    │<─────────────────────────────                             │       │
    │    │                             │                             │       │
    │    │  14. Approve/Request Change │                             │       │
    │    │─────────────────────────────>                             │       │
    │    │                             │                             │       │
    │    │      IF APPROVED:           │                             │       │
    │    │                             │ 15. Status: completed       │       │
    │    │                             │ 16. Release Payment ────────>       │
    │    │                             │                             │       │
    │    │  17. Leave Review (optional)│                             │       │
    │    │─────────────────────────────>                             │       │
    │    │                             │                             │       │
    │    ▼                             ▼                             ▼       │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 5.2 Order Status Definitions

  -----------------------------------------------------------------------------
  Status                Description                Next Actions
  --------------------- -------------------------- ----------------------------
  `pending`             Order placed, awaiting     Publisher: Accept/Reject
                        publisher                  

  `accepted`            Publisher accepted         Submit content

  `writing`             Content being written      Submit when ready

  `content_submitted`   Content submitted for      Publisher: Review
                        review                     

  `revision_needed`     Changes requested          Revise and resubmit

  `approved`            Content approved           Publisher: Publish

  `published`           Live on website            Buyer: Verify

  `completed`           Order finalized            Payment released

  `cancelled`           Order cancelled            Refund processed

  `refunded`            Refund issued              Terminal state

  `disputed`            Under dispute              Admin review
  -----------------------------------------------------------------------------

## 5.3 Payment Flow

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         PAYMENT FLOW                                    │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  ORDER TOTAL: $100                                                      │
    │                                                                         │
    │  ┌─────────────────────────────────────────────────────────────────┐   │
    │  │ BUYER PAYS                                                      │   │
    │  │ ═══════════                                                     │   │
    │  │ Order Amount:        $100.00                                    │   │
    │  │ Stripe Fee (2.9%+30¢): $3.20  ← Absorbed by platform           │   │
    │  │ ─────────────────────────────                                   │   │
    │  │ Buyer Total:         $100.00                                    │   │
    │  └─────────────────────────────────────────────────────────────────┘   │
    │                              │                                          │
    │                              ▼                                          │
    │  ┌─────────────────────────────────────────────────────────────────┐   │
    │  │ HELD IN ESCROW (Until order completed)                          │   │
    │  └─────────────────────────────────────────────────────────────────┘   │
    │                              │                                          │
    │                              ▼ (Order Completed)                       │
    │  ┌─────────────────────────────────────────────────────────────────┐   │
    │  │ DISTRIBUTION                                                    │   │
    │  │ ════════════                                                    │   │
    │  │                                                                 │   │
    │  │ ┌─────────────────────────────────┐                            │   │
    │  │ │ IF NO AFFILIATE:                │                            │   │
    │  │ │ Publisher:  $75.00 (75%)        │                            │   │
    │  │ │ Platform:   $25.00 (25%)        │                            │   │
    │  │ └─────────────────────────────────┘                            │   │
    │  │                                                                 │   │
    │  │ ┌─────────────────────────────────┐                            │   │
    │  │ │ IF AFFILIATE REFERRED:          │                            │   │
    │  │ │ Publisher:  $75.00 (75%)        │                            │   │
    │  │ │ Affiliate:  $7.50  (7.5%)       │ ← From platform share      │   │
    │  │ │ Platform:   $17.50 (17.5%)      │                            │   │
    │  │ └─────────────────────────────────┘                            │   │
    │  │                                                                 │   │
    │  │ ┌─────────────────────────────────┐                            │   │
    │  │ │ IF CONTRIBUTOR WROTE:           │                            │   │
    │  │ │ Contributor: $20.00             │ ← Deducted from publisher  │   │
    │  │ │ Publisher:   $55.00             │                            │   │
    │  │ │ Affiliate:   $7.50 (if any)     │                            │   │
    │  │ │ Platform:    $17.50             │                            │   │
    │  │ └─────────────────────────────────┘                            │   │
    │  │                                                                 │   │
    │  └─────────────────────────────────────────────────────────────────┘   │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 5.4 Refund Policy

  -----------------------------------------------------------------------
  Scenario                Refund                  Notes
  ----------------------- ----------------------- -----------------------
  Publisher rejects order 100%                    Immediate refund

  Publisher doesn't       100%                    Auto-refund
  respond (48h)                                   

  Publisher misses        100%                    Buyer can cancel
  deadline (+7 days)                              

  Buyer cancels before    100%                    Immediate
  acceptance                                      

  Buyer cancels after     50%                     Publisher compensation
  acceptance                                      

  Content doesn't meet    100%                    After dispute review
  requirements                                    

  Link removed within 6   100%                    Guaranteed period
  months                                          

  Dispute (admin decides) 0-100%                  Case by case
  -----------------------------------------------------------------------

# 6. Core Features

## 6.1 Marketplace Features

### 6.1.1 Website Search & Filtering

  -----------------------------------------------------------------------
  Filter                              Options
  ----------------------------------- -----------------------------------
  **Category**                        20+ categories (Tech, Business,
                                      Health, etc.)

  **Domain Authority**                0-10, 10-20, 20-30, 30-40, 40-50,
                                      50+

  **Domain Rating**                   Same ranges as DA

  **Price Range**                     Custom min/max

  **Traffic**                         \<10K, 10K-50K, 50K-100K,
                                      100K-500K, 500K+

  **Language**                        English, Spanish, German, French,
                                      etc.

  **Country**                         Traffic source country

  **Link Type**                       Dofollow, Nofollow, Mixed

  **Turnaround**                      1-3 days, 3-7 days, 7-14 days

  **Content**                         Writing service available, Buyer
                                      content only

  **Special**                         Casino accepted, CBD accepted,
                                      Crypto accepted
  -----------------------------------------------------------------------

### 6.1.2 Website Details Page

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ techblog.com                                    ✓ Verified │ ⭐ 4.8 (45)│
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ METRICS                                       Last updated: Today  ││
    │  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           ││
    │  │ │ DA     │ │ DR     │ │ Traffic│ │ RD     │ │ Spam   │           ││
    │  │ │ 55     │ │ 52     │ │ 125K   │ │ 2,450  │ │ 3%     │           ││
    │  │ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ TRAFFIC BY COUNTRY                                                 ││
    │  │ 🇺🇸 USA: 45%  │  🇬🇧 UK: 20%  │  🇨🇦 Canada: 12%  │  Other: 23%   ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  ABOUT                                                                  │
    │  TechBlog is a leading technology publication covering software,        │
    │  startups, AI, and digital transformation since 2015.                  │
    │                                                                         │
    │  CATEGORIES: Technology, Software, AI, Startups                        │
    │  LANGUAGE: English                                                      │
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ PRICING                                                            ││
    │  │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   ││
    │  │ │ GUEST POST       │ │ LINK INSERTION   │ │ HOMEPAGE LINK    │   ││
    │  │ │ $80              │ │ $50              │ │ $200             │   ││
    │  │ │ 1 dofollow link  │ │ Existing article │ │ Sidebar/Footer   │   ││
    │  │ │ [Order Now]      │ │ [Order Now]      │ │ [Order Now]      │   ││
    │  │ └──────────────────┘ └──────────────────┘ └──────────────────┘   ││
    │  │                                                                    ││
    │  │ Additional Options:                                                ││
    │  │ • Writing Service: +$25  • Extra Link: +$15  • Urgent: +$30       ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ REQUIREMENTS                                                       ││
    │  │ Word Count: 500 - 2,000 words                                     ││
    │  │ Max Links: 2                                                       ││
    │  │ Turnaround: 7 days (Urgent: 2 days)                               ││
    │  │ Link Type: Dofollow                                               ││
    │  │ Indexed: ✓ Guaranteed                                             ││
    │  │                                                                    ││
    │  │ Accepts: ✓ Buyer content  ✓ Platform writing                      ││
    │  │ Special: ✓ Crypto  ✗ Casino  ✗ CBD  ✗ Adult                       ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ SAMPLE POST                                                        ││
    │  │ https://techblog.com/guest-post-example                           ││
    │  │ [View Sample →]                                                    ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  REVIEWS (45)                                             [See All →]  │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ ⭐⭐⭐⭐⭐ "Excellent quality and fast turnaround"                  ││
    │  │ by John D. │ Guest Post │ Jan 5, 2024                              ││
    │  │ "Great communication, article was published within 3 days..."      ││
    │  │ ─────────────────────────────────────────────────────────────────  ││
    │  │ ⭐⭐⭐⭐ "Good value for the price"                                 ││
    │  │ by Sarah M. │ Link Insertion │ Jan 2, 2024                         ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  [❤️ Save to Favorites]  [📧 Contact Publisher]  [⚠️ Report Issue]     │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 6.2 Order Placement Flow

### 6.2.1 Order Form

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ PLACE ORDER - techblog.com                                              │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Step 1: Order Type                                                     │
    │  ══════════════════                                                    │
    │                                                                         │
    │  ○ Guest Post ($80)      ● Link Insertion ($50)      ○ Homepage ($200) │
    │                                                                         │
    │  Step 2: Content                                                        │
    │  ═══════════════                                                       │
    │                                                                         │
    │  How would you like to provide content?                                │
    │  ○ I'll provide the article                                            │
    │  ● Publisher writes the content (+$25)                                 │
    │                                                                         │
    │  [If Link Insertion selected:]                                         │
    │  Which article should include your link?                               │
    │  ○ Publisher chooses relevant article                                  │
    │  ○ I'll specify the article URL:                                       │
    │    ┌─────────────────────────────────────────────────────────────────┐│
    │    │ https://                                                        ││
    │    └─────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  Step 3: Link Details                                                   │
    │  ═══════════════════                                                   │
    │                                                                         │
    │  Target URL *                                                           │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ https://mywebsite.com/my-page                                   │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Anchor Text *                                                          │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ best SEO tools                                                  │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  [+ Add Another Link (+$15)]                                           │
    │                                                                         │
    │  Step 4: Additional Options                                             │
    │  ══════════════════════════                                            │
    │                                                                         │
    │  ☐ Urgent delivery (2 days instead of 7) (+$30)                        │
    │                                                                         │
    │  Notes for Publisher                                                    │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │                                                                 │  │
    │  │                                                                 │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  ┌────────────────────────────────────────────────────────────────────┐│
    │  │ ORDER SUMMARY                                                      ││
    │  │ ─────────────────────────────────────────────────────────────────  ││
    │  │ Link Insertion                              $50.00                 ││
    │  │ Writing Service                             $25.00                 ││
    │  │ ─────────────────────────────────────────────────────────────────  ││
    │  │ Subtotal                                    $75.00                 ││
    │  │                                                                    ││
    │  │ Pay from balance: $1,250.00 available                             ││
    │  │ ─────────────────────────────────────────────────────────────────  ││
    │  │ Total                                       $75.00                 ││
    │  └────────────────────────────────────────────────────────────────────┘│
    │                                                                         │
    │  ☑ I agree to the Terms of Service                                     │
    │                                                                         │
    │                                          [Place Order - $75.00]        │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

## 6.3 Website Verification

### 6.3.1 Verification Methods

  -----------------------------------------------------------------------
  Method                              Process
  ----------------------------------- -----------------------------------
  **DNS TXT Record**                  Add TXT record with verification
                                      code

  **Meta Tag**                        Add meta tag to homepage

  **HTML File**                       Upload verification file to root

  **Google Search Console**           Connect GSC (also gets traffic
                                      data)
  -----------------------------------------------------------------------

### 6.3.2 Verification Flow

    // lib/verification/verify-website.ts
    export async function verifyWebsite(websiteId: string, method: VerificationMethod) {
      const website = await getWebsite(websiteId);
      const verificationCode = generateVerificationCode(websiteId);
      
      switch (method) {
        case 'dns':
          // Check for TXT record: pressscape-verify=CODE
          const dnsRecords = await dns.resolveTxt(website.domain);
          const found = dnsRecords.some(r => r.includes(`pressscape-verify=${verificationCode}`));
          return found;
          
        case 'meta':
          // Check for <meta name="pressscape-verify" content="CODE">
          const html = await fetch(`https://${website.domain}`).then(r => r.text());
          return html.includes(`name="pressscape-verify" content="${verificationCode}"`);
          
        case 'file':
          // Check for /pressscape-verify.txt containing CODE
          const file = await fetch(`https://${website.domain}/pressscape-verify.txt`).then(r => r.text());
          return file.trim() === verificationCode;
          
        case 'gsc':
          // OAuth flow with Google Search Console
          return await verifyViaGSC(website.domain);
      }
    }

## 6.4 Metrics Integration

### 6.4.1 Metrics Sources

  -----------------------------------------------------------------------
  Metric                  Source                  Update Frequency
  ----------------------- ----------------------- -----------------------
  Domain Authority (DA)   Moz API                 Weekly

  Domain Rating (DR)      Ahrefs API              Weekly

  Organic Traffic         Ahrefs/SimilarWeb       Weekly

  Referring Domains       Ahrefs                  Weekly

  Spam Score              Moz                     Weekly

  Trust Flow              Majestic                Weekly

  Alexa Rank              Deprecated (alternative \-
                          needed)                 
  -----------------------------------------------------------------------

### 6.4.2 Metrics Update Worker

    // workers/update-metrics.ts
    import { MozClient } from './moz';
    import { AhrefsClient } from './ahrefs';

    export async function updateWebsiteMetrics() {
      const websites = await db.query(`
        SELECT id, domain FROM websites 
        WHERE is_active = true 
        AND (metrics_updated_at IS NULL OR metrics_updated_at < NOW() - INTERVAL '7 days')
        LIMIT 100
      `);
      
      for (const website of websites) {
        try {
          // Get Moz metrics
          const mozData = await MozClient.getMetrics(website.domain);
          
          // Get Ahrefs metrics
          const ahrefsData = await AhrefsClient.getMetrics(website.domain);
          
          await db.query(`
            UPDATE websites SET
              domain_authority = $1,
              spam_score = $2,
              domain_rating = $3,
              organic_traffic = $4,
              referring_domains = $5,
              metrics_updated_at = NOW(),
              metrics_source = 'api'
            WHERE id = $6
          `, [
            mozData.domainAuthority,
            mozData.spamScore,
            ahrefsData.domainRating,
            ahrefsData.organicTraffic,
            ahrefsData.referringDomains,
            website.id
          ]);
          
        } catch (error) {
          console.error(`Failed to update metrics for ${website.domain}:`, error);
        }
        
        // Rate limiting
        await sleep(1000);
      }
    }

## 6.5 Affiliate System

### 6.5.1 Affiliate Program Details

  -----------------------------------------------------------------------
  Aspect                              Details
  ----------------------------------- -----------------------------------
  **Commission Rate**                 7.5% of total order value

  **Cookie Duration**                 90 days

  **Minimum Payout**                  \$50

  **Payout Schedule**                 Weekly (Fridays)

  **Payment Methods**                 PayPal, Bank Transfer, Wise

  **Commission Hold**                 7 days after order completion
  -----------------------------------------------------------------------

### 6.5.2 Affiliate Tracking

    // middleware.ts - Track affiliate referrals
    export async function middleware(request: NextRequest) {
      const url = request.nextUrl;
      const ref = url.searchParams.get('ref');
      
      if (ref) {
        // Set affiliate cookie (90 days)
        const response = NextResponse.next();
        response.cookies.set('affiliate_ref', ref, {
          maxAge: 90 * 24 * 60 * 60, // 90 days
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        });
        
        // Track click
        await trackAffiliateClick(ref, {
          landingPage: url.pathname,
          userAgent: request.headers.get('user-agent'),
          ip: request.ip,
        });
        
        return response;
      }
      
      return NextResponse.next();
    }

    // When user signs up
    async function handleSignup(userData: SignupData, cookies: Cookies) {
      const affiliateRef = cookies.get('affiliate_ref');
      
      const user = await createUser(userData);
      
      if (affiliateRef) {
        const affiliate = await getUserByAffiliateCode(affiliateRef);
        if (affiliate) {
          await db.query(`
            INSERT INTO affiliate_referrals (affiliate_id, referred_user_id, referral_code)
            VALUES ($1, $2, $3)
          `, [affiliate.id, user.id, affiliateRef]);
          
          // Update user's referred_by
          await db.query(`UPDATE users SET referred_by = $1 WHERE id = $2`, [affiliate.id, user.id]);
        }
      }
      
      return user;
    }

    // When order completes
    async function processAffiliateCommission(order: Order) {
      const buyer = await getUser(order.buyer_id);
      
      if (buyer.referred_by) {
        const referral = await db.query(`
          SELECT * FROM affiliate_referrals 
          WHERE affiliate_id = $1 AND referred_user_id = $2
        `, [buyer.referred_by, buyer.id]);
        
        if (referral) {
          const commissionAmount = Math.floor(order.total_amount * 0.075); // 7.5%
          
          await db.query(`
            INSERT INTO affiliate_commissions 
            (affiliate_id, referral_id, order_id, order_amount, commission_rate, commission_amount, status)
            VALUES ($1, $2, $3, $4, 7.5, $5, 'pending')
          `, [buyer.referred_by, referral.id, order.id, order.total_amount, commissionAmount]);
          
          // Update referral stats
          await db.query(`
            UPDATE affiliate_referrals 
            SET total_orders = total_orders + 1, total_commission = total_commission + $1
            WHERE id = $2
          `, [commissionAmount, referral.id]);
        }
      }
    }

## 6.6 Campaign Management (Bulk Orders)

### 6.6.1 Campaign Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  **Bulk Selection**                  Add multiple sites to cart

  **Budget Tracking**                 Set max budget, track spending

  **Keyword Targeting**               Specify target keywords for all
                                      orders

  **Progress Dashboard**              Track all orders in campaign

  **Export Reports**                  CSV/PDF campaign reports

  **Anchor Text Variation**           Auto-rotate anchor texts
  -----------------------------------------------------------------------

### 6.6.2 Campaign UI

    ┌─────────────────────────────────────────────────────────────────────────┐
    │ CREATE CAMPAIGN                                                         │
    ├─────────────────────────────────────────────────────────────────────────┤
    │                                                                         │
    │  Campaign Name *                                                        │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ Q1 SEO Link Building                                            │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Target URL *                                                           │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ https://mysite.com/services                                     │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Target Keywords (comma-separated)                                      │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ SEO services, SEO agency, SEO company                           │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  Budget                                                                 │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ $ 5,000                          ☐ No limit                     │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  SELECTED WEBSITES (12)                                Total: $1,580   │
    │  ┌─────────────────────────────────────────────────────────────────┐  │
    │  │ ☑ techblog.com      │ DA: 55 │ Guest Post │ $80   │ [Remove]   │  │
    │  │ ☑ marketingnews.io  │ DA: 62 │ Guest Post │ $120  │ [Remove]   │  │
    │  │ ☑ businessdaily.com │ DA: 58 │ Link Insert│ $70   │ [Remove]   │  │
    │  │ ... 9 more sites                                                │  │
    │  └─────────────────────────────────────────────────────────────────┘  │
    │                                                                         │
    │  [Add More Sites]                                                       │
    │                                                                         │
    │  [Save Draft]                              [Create Campaign - $1,580]  │
    │                                                                         │
    └─────────────────────────────────────────────────────────────────────────┘

# 7. Revenue Model

## 7.1 Commission Structure

  -----------------------------------------------------------------------
  Party                   Share                   Description
  ----------------------- ----------------------- -----------------------
  **Publisher**           75%                     Of order subtotal

  **Platform**            25%                     Of order subtotal

  **Affiliate**           7.5%                    Of total order (from
                                                  platform share)
  -----------------------------------------------------------------------

### 7.1.1 Example Calculations

**Order 1: \$100 Guest Post (No Affiliate)** \| \| Amount \|
\|-\|--------\| \| Buyer Pays \| \$100.00 \| \| Publisher Receives \|
\$75.00 \| \| Platform Receives \| \$25.00 \|

**Order 2: \$100 Guest Post (With Affiliate)** \| \| Amount \|
\|-\|--------\| \| Buyer Pays \| \$100.00 \| \| Publisher Receives \|
\$75.00 \| \| Affiliate Receives \| \$7.50 \| \| Platform Net \| \$17.50
\|

**Order 3: \$100 Guest Post + \$25 Writing (Contributor)** \| \| Amount
\| \|-\|--------\| \| Buyer Pays \| \$125.00 \| \| Publisher (75% of
\$125 - \$25 to writer) \| \$68.75 \| \| Contributor \| \$25.00 \| \|
Platform (25%) \| \$31.25 \|

## 7.2 Subscription Plans (Optional Revenue)

### 7.2.1 Buyer Subscriptions

  -----------------------------------------------------------------------
  Plan               Price                 Features
  ------------------ --------------------- ------------------------------
  **Free**           \$0                   Browse, basic filters, 5
                                           orders/month

  **Pro**            \$29/mo               Unlimited orders, advanced
                                           filters, API access

  **Agency**         \$99/mo               Team seats (5), white-label
                                           reports, bulk tools

  **Enterprise**     \$299/mo              Unlimited team, dedicated
                                           support, custom API
  -----------------------------------------------------------------------

### 7.2.2 Publisher Subscriptions

  -----------------------------------------------------------------------
  Plan               Price                 Features
  ------------------ --------------------- ------------------------------
  **Free**           \$0                   3 websites, standard listing,
                                           25% commission

  **Pro**            \$19/mo               10 websites, priority listing,
                                           22% commission

  **Business**       \$49/mo               Unlimited sites, featured
                                           spots, 20% commission
  -----------------------------------------------------------------------

## 7.3 Revenue Projections

### Year 1 Projections

  ---------------------------------------------------------------------------
  Month          GMV             Platform Rev   Affiliate      Net Revenue
                                 (25%)          Payout         
  -------------- --------------- -------------- -------------- --------------
  1-3            \$5,000         \$1,250        \$150          \$1,100

  4-6            \$25,000        \$6,250        \$750          \$5,500

  7-9            \$75,000        \$18,750       \$2,250        \$16,500

  10-12          \$150,000       \$37,500       \$4,500        \$33,000

  **Year 1**     **\$255,000**   **\$63,750**   **\$7,650**    **\$56,100**
  ---------------------------------------------------------------------------

### Year 2 Projections

  -----------------------------------------------------------------------
  Quarter           GMV               Platform Rev      Net Revenue
  ----------------- ----------------- ----------------- -----------------
  Q1                \$200,000         \$50,000          \$42,500

  Q2                \$350,000         \$87,500          \$74,375

  Q3                \$500,000         \$125,000         \$106,250

  Q4                \$700,000         \$175,000         \$148,750

  **Year 2**        **\$1,750,000**   **\$437,500**     **\$371,875**
  -----------------------------------------------------------------------

# 8. Development Roadmap

## 8.1 Phase Overview

  -----------------------------------------------------------------------
  Phase                   Duration                Focus
  ----------------------- ----------------------- -----------------------
  **MVP**                 Week 1-14               Core marketplace

  **Growth**              Month 5-8               Features & scale

  **Scale**               Month 9-12              Optimization

  **Expand**              Month 13-18             Advanced features
  -----------------------------------------------------------------------

## 8.2 Phase 1: MVP (14 Weeks)

### Week 1-2: Foundation

-   [ ] Next.js 14 project setup
-   [ ] Neon PostgreSQL + schema
-   [ ] Lucia Auth (email/password)
-   [ ] Basic UI components
-   [ ] Role system foundation

### Week 3-4: User System

-   [ ] User registration with role selection
-   [ ] Role switching mechanism
-   [ ] User profiles
-   [ ] Dashboard layouts (all roles)

### Week 5-6: Publisher Features

-   [ ] Add website form
-   [ ] Website verification (DNS/meta)
-   [ ] Pricing configuration
-   [ ] Publisher dashboard
-   [ ] Website management

### Week 7-8: Marketplace

-   [ ] Website listing page
-   [ ] Search & filters
-   [ ] Meilisearch integration
-   [ ] Website detail page
-   [ ] Save to favorites

### Week 9-10: Orders

-   [ ] Order placement flow
-   [ ] Stripe payment integration
-   [ ] Order status management
-   [ ] Publisher order dashboard
-   [ ] Order messaging

### Week 11-12: Fulfillment

-   [ ] Content submission
-   [ ] Review/approve flow
-   [ ] Link verification
-   [ ] Order completion
-   [ ] Review system

### Week 13-14: Launch Prep

-   [ ] Affiliate system
-   [ ] Withdrawal system
-   [ ] Email notifications
-   [ ] Landing page
-   [ ] Bug fixes & polish

## 8.3 Phase 2: Growth (Month 5-8)

-   [ ] Metrics API integration (Moz/Ahrefs)
-   [ ] Campaign management
-   [ ] Bulk ordering
-   [ ] Editor/Contributor roles
-   [ ] Advanced search filters
-   [ ] API for buyers
-   [ ] Subscription plans

## 8.4 Phase 3: Scale (Month 9-12)

-   [ ] Performance optimization
-   [ ] Advanced analytics
-   [ ] Automated metrics updates
-   [ ] Publisher tiers
-   [ ] White-label reports
-   [ ] Mobile optimization

## 8.5 Phase 4: Expand (Month 13-18)

-   [ ] Content marketplace (writers)
-   [ ] Agency features
-   [ ] API v2
-   [ ] Integrations (Ahrefs, SEMrush)
-   [ ] Multi-language support

# 9. API Documentation

## 9.1 Authentication

    # API Key authentication
    curl -X GET "https://api.pressscape.com/v1/websites" \
      -H "Authorization: Bearer YOUR_API_KEY"

## 9.2 Endpoints

### 9.2.1 Websites

    GET    /v1/websites              # List all websites
    GET    /v1/websites/:id          # Get website details
    GET    /v1/websites/search       # Search with filters

    # Filters for search:
    ?category=technology
    &da_min=30&da_max=60
    &dr_min=30
    &price_min=50&price_max=200
    &language=english
    &link_type=dofollow
    &sort=da_desc
    &page=1&limit=20

### 9.2.2 Orders

    GET    /v1/orders                # List buyer's orders
    POST   /v1/orders                # Create order
    GET    /v1/orders/:id            # Get order details
    POST   /v1/orders/:id/message    # Send message

    # Create order body:
    {
      "website_id": "web_123",
      "order_type": "guest_post",
      "content_source": "publisher_writes",
      "target_url": "https://mysite.com/page",
      "anchor_text": "my keyword",
      "is_urgent": false,
      "notes": "Please include statistics"
    }

### 9.2.3 Publisher

    GET    /v1/publisher/websites    # List publisher's websites
    POST   /v1/publisher/websites    # Add website
    PUT    /v1/publisher/websites/:id # Update website
    GET    /v1/publisher/orders      # List incoming orders
    PUT    /v1/publisher/orders/:id  # Update order status

# 10. Monthly Costs

## 10.1 Cost Breakdown

**Month 1-3 (Building):** \| Service \| Cost \| \|---------\|------\| \|
Claude Pro \| \$20 \| \| Neon Free \| \$0 \| \| Vercel Free \| \$0 \| \|
Railway (\$5 credit) \| \$0 \| \| Domain \| \$15/year \| \| **Total** \|
**\~\$25/month** \|

**Month 4-8 (Growing):** \| Service \| Cost \| \|---------\|------\| \|
Claude Pro \| \$20 \| \| Neon Pro \| \$19 \| \| Vercel \| \$20 \| \|
Railway \| \$30 \| \| Upstash \| \$10 \| \| Moz API \| \$99 \| \| Resend
\| \$20 \| \| **Total** \| **\~\$220/month** \|

**Month 9-18 (Scaling):** \| Service \| Cost \| \|---------\|------\| \|
Claude Max \| \$100 \| \| Neon Scale \| \$69 \| \| Vercel Pro \| \$20 \|
\| Railway \| \$50 \| \| Upstash \| \$20 \| \| Moz/Ahrefs \| \$199 \| \|
Resend \| \$40 \| \| Monitoring \| \$30 \| \| **Total** \|
**\~\$530/month** \|

## 10.2 18-Month Budget

  -----------------------------------------------------------------------
  Category                            Amount
  ----------------------------------- -----------------------------------
  Infrastructure                      \~\$6,000

  APIs (Moz/Ahrefs)                   \~\$2,500

  AI (Claude)                         \~\$1,500

  Domain                              \~\$30

  Legal                               \~\$300

  Buffer (20%)                        \~\$2,000

  **Total**                           **\~\$12,000**
  -----------------------------------------------------------------------

# 11. Success Metrics

## 11.1 Key Metrics

  -----------------------------------------------------------------------
  Metric            Month 3           Month 6           Month 12
  ----------------- ----------------- ----------------- -----------------
  Listed Websites   200               1,000             5,000

  Active Buyers     50                300               1,500

  Monthly Orders    20                200               1,000

  GMV               \$2,000           \$25,000          \$150,000

  Platform Revenue  \$500             \$6,250           \$37,500

  Affiliate Signups 20                100               500
  -----------------------------------------------------------------------

## 11.2 Health Metrics

  -----------------------------------------------------------------------
  Metric                              Target
  ----------------------------------- -----------------------------------
  Order Completion Rate               \>85%

  Average Order Value                 \>\$100

  Publisher Response Time             \<24h

  Buyer Satisfaction                  \>4.5/5

  Refund Rate                         \<5%

  Dispute Rate                        \<2%
  -----------------------------------------------------------------------

# 12. Risks & Mitigations

  -----------------------------------------------------------------------
  Risk             Impact                Mitigation
  ---------------- --------------------- --------------------------------
  Low publisher    High                  Aggressive outreach, competitive
  supply                                 commission

  Low buyer demand High                  SEO, content marketing,
                                         affiliates

  Quality issues   High                  Verification, reviews,
                                         guarantees

  Payment fraud    Medium                Stripe Radar, escrow system

  Chargebacks      Medium                Clear policies, dispute
                                         resolution

  Metrics API cost Medium                Cache aggressively, tiered
                                         access

  Competition      Medium                Focus on UX, transparency
  -----------------------------------------------------------------------

*End of PressScape Product Requirements Document*

**Document Statistics:** - Total Sections: 12 - Database Tables: 15+ -
User Roles: 5 - API Endpoints: 15+ - 18-Month Budget: \~\$12,000

*© 2024 PressScape - pressscape.com*
