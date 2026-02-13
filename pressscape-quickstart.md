# PressScape Solo Developer Quick Start Guide

## Guest Post Marketplace - pressscape.com

## Business Model Summary

  -----------------------------------------------------------------------
  Revenue Stream                      Rate
  ----------------------------------- -----------------------------------
  **Platform Commission**             25% of order (publisher pays)

  **Affiliate Commission**            7.5% of total order
  -----------------------------------------------------------------------

**Example \$100 Order:**

    Buyer Pays:       $100
    Publisher Gets:   $75 (75%)
    Platform Gets:    $25 (25%)
    └─ If Affiliate: $7.50 to affiliate, $17.50 to platform

## User Roles (All Switchable)

  -----------------------------------------------------------------------
  Role                                Description
  ----------------------------------- -----------------------------------
  **Buyer**                           Purchases guest posts/links

  **Publisher Owner**                 Owns sites, full control

  **Publisher Editor**                Reviews content

  **Publisher Contributor**           Writes content

  **Affiliate**                       Earns referral commissions
  -----------------------------------------------------------------------

## Tech Stack

  -----------------------------------------------------------------------
  Component               Service                 Cost
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js 14 on Vercel    Free→\$20

  Database                **Neon PostgreSQL**     Free→\$19

  Search                  **Meilisearch on        \$5→\$30
                          Railway**               

  Cache                   Upstash Redis           Free→\$20

  Workers                 Railway                 \$5→\$50

  Storage                 Cloudflare R2           Free

  Auth                    **Lucia Auth**          Free

  Payments                **Stripe**              2.9% + \$0.30

  Metrics                 **Moz/Ahrefs API**      \$99→\$199

  Email                   Resend                  Free→\$20
  -----------------------------------------------------------------------

## Monthly Costs

  -----------------------------------------------------------------------
  Phase                               Cost/Month
  ----------------------------------- -----------------------------------
  Building (Month 1-3)                \~\$25

  Growing (Month 4-8)                 \~\$220

  Scaling (Month 9+)                  \~\$530
  -----------------------------------------------------------------------

**18-Month Total: \~\$12,000**

## Week-by-Week Build Plan

### Week 1-2: Foundation

    # Create Next.js app
    npx create-next-app@latest pressscape --typescript --tailwind --app

    # Install dependencies
    npm install lucia @lucia-auth/adapter-postgresql
    npm install @neondatabase/serverless
    npm install @upstash/redis
    npm install stripe
    npm install meilisearch

    # Accounts to create:
    # - neon.tech (database)
    # - railway.app (workers + meilisearch)
    # - vercel.com (hosting)
    # - upstash.com (redis)
    # - stripe.com (payments)
    # - resend.com (email)

### Week 3-4: Core Database Schema

    -- Users with multi-role support
    CREATE TABLE users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      
      -- Role flags
      is_buyer BOOLEAN DEFAULT false,
      is_publisher BOOLEAN DEFAULT false,
      is_affiliate BOOLEAN DEFAULT false,
      
      -- Balances (cents)
      buyer_balance INTEGER DEFAULT 0,
      publisher_balance INTEGER DEFAULT 0,
      affiliate_balance INTEGER DEFAULT 0,
      
      -- Affiliate
      affiliate_code TEXT UNIQUE,
      referred_by TEXT REFERENCES users(id),
      
      -- Stripe
      stripe_customer_id TEXT,
      stripe_connect_id TEXT,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Websites (publisher inventory)
    CREATE TABLE websites (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      owner_id TEXT REFERENCES users(id),
      domain TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      
      -- Metrics
      domain_authority INTEGER,
      domain_rating INTEGER,
      organic_traffic INTEGER,
      
      -- Pricing (cents)
      price_guest_post INTEGER,
      price_link_insertion INTEGER,
      
      -- Settings
      turnaround_days INTEGER DEFAULT 7,
      max_links INTEGER DEFAULT 2,
      link_type TEXT DEFAULT 'dofollow',
      
      -- Status
      verification_status TEXT DEFAULT 'pending',
      is_active BOOLEAN DEFAULT true,
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Orders
    CREATE TABLE orders (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      order_number TEXT UNIQUE NOT NULL,
      
      buyer_id TEXT REFERENCES users(id),
      website_id TEXT REFERENCES websites(id),
      publisher_id TEXT REFERENCES users(id),
      affiliate_id TEXT REFERENCES users(id),
      
      order_type TEXT NOT NULL, -- guest_post, link_insertion
      
      -- Links
      target_url TEXT NOT NULL,
      anchor_text TEXT NOT NULL,
      
      -- Pricing (cents)
      subtotal INTEGER NOT NULL,
      platform_fee INTEGER NOT NULL,  -- 25%
      affiliate_fee INTEGER DEFAULT 0, -- 7.5%
      total_amount INTEGER NOT NULL,
      publisher_earnings INTEGER NOT NULL,
      
      -- Status
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Affiliate tracking
    CREATE TABLE affiliate_referrals (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      affiliate_id TEXT REFERENCES users(id),
      referred_user_id TEXT REFERENCES users(id),
      referral_code TEXT NOT NULL,
      total_commission INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX idx_websites_owner ON websites(owner_id);
    CREATE INDEX idx_websites_metrics ON websites(domain_authority DESC);
    CREATE INDEX idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX idx_orders_publisher ON orders(publisher_id);

### Week 5-6: Publisher Features

    // app/publisher/websites/new/page.tsx
    export default function AddWebsite() {
      const [step, setStep] = useState(1);
      
      return (
        <div className="max-w-2xl mx-auto">
          <h1>Add New Website</h1>
          
          {step === 1 && <BasicInfoStep onNext={() => setStep(2)} />}
          {step === 2 && <PricingStep onNext={() => setStep(3)} />}
          {step === 3 && <RequirementsStep onNext={() => setStep(4)} />}
          {step === 4 && <VerificationStep />}
        </div>
      );
    }

    // Website verification
    export async function verifyWebsite(websiteId: string, method: string) {
      const website = await db.query(`SELECT * FROM websites WHERE id = $1`, [websiteId]);
      const code = `pressscape-verify-${websiteId.slice(0, 8)}`;
      
      if (method === 'dns') {
        const records = await dns.resolveTxt(website.domain);
        const verified = records.flat().some(r => r.includes(code));
        
        if (verified) {
          await db.query(
            `UPDATE websites SET verification_status = 'verified', verified_at = NOW() WHERE id = $1`,
            [websiteId]
          );
        }
        return verified;
      }
    }

### Week 7-8: Marketplace & Search

    // lib/search.ts
    import { MeiliSearch } from 'meilisearch';

    const client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST!,
      apiKey: process.env.MEILISEARCH_API_KEY,
    });

    export async function searchWebsites(params: SearchParams) {
      const filters = [];
      
      if (params.daMin) filters.push(`domain_authority >= ${params.daMin}`);
      if (params.daMax) filters.push(`domain_authority <= ${params.daMax}`);
      if (params.priceMax) filters.push(`price_guest_post <= ${params.priceMax * 100}`);
      if (params.category) filters.push(`category = "${params.category}"`);
      
      return client.index('websites').search(params.query || '', {
        filter: filters.join(' AND '),
        sort: params.sort === 'da' ? ['domain_authority:desc'] : 
              params.sort === 'price' ? ['price_guest_post:asc'] : undefined,
        limit: 20,
        offset: (params.page - 1) * 20,
      });
    }

### Week 9-10: Orders & Payments

    // app/api/orders/route.ts
    export async function POST(req: Request) {
      const user = await getUser(req);
      const data = await req.json();
      
      const website = await db.query(`SELECT * FROM websites WHERE id = $1`, [data.website_id]);
      
      // Calculate pricing
      const basePrice = website.price_guest_post;
      const writingFee = data.content_source === 'publisher_writes' ? website.writing_fee : 0;
      const subtotal = basePrice + writingFee;
      const platformFee = Math.round(subtotal * 0.25); // 25%
      
      // Check for affiliate
      let affiliateFee = 0;
      let affiliateId = null;
      if (user.referred_by) {
        affiliateFee = Math.round(subtotal * 0.075); // 7.5%
        affiliateId = user.referred_by;
      }
      
      const total = subtotal;
      const publisherEarnings = subtotal - platformFee;
      
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: 'usd',
        customer: user.stripe_customer_id,
        metadata: { website_id: data.website_id },
      });
      
      // Create order
      const orderNumber = `PS-${Date.now().toString().slice(-6)}`;
      
      const order = await db.query(
        `INSERT INTO orders 
         (order_number, buyer_id, website_id, publisher_id, affiliate_id,
          order_type, target_url, anchor_text, subtotal, platform_fee, 
          affiliate_fee, total_amount, publisher_earnings, stripe_payment_intent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [orderNumber, user.id, data.website_id, website.owner_id, affiliateId,
         data.order_type, data.target_url, data.anchor_text, subtotal, platformFee,
         affiliateFee, total, publisherEarnings, paymentIntent.id]
      );
      
      return Response.json({
        order,
        clientSecret: paymentIntent.client_secret,
      });
    }

### Week 11-12: Order Fulfillment

    // Order status flow
    const ORDER_FLOW = {
      pending: ['accepted', 'cancelled'],
      accepted: ['writing', 'content_submitted'],
      writing: ['content_submitted'],
      content_submitted: ['revision_needed', 'approved'],
      revision_needed: ['content_submitted'],
      approved: ['published'],
      published: ['completed'],
      completed: [], // Terminal
      cancelled: [], // Terminal
    };

    // Update order status
    export async function updateOrderStatus(orderId: string, newStatus: string, userId: string) {
      const order = await db.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
      
      // Validate transition
      if (!ORDER_FLOW[order.status].includes(newStatus)) {
        throw new Error(`Invalid status transition: ${order.status} → ${newStatus}`);
      }
      
      await db.query(
        `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, orderId]
      );
      
      // Handle completion
      if (newStatus === 'completed') {
        await releasePayment(order);
      }
    }

    // Release payment to publisher
    async function releasePayment(order: Order) {
      // Credit publisher balance
      await db.query(
        `UPDATE users SET publisher_balance = publisher_balance + $1 WHERE id = $2`,
        [order.publisher_earnings, order.publisher_id]
      );
      
      // Credit affiliate if applicable
      if (order.affiliate_id && order.affiliate_fee > 0) {
        await db.query(
          `UPDATE users SET affiliate_balance = affiliate_balance + $1 WHERE id = $2`,
          [order.affiliate_fee, order.affiliate_id]
        );
      }
      
      // Record transactions
      await db.query(
        `INSERT INTO transactions (user_id, type, amount, reference_id)
         VALUES ($1, 'earning', $2, $3)`,
        [order.publisher_id, order.publisher_earnings, order.id]
      );
    }

### Week 13-14: Affiliate System

    // Affiliate tracking middleware
    export async function trackAffiliate(req: NextRequest) {
      const ref = req.nextUrl.searchParams.get('ref');
      
      if (ref) {
        const response = NextResponse.next();
        response.cookies.set('affiliate_ref', ref, {
          maxAge: 90 * 24 * 60 * 60, // 90 days
          httpOnly: true,
        });
        return response;
      }
      
      return NextResponse.next();
    }

    // Attribute referral on signup
    export async function attributeReferral(userId: string, affiliateCode: string) {
      const affiliate = await db.query(
        `SELECT id FROM users WHERE affiliate_code = $1`,
        [affiliateCode]
      );
      
      if (affiliate) {
        await db.query(
          `INSERT INTO affiliate_referrals (affiliate_id, referred_user_id, referral_code)
           VALUES ($1, $2, $3)`,
          [affiliate.id, userId, affiliateCode]
        );
        
        await db.query(
          `UPDATE users SET referred_by = $1 WHERE id = $2`,
          [affiliate.id, userId]
        );
      }
    }

## Environment Variables

    # .env.local

    # Database (Neon)
    DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/pressscape

    # Redis (Upstash)
    UPSTASH_REDIS_REST_URL=https://xyz.upstash.io
    UPSTASH_REDIS_REST_TOKEN=xxx

    # Search (Meilisearch)
    MEILISEARCH_HOST=https://your-app.railway.app
    MEILISEARCH_API_KEY=xxx

    # Payments (Stripe)
    STRIPE_SECRET_KEY=sk_live_xxx
    STRIPE_PUBLISHABLE_KEY=pk_live_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx

    # Metrics APIs
    MOZ_ACCESS_ID=xxx
    MOZ_SECRET_KEY=xxx
    AHREFS_API_KEY=xxx

    # Email (Resend)
    RESEND_API_KEY=re_xxx

    # App
    NEXT_PUBLIC_APP_URL=https://pressscape.com

## Commission Rates Summary

  -----------------------------------------------------------------------
  Party                   Rate                    From
  ----------------------- ----------------------- -----------------------
  Publisher               75%                     Order subtotal

  Platform                25%                     Order subtotal

  Affiliate               7.5%                    Total order (from
                                                  platform share)
  -----------------------------------------------------------------------

## Dashboard Routes

  -----------------------------------------------------------------------
  Role                                Route
  ----------------------------------- -----------------------------------
  Buyer                               `/buyer/dashboard`

  Publisher                           `/publisher/dashboard`

  Editor                              `/publisher/editor`

  Contributor                         `/publisher/contributor`

  Affiliate                           `/affiliate/dashboard`
  -----------------------------------------------------------------------

## Order Statuses

    pending → accepted → writing → content_submitted → approved → published → completed
                                  ↓
                           revision_needed

## Key API Endpoints

    # Marketplace
    GET  /api/v1/websites         # List websites
    GET  /api/v1/websites/:id     # Website details
    GET  /api/v1/websites/search  # Search with filters

    # Orders
    POST /api/v1/orders           # Create order
    GET  /api/v1/orders/:id       # Order details
    PUT  /api/v1/orders/:id       # Update status

    # Publisher
    POST /api/v1/publisher/websites      # Add website
    PUT  /api/v1/publisher/websites/:id  # Update website
    GET  /api/v1/publisher/orders        # Incoming orders

    # Affiliate
    GET  /api/v1/affiliate/stats         # Referral stats
    GET  /api/v1/affiliate/commissions   # Commission history

## Launch Checklist

-   [ ] User registration with role selection
-   [ ] Role switching in header
-   [ ] Publisher: Add website flow
-   [ ] Publisher: Website verification
-   [ ] Marketplace: Search & filters
-   [ ] Marketplace: Website detail page
-   [ ] Order: Placement flow
-   [ ] Order: Stripe payment
-   [ ] Order: Status management
-   [ ] Order: Messaging
-   [ ] Publisher: Accept/reject orders
-   [ ] Affiliate: Referral tracking
-   [ ] Affiliate: Commission calculation
-   [ ] Withdrawals: Request & process
-   [ ] Email notifications

## Revenue Targets

  -----------------------------------------------------------------------
  Month                   GMV                     Platform Rev
  ----------------------- ----------------------- -----------------------
  3                       \$5,000                 \$1,250

  6                       \$25,000                \$6,250

  12                      \$150,000               \$37,500

  18                      \$300,000               \$75,000
  -----------------------------------------------------------------------

*Build the most transparent guest post marketplace. Focus on publisher
supply first, then buyer demand!*
