# Duplicate Password Reset Email Issue

## Problem

User reported receiving **2 password reset emails** when requesting only once from:
- Email: nanoo.shashwat@gmail.com
- Used page: `/forgot-password`

## Root Cause Analysis

There are **TWO separate forgot-password systems** in the codebase:

### 1. Regular User System ✅ WORKING
- **Page**: `/app/forgot-password/page.tsx`
- **API**: `/app/api/auth/forgot-password/route.ts`
- **Database Table**: `users`
- **Email Function**: `sendPasswordResetEmail()` from `lib/email.ts`
- **Status**: Working correctly, sends 1 email

### 2. Admin System ❌ BROKEN
- **Page**: `/app/admin/forgot-password/page.tsx`
- **API**: `/app/api/admin/auth/forgot-password/route.ts`
- **Database Table**: `admin_users` (DOES NOT EXIST!)
- **Email Function**: `sendAdminPasswordResetEmail()` (inline in route.ts)
- **Status**: Broken - tries to query non-existent table

## Why Duplicate Emails Occur

The duplicate emails are likely caused by:

1. **Browser Prefetching**: Some browsers prefetch links/routes
2. **Service Worker Cache**: May trigger duplicate requests
3. **React Strict Mode**: Can cause double-renders in development
4. **Form Resubmission**: User might have clicked button twice
5. **Network Retry**: Failed request being retried

## Investigation Steps Needed

To identify the exact cause, we need to:

1. **Add logging to API endpoints**:
   ```typescript
   console.log('[Forgot Password] Request received at', new Date().toISOString());
   console.log('[Forgot Password] Email:', email);
   console.log('[Forgot Password] User Agent:', request.headers.get('user-agent'));
   ```

2. **Check Cloudflare Pages logs** for duplicate requests

3. **Add request ID tracking**:
   ```typescript
   const requestId = crypto.randomUUID();
   console.log('[Forgot Password]', requestId, 'Starting request');
   ```

4. **Monitor Resend API dashboard** to see if 2 emails are being sent or just 1

## Possible Solutions

### Solution 1: Add Rate Limiting
Prevent duplicate requests within a short time window:

```typescript
// In /app/api/auth/forgot-password/route.ts

const rateLimitCache = new Map<string, number>();

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Check if request was made in last 60 seconds
  const lastRequest = rateLimitCache.get(email);
  const now = Date.now();

  if (lastRequest && (now - lastRequest) < 60000) {
    console.log('[Forgot Password] Rate limited:', email);
    // Still return success to prevent email enumeration
    return NextResponse.json({ success: true });
  }

  rateLimitCache.set(email, now);

  // ... rest of code
}
```

### Solution 2: Add Idempotency Key
Use a client-generated key to prevent duplicate processing:

```typescript
// Frontend: app/forgot-password/page.tsx
const idempotencyKey = crypto.randomUUID();

const response = await fetch('/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify({ email }),
});

// Backend: app/api/auth/forgot-password/route.ts
const processedKeys = new Set<string>();

export async function POST(request: NextRequest) {
  const key = request.headers.get('X-Idempotency-Key');

  if (key && processedKeys.has(key)) {
    return NextResponse.json({ success: true });
  }

  // Process request...

  if (key) processedKeys.add(key);
}
```

### Solution 3: Check Existing Tokens
Before creating a new token, check if one was created recently:

```typescript
// In /app/api/auth/forgot-password/route.ts

// Check if a token was created in the last 2 minutes
const recentTokenResult = await sql`
  SELECT created_at
  FROM password_reset_tokens
  WHERE user_id = ${user.id}
  AND datetime(created_at) > datetime('now', '-2 minutes')
`;

if (recentTokenResult.rows.length > 0) {
  console.log('[Forgot Password] Recent token exists, skipping email');
  return NextResponse.json({ success: true });
}
```

### Solution 4: Disable Button After Click (Frontend)
Already implemented - button is disabled when `loading` state is true.

## Admin System Fix

The admin forgot-password system is completely broken. We need to either:

### Option A: Remove Admin System (RECOMMENDED)
Since all users (including admin) are in the `users` table:

1. Delete `/app/admin/forgot-password/page.tsx`
2. Delete `/app/api/admin/auth/forgot-password/route.ts`
3. Update admin login page to link to regular `/forgot-password` page

### Option B: Create Admin Users Table
If we want separate admin authentication:

1. Create `admin_users` table
2. Create `admin_password_reset_tokens` table
3. Migrate admin users from `users` to `admin_users`
4. Update admin login flow

**Recommendation**: Use Option A - keep all users in one table with role flags.

## Testing Steps

After implementing a fix:

1. Clear browser cache and cookies
2. Request password reset
3. Check email inbox - should receive exactly 1 email
4. Check Resend dashboard - should show exactly 1 email sent
5. Check Cloudflare Pages logs - should show exactly 1 API call
6. Try rapid double-clicking - should still only send 1 email

## Status

- ✅ Environment variable `NEXT_PUBLIC_APP_URL` added
- ✅ Deployment triggered to fix email URLs
- 🔄 Duplicate email issue identified but not yet fixed
- ⏳ Waiting to implement rate limiting or idempotency solution

## Recommendations

1. **Immediate**: Add logging to identify exact cause
2. **Short-term**: Implement Solution 3 (check recent tokens)
3. **Long-term**: Add proper rate limiting with Cloudflare Workers KV
4. **Cleanup**: Remove broken admin forgot-password system
