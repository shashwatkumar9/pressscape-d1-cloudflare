# Login Cookie Issue - Root Cause Analysis

## Problem Confirmed
I've tested the login flow with Chrome MCP and reproduced the issue:
1. ✅ Login API returns 200 (success)
2. ✅ Session is created in database  
3. ✅ Cookie is set in API response headers
4. ❌ **Browser doesn't store the cookie**
5. ❌ Redirect to /buyer/dashboard fails auth check
6. ❌ User redirected back to /login

## Root Cause: Cloudflare Pages Edge Runtime Cookie Handling

The issue is with how cookies are set in Cloudflare Pages Edge Runtime:

### Current Approach (Not Working)
```typescript
// In API route: app/api/auth/login/route.ts
export const runtime = 'edge';

const response = NextResponse.json({ success: true });
response.cookies.set({
  name: 'auth_session',
  value: sessionId,
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60,
  path: '/',
});
return response;
```

**Why it fails:**
- Cloudflare Pages Edge Runtime has different cookie handling than Node.js
- `response.cookies.set()` may not work the same way in Workers/Pages environment
- The Set-Cookie header might not be properly formatted for the browser

## Solutions

### Solution 1: Use Server Actions (RECOMMENDED)
Move authentication to Server Actions instead of API routes:

```typescript
// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Validate credentials and create session
  const session = await createSession(userId);
  
  // Set cookie using Next.js cookies() API
  const cookieStore = await cookies();
  cookieStore.set('auth_session', session.id, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  
  redirect('/buyer/dashboard');
}
```

### Solution 2: Use Cloudflare Workers KV for Sessions
Store session in KV and use a non-httpOnly cookie:

```typescript
// Client can set its own cookie after successful API response
const response = await fetch('/api/auth/login', { ... });
if (response.ok) {
  const { sessionId } = await response.json();
  document.cookie = `auth_session=${sessionId}; path=/; max-age=${30*24*60*60}; SameSite=Lax; Secure`;
  window.location.href = '/buyer/dashboard';
}
```

**Drawback:** Less secure (not httpOnly)

### Solution 3: Manual Set-Cookie Header
Build the Set-Cookie header manually:

```typescript
const setCookieValue = [
  `auth_session=${sessionId}`,
  'Path=/',
  'HttpOnly',
  'Secure',
  'SameSite=Lax',
  `Max-Age=${30 * 24 * 60 * 60}`,
].join('; ');

response.headers.set('Set-Cookie', setCookieValue);
```

### Solution 4: Use Middleware for Cookie Setting
Set cookies in middleware after successful login.

## Recommended Fix: Server Actions

Server Actions are the proper way to handle authentication in Next.js 15 with Edge Runtime:

1. Create `app/actions/auth.ts` with server actions
2. Update login form to use the action
3. Remove API route
4. Cookies will be properly set using Next.js `cookies()` API

## Next Steps

I'll implement Solution 1 (Server Actions) as it's the most compatible with Cloudflare Pages and Next.js 15.
