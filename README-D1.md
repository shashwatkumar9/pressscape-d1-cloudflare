# PressScape - Cloudflare D1 Version

This is a migration of PressScape from Vercel Postgres to Cloudflare D1 (SQLite), designed to run on Cloudflare Pages with Workers.

## 🚀 Key Changes from Original Version

### Database
- **From**: PostgreSQL (Vercel Postgres)
- **To**: Cloudflare D1 (SQLite)
- **Benefits**: Lower costs, edge deployment, better performance globally

### Deployment
- **From**: Vercel
- **To**: Cloudflare Pages
- **Benefits**: Better global CDN, integrated with D1, lower costs

### Key Differences

1. **Boolean Fields**: SQLite uses INTEGER (0/1) instead of BOOLEAN
2. **UUIDs**: Generated in application code using `crypto.randomUUID()`
3. **Timestamps**: Stored as TEXT in ISO 8601 format
4. **JSON Fields**: Stored as TEXT instead of JSONB
5. **Arrays**: Stored as JSON strings instead of PostgreSQL arrays

## 📋 Prerequisites

- Node.js 18+ installed
- Cloudflare account (free tier works)
- Wrangler CLI installed globally: `npm install -g wrangler`

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd "PressScape D1"
npm install
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create D1 Database

```bash
npm run cf:d1:create
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "pressscape-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 4. Run Database Migrations

```bash
npm run cf:d1:migrate
```

This will create all the necessary tables in your D1 database.

### 5. Set Up Environment Variables

Create a `.dev.vars` file in the project root:

```env
# Resend Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=PressScape <noreply@yourdomain.com>

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# PayPal (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # or 'live'

# Razorpay (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Development

For local development with D1:

```bash
npm run preview
```

This will build the app with `@cloudflare/next-on-pages` and run it locally with Wrangler, connecting to your D1 database.

For standard Next.js development (without D1):

```bash
npm run dev
```

Note: In standard dev mode, you'll need to mock the D1 database or it won't work.

## 🌐 Deployment

### 1. Build the Application

```bash
npm run pages:build
```

### 2. Deploy to Cloudflare Pages

```bash
npm run deploy
```

Or connect your GitHub repository to Cloudflare Pages:

1. Go to Cloudflare Dashboard > Pages
2. Create a new project
3. Connect your GitHub repository
4. Set build command: `npm run pages:build`
5. Set build output directory: `.vercel/output/static`
6. Add your environment variables
7. Deploy!

### 3. Configure Environment Variables in Cloudflare

Go to your Pages project > Settings > Environment variables and add all the variables from `.dev.vars`.

### 4. Bind D1 Database

In Cloudflare Dashboard:
1. Go to your Pages project
2. Settings > Functions
3. Add D1 database binding:
   - Variable name: `DB`
   - D1 database: Select `pressscape-db`

## 📊 Database Management

### View Data

```bash
wrangler d1 execute pressscape-db --command="SELECT * FROM users LIMIT 10"
```

### Execute Custom SQL

```bash
wrangler d1 execute pressscape-db --command="YOUR_SQL_HERE"
```

### Backup Database

```bash
wrangler d1 export pressscape-db --output=backup.sql
```

### Restore from Backup

```bash
wrangler d1 execute pressscape-db --file=backup.sql
```

## 🔄 Migration from Original Version

If you have existing data in the Vercel Postgres version:

1. Export data from PostgreSQL
2. Convert PostgreSQL SQL dump to SQLite format
3. Transform data:
   - Convert BOOLEAN to INTEGER (0/1)
   - Convert TIMESTAMPTZ to TEXT (ISO 8601)
   - Convert JSONB to TEXT
   - Convert arrays to JSON strings
4. Import into D1

A migration script can be created if needed.

## 🏗️ Project Structure

```
PressScape D1/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Dashboard pages
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
│   ├── db.ts             # D1 database client
│   ├── auth.ts           # Authentication
│   ├── cloudflare.ts     # Cloudflare bindings
│   └── ...
├── sql/                   # SQL schemas
│   └── d1-schema.sql     # D1/SQLite schema
├── public/                # Static assets
├── wrangler.toml         # Cloudflare Workers config
├── next.config.ts        # Next.js config
└── package.json          # Dependencies
```

## 🔑 Key Files Changed for D1

1. **lib/db.ts** - Complete rewrite for D1 compatibility
2. **lib/auth.ts** - Updated to handle INTEGER booleans
3. **lib/cloudflare.ts** - New file for Cloudflare bindings
4. **sql/d1-schema.sql** - SQLite-compatible schema
5. **package.json** - Updated dependencies
6. **wrangler.toml** - New Cloudflare configuration

## 🐛 Troubleshooting

### Database Connection Issues

If you get "Database not initialized" errors:
- Ensure D1 binding is configured in Cloudflare Pages
- Check that `wrangler.toml` has the correct database ID
- Verify you're running with `npm run preview` for local development

### Boolean Field Issues

Remember that SQLite uses integers for booleans:
- Use `boolToInt()` when writing to database
- Use `intToBool()` when reading from database

### Date/Time Issues

- Always use ISO 8601 format: `date.toISOString()`
- Parse dates with `new Date(dateString)`

### JSON Field Issues

- Store as strings: `JSON.stringify(data)`
- Parse when reading: `JSON.parse(field)`

## 📝 API Route Pattern

When creating or updating API routes, follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { sql, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
    // Initialize D1 database
    await initializeDatabaseFromContext();

    try {
        // Your database queries here
        const result = await sql`SELECT * FROM users LIMIT 10`;

        return NextResponse.json({ users: result.rows });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
```

## 🔐 Security Notes

- API keys and secrets should be stored in Cloudflare secrets
- Use environment variables for all sensitive data
- D1 databases are private and only accessible from your Workers
- Enable CORS only for trusted domains

## 📈 Performance Tips

1. **Indexing**: Ensure proper indexes are created (already in schema)
2. **Batching**: Use `batch()` for multiple queries
3. **Caching**: Consider using Cloudflare KV for frequently accessed data
4. **Edge**: Deploy close to users for better latency

## 🤝 Contributing

When contributing to the D1 version:
1. Test locally with `npm run preview`
2. Ensure all database queries use the D1 client
3. Handle boolean/integer conversions properly
4. Test deployment on Cloudflare Pages

## 📚 Resources

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare](https://github.com/cloudflare/next-on-pages)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## ⚠️ Known Limitations

1. **Payments**: Payment processing integration is not yet complete (pending approval)
2. **File Uploads**: May need R2 bucket for large file storage
3. **Real-time**: Consider Cloudflare Durable Objects for real-time features
4. **Database Size**: D1 has a 500MB limit on free tier

## 📞 Support

For issues specific to the D1 migration, please open an issue with:
- Error message
- Steps to reproduce
- Environment (local/production)
- Wrangler version

---

**Note**: This is the Cloudflare D1 version. For the original Vercel Postgres version, see the main branch.
