# API Routes Migration Guide for Cloudflare D1

This guide explains how to migrate API routes from PostgreSQL to Cloudflare D1.

## Key Changes Required

### 1. Import Changes

**Before (PostgreSQL):**
```typescript
import { pool } from '@/lib/db';
```

**After (D1):**
```typescript
import { sql, generateId, boolToInt, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
```

### 2. Initialize Database

Add at the start of each route handler:

```typescript
export async function GET(request: NextRequest) {
    // Initialize D1 database from Cloudflare context
    await initializeDatabaseFromContext();

    try {
        // ... rest of your code
    } catch (error) {
        // ... error handling
    }
}
```

### 3. SQL Query Changes

**Before (PostgreSQL with pool.query):**
```typescript
const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
);
```

**After (D1 with sql template):**
```typescript
const result = await sql`
    SELECT * FROM users WHERE email = ${email}
`;
```

### 4. Parameter Placeholders

**PostgreSQL uses $1, $2, etc.**
```sql
SELECT * FROM users WHERE email = $1 AND is_active = $2
```

**D1 uses template literals:**
```typescript
const result = await sql`
    SELECT * FROM users
    WHERE email = ${email} AND is_active = ${boolToInt(isActive)}
`;
```

### 5. Boolean Fields

SQLite uses INTEGER (0/1) for booleans.

**When writing to database:**
```typescript
const userId = generateId();
await sql`
    INSERT INTO users (id, email, is_buyer, is_publisher)
    VALUES (${userId}, ${email}, ${boolToInt(isBuyer)}, ${boolToInt(isPublisher)})
`;
```

**When reading from database:**
```typescript
const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
const user = result.rows[0];

// Convert INTEGER to boolean
const userData = {
    ...user,
    is_buyer: intToBool(user.is_buyer),
    is_publisher: intToBool(user.is_publisher),
    is_active: intToBool(user.is_active),
};
```

### 6. UUID Generation

**Before (PostgreSQL):**
```sql
INSERT INTO users (id, email) VALUES (gen_random_uuid()::text, $1)
```

**After (D1):**
```typescript
const userId = generateId(); // generates UUID v4
await sql`INSERT INTO users (id, email) VALUES (${userId}, ${email})`;
```

### 7. Date/Time Handling

**Before (PostgreSQL):**
```sql
INSERT INTO orders (id, created_at) VALUES ($1, NOW())
```

**After (D1):**
```typescript
const orderId = generateId();
const createdAt = new Date().toISOString();
await sql`INSERT INTO orders (id, created_at) VALUES (${orderId}, ${createdAt})`;
```

### 8. JSON Fields

**Before (PostgreSQL with JSONB):**
```sql
INSERT INTO orders (id, secondary_links) VALUES ($1, $2::jsonb)
```

**After (D1 with TEXT):**
```typescript
const secondaryLinks = JSON.stringify([{ url: 'https://example.com', anchor: 'Link' }]);
await sql`INSERT INTO orders (id, secondary_links) VALUES (${orderId}, ${secondaryLinks})`;
```

**When reading:**
```typescript
const result = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
const order = result.rows[0];
const links = JSON.parse(order.secondary_links || '[]');
```

### 9. Array Fields

PostgreSQL arrays become JSON strings in SQLite.

**Before (PostgreSQL):**
```sql
INSERT INTO orders (id, keywords) VALUES ($1, $2::text[])
```

**After (D1):**
```typescript
const keywords = JSON.stringify(['seo', 'marketing', 'content']);
await sql`INSERT INTO orders (id, keywords) VALUES (${orderId}, ${keywords})`;
```

### 10. Dynamic Query Building

When building queries with dynamic conditions:

**Before (PostgreSQL):**
```typescript
const conditions: string[] = ['is_active = true'];
const params: unknown[] = [];
let paramIndex = 1;

if (email) {
    conditions.push(`email = $${paramIndex++}`);
    params.push(email);
}

const query = `SELECT * FROM users WHERE ${conditions.join(' AND ')}`;
const result = await pool.query(query, params);
```

**After (D1):**
```typescript
// Option 1: Use conditional template literals
const result = await sql`
    SELECT * FROM users
    WHERE is_active = 1
    ${email ? sql`AND email = ${email}` : sql``}
`;

// Option 2: Build the query string manually
const conditions: string[] = ['is_active = 1'];
const params: unknown[] = [];

if (email) {
    conditions.push(`email = ?`);
    params.push(email);
}

const query = `SELECT * FROM users WHERE ${conditions.join(' AND ')}`;
const result = await execute(query, params);
```

## Complete Example Migration

### Before (PostgreSQL):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { email, name, isBuyer } = await request.json();

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (id, email, name, is_buyer, created_at)
             VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())
             RETURNING *`,
            [email, name, isBuyer]
        );

        const user = result.rows[0];

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

### After (D1):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId, boolToInt, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';

export async function POST(request: NextRequest) {
    // Initialize D1 database
    await initializeDatabaseFromContext();

    try {
        const { email, name, isBuyer } = await request.json();

        // Generate UUID and timestamp
        const userId = generateId();
        const createdAt = new Date().toISOString();

        // Insert user
        const result = await sql`
            INSERT INTO users (id, email, name, is_buyer, created_at)
            VALUES (${userId}, ${email}, ${name}, ${boolToInt(isBuyer)}, ${createdAt})
        `;

        // Fetch the inserted user
        const userResult = await sql`SELECT * FROM users WHERE id = ${userId}`;
        const dbUser = userResult.rows[0];

        // Convert boolean fields
        const user = {
            ...dbUser,
            is_buyer: intToBool(dbUser.is_buyer),
            is_publisher: intToBool(dbUser.is_publisher),
            is_affiliate: intToBool(dbUser.is_affiliate),
            is_active: intToBool(dbUser.is_active),
        };

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

## Migration Checklist

For each API route file:

- [ ] Add `await initializeDatabaseFromContext()` at the start
- [ ] Replace `pool.query()` with `sql` template literals
- [ ] Replace `pool` import with D1 helpers
- [ ] Convert `$1, $2` placeholders to template literals
- [ ] Use `generateId()` instead of `gen_random_uuid()`
- [ ] Use `new Date().toISOString()` instead of `NOW()`
- [ ] Convert boolean values with `boolToInt()` when writing
- [ ] Convert boolean fields with `intToBool()` when reading
- [ ] Convert arrays to JSON strings
- [ ] Convert JSONB fields to JSON strings
- [ ] Update RETURNING clauses (fetch separately in D1)
- [ ] Test the route locally with `npm run preview`

## Testing Your Changes

1. **Local Testing:**
   ```bash
   npm run preview
   ```

2. **Test Database Connection:**
   ```bash
   curl http://localhost:8788/api/health
   ```

3. **Test Your Modified Route:**
   ```bash
   curl -X POST http://localhost:8788/api/your-route \
     -H "Content-Type: application/json" \
     -d '{"your": "data"}'
   ```

## Common Issues

### "Database not initialized" Error
- Make sure you called `await initializeDatabaseFromContext()` at the start of your route handler
- Verify D1 binding is configured in wrangler.toml
- Check that you're running with `npm run preview` for local testing

### Boolean Values Not Working
- Remember to use `boolToInt()` when writing to database
- Remember to use `intToBool()` when reading from database
- Check that schema uses INTEGER for boolean fields

### JSON Parse Errors
- Ensure you're storing JSON as strings: `JSON.stringify(data)`
- Ensure default values in schema are valid JSON: `'[]'` or `'{}'`
- Parse when reading: `JSON.parse(field || '[]')`

### Date/Time Issues
- Always use ISO 8601 format: `new Date().toISOString()`
- SQLite stores as TEXT, so dates come back as strings
- Parse when needed: `new Date(dateString)`

## Performance Tips

1. **Batch Queries**: Use `batch()` for multiple operations
2. **Indexes**: Ensure proper indexes (already in schema)
3. **Limit Results**: Always use LIMIT for large queries
4. **Caching**: Consider KV for frequently accessed data

## Next Steps

After migrating an API route:

1. Test it locally
2. Check error handling
3. Verify data conversions
4. Update any related documentation
5. Test in production (staging first)

## Questions?

If you encounter issues:
1. Check the README-D1.md for setup instructions
2. Review this migration guide
3. Look at example migrated routes
4. Check Cloudflare D1 documentation
