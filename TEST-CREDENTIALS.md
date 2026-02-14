# PressScape Test Credentials

## Database Setup Completed ✅

The D1 database has been successfully initialized with all tables and test users.

## Test User Credentials

**All passwords:** `Test@123`

### 1. Admin User (All Roles)
- **Email:** `admin@pressscape.com`
- **Password:** `Test@123`
- **Roles:** Admin, Buyer, Publisher, Affiliate
- **Balances:**
  - Buyer: $500.00
  - Publisher: $250.00
  - Affiliate: $100.00
- **Affiliate Code:** AFFMLLSC8PM
- **Access:** Full platform access with all features

### 2. Publisher Account
- **Email:** `publisher@test.com`
- **Password:** `Test@123`
- **Role:** Publisher only
- **Balance:** Publisher: $250.00
- **Features:**
  - Can list websites for guest posts
  - Accept and fulfill orders
  - Receive payments
  - Manage website portfolio

### 3. Buyer Account
- **Email:** `buyer@test.com`
- **Password:** `Test@123`
- **Role:** Buyer only
- **Balance:** Buyer: $500.00
- **Features:**
  - Browse marketplace
  - Purchase guest posts
  - Create campaigns
  - Manage orders

### 4. Affiliate Account
- **Email:** `affiliate@test.com`
- **Password:** `Test@123`
- **Roles:** Affiliate + Buyer
- **Balances:**
  - Buyer: $500.00
  - Affiliate: $100.00
- **Affiliate Code:** AFFMLLSCA5D
- **Features:**
  - Refer new users
  - Earn commissions
  - Can also buy guest posts

## Current Known Issue

⚠️ **Login Error:** There's currently an error when attempting to log in with these credentials. The error message is "An error occurred during login" (HTTP 500).

### Possible Causes:
1. Edge runtime compatibility issue with cookies() function
2. Password verification timing issue
3. Session creation in D1 database

### Workaround:
The database and users are set up correctly. The issue is likely a runtime compatibility problem that needs to be debugged.

## Database Tables Created

✅ All tables successfully created:
- users
- sessions
- categories
- websites
- orders
- transactions
- payment_gateways
- affiliate_commissions
- affiliate_referrals
- buyer_favorites
- buyer_saved_searches
- conversations
- messages
- disputes
- dispute_messages
- link_verifications
- payouts
- website_contributors
- api_keys

## API Endpoints

### Seed Data
- **Endpoint:** `POST /api/admin/migrate/seed-users`
- **Purpose:** Create/update test users
- **Status:** ✅ Successfully executed

### Setup
- **Endpoint:** `POST /api/admin/setup`
- **Purpose:** Create admin account
- **Credentials:**
  - Email: nanoo.shashwat@gmail.com
  - Password: Admin@123

## Next Steps to Debug Login

1. Check Cloudflare Pages deployment logs for detailed error
2. Test login API directly with curl/Postman
3. Verify edge runtime compatibility of cookies() function
4. Consider adding more detailed error logging to login route

## Site URLs

- **Production:** https://pressscape-d1-cloudflare.pages.dev
- **Login:** https://pressscape-d1-cloudflare.pages.dev/login
- **Marketplace:** https://pressscape-d1-cloudflare.pages.dev/marketplace (requires auth)
