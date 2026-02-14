# PressScape Data Migration Guide

## Migrating from Vercel Postgres to Cloudflare D1

This guide will help you migrate your existing PressScape data (users, websites, orders) from Vercel Postgres to Cloudflare D1.

## What You Need

1. **Postgres Connection String** from Vercel
   - Go to: https://vercel.com/dashboard
   - Select your PressScape project
   - Go to: Storage → Your Postgres Database → .env.local tab
   - Copy the `POSTGRES_URL` value

2. **Node.js and npm** installed on your machine

## Step 1: Install Dependencies

```bash
cd "/Users/shashwat/Desktop/PressScape D1"
npm install pg
```

## Step 2: Export Data from Postgres

Run the export script with your Postgres URL:

```bash
POSTGRES_URL="your-connection-string" node scripts/export-postgres-data.js
```

This will create a `migration-data/` folder with JSON files for each table.

## Step 3: Review Exported Data

Check the export summary:

```bash
cat migration-data/_summary.json
```

Expected data:
- 3 users (nanoo.shashwat@gmail.com, golmaalg2@gmail.com, frankchiberi@gmail.com)
- 7000+ websites
- 1+ orders
- Related transactions, favorites, etc.

## Step 4: Import to Local D1 (Testing)

```bash
node scripts/import-to-d1-local.js
```

## Step 5: Import to Production D1

```bash
node scripts/import-to-d1-production.js
```

## Important Notes

### Password Migration
⚠️ **Password hashing changed**: bcrypt → PBKDF2 (Web Crypto API)

Users will need to reset passwords after migration. We'll send them reset links.

### Admin Account
The user `nanoo.shashwat@gmail.com` should have admin privileges in the new system.

## Troubleshooting

If you get connection errors, make sure:
1. POSTGRES_URL is correct and not expired
2. Your IP is whitelisted in Vercel Postgres settings
3. The database exists and has data

## Next Steps After Migration

1. Test login (use password reset if needed)
2. Verify websites show in marketplace
3. Check order history
4. Test publisher dashboard
5. Test buyer dashboard
