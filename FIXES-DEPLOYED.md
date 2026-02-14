# Fixes Deployed - February 14, 2026

## ✅ Issues Fixed

### 1. Wrong URL in Password Reset Emails
**Problem**: Password reset emails contained `http://localhost:3001/reset-password?token=...` instead of production URL

**Root Cause**: Missing `NEXT_PUBLIC_APP_URL` environment variable in Cloudflare Pages

**Solution**:
- Added `NEXT_PUBLIC_APP_URL=https://pressscape-d1-cloudflare.pages.dev` to Cloudflare Pages environment variables
- Variable is used in `lib/email.ts` line 16 to generate correct URLs

**Status**: ✅ Fixed in deployment `4dabb72`

**Testing**:
1. Go to: https://pressscape-d1-cloudflare.pages.dev/forgot-password
2. Request password reset for your email
3. Check email - link should now be: `https://pressscape-d1-cloudflare.pages.dev/reset-password?token=...`

### 2. Duplicate Password Reset Emails
**Problem**: Users received 2 identical password reset emails when requesting only once

**Root Cause**: Rapid duplicate requests (browser prefetch, double-click, or form resubmission)

**Solution**:
- Added 2-minute deduplication check in `/app/api/auth/forgot-password/route.ts`
- If a password reset token was created in the last 2 minutes, skip sending another email
- Added logging to track duplicate attempts: `[Forgot Password] Recent token exists, skipping duplicate email`

**Code Change**:
```typescript
// Check if a token was created in the last 2 minutes
const recentTokenResult = await sql`
  SELECT created_at, token
  FROM password_reset_tokens
  WHERE user_id = ${user.id}
  AND datetime(created_at) > datetime('now', '-2 minutes')
`;

if (recentTokenResult.rows.length > 0) {
  console.log('[Forgot Password] Recent token exists, skipping duplicate email');
  return NextResponse.json({ success: true });
}
```

**Status**: ✅ Fixed in deployment `78fbc0d`

**Testing**:
1. Request password reset
2. Immediately request again (within 2 minutes)
3. Should receive only 1 email (first request)
4. Second request returns success but doesn't send email

## 📋 Current Deployment

**Latest Deployment**: `78fbc0d` - **Active**
- Commit: "Fix duplicate password reset email issue"
- URL: https://7cdb3e24.pressscape-d1-cloudflare.pages.dev
- Production: https://pressscape-d1-cloudflare.pages.dev

**Previous Deployment**: `4dabb72` - Active
- Commit: "Add environment variables documentation"
- Included `NEXT_PUBLIC_APP_URL` environment variable

## 🧪 Testing Instructions

### Test Password Reset Flow
1. **Request Reset**:
   ```
   https://pressscape-d1-cloudflare.pages.dev/forgot-password
   ```
   - Enter email: nanoo.shashwat@gmail.com
   - Click "Send Reset Link"

2. **Check Email**:
   - Should receive exactly **1 email** (not 2)
   - Email subject: "Reset Your Password - PressScape"
   - Reset link should be: `https://pressscape-d1-cloudflare.pages.dev/reset-password?token=...`

3. **Click Reset Link**:
   - Should open: `https://pressscape-d1-cloudflare.pages.dev/reset-password?token=...`
   - **Not**: `http://localhost:3001/reset-password?token=...`

4. **Set New Password**:
   - Enter new password
   - Confirm password
   - Submit

5. **Test Login**:
   ```
   https://pressscape-d1-cloudflare.pages.dev/login
   ```
   - Use new password
   - Should successfully log in

### Test Duplicate Prevention
1. Request password reset
2. **Immediately** click "Send Reset Link" again
3. Should see "Check Your Email" message both times
4. Should receive only **1 email** (not 2)
5. Check Cloudflare logs - second request should log: "Recent token exists, skipping duplicate email"

## 📝 Documentation Created

1. **ENV-VARS.md** - Environment variables configuration guide
2. **DUPLICATE-EMAIL-ISSUE.md** - Detailed analysis of duplicate email problem
3. **FIXES-DEPLOYED.md** - This file

## 🎯 Next Steps

### When Adding Custom Domain (pressscape.com)
1. Add custom domain in Cloudflare Pages dashboard
2. Update environment variable:
   ```
   NEXT_PUBLIC_APP_URL=https://pressscape.com
   ```
3. Trigger new deployment (or automatic deployment via git push)
4. Test password reset to verify new URL

### Future Improvements
- Add rate limiting using Cloudflare Workers KV for more robust protection
- Remove broken `/app/admin/forgot-password` system (not needed)
- Add email delivery monitoring
- Set up alerts for failed email sends

## ✅ Verification Checklist

- [x] Environment variable added to Cloudflare Pages
- [x] Duplicate email prevention implemented
- [x] Code committed and pushed to GitHub
- [x] Deployment completed successfully
- [x] Latest deployment is Active
- [ ] User tested password reset with correct URL (awaiting confirmation)
- [ ] User confirmed only 1 email received (awaiting confirmation)

## 🔗 Useful Links

- **Live Site**: https://pressscape-d1-cloudflare.pages.dev
- **GitHub**: https://github.com/shashwatkumar9/pressscape-d1-cloudflare
- **Latest Deployment**: https://7cdb3e24.pressscape-d1-cloudflare.pages.dev
- **Cloudflare Dashboard**: https://dash.cloudflare.com/9e79ed6651ebcaffe98a867f16204ba6/pages/view/pressscape-d1-cloudflare

## 📊 Summary

**Both issues reported by user have been fixed and deployed:**

1. ✅ Password reset emails now use production URL (`https://pressscape-d1-cloudflare.pages.dev`)
2. ✅ Duplicate emails prevented with 2-minute deduplication window

**User can now**:
- Reset password successfully
- Receive correct reset link
- Not receive duplicate emails
- Access the application with new password

**Deployment Status**: 🟢 Live and Ready
