# Environment Variables Configuration

## Cloudflare Pages Environment Variables

All environment variables are configured in the Cloudflare Pages dashboard under:
**Settings → Variables and Secrets**

### Required Variables

| Variable Name | Purpose | Status |
|--------------|---------|--------|
| `RESEND_API_KEY` | Email service for password resets and notifications | ✅ Configured |
| `STRIPE_SECRET_KEY` | Payment processing backend | ✅ Configured |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Frontend Stripe integration | ✅ Configured |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | ✅ Configured |
| `NEXT_PUBLIC_APP_URL` | Application URL for emails and redirects | ✅ Configured |

### Environment-Specific Values

#### Production
```
NEXT_PUBLIC_APP_URL=https://pressscape-d1-cloudflare.pages.dev
```

#### Custom Domain (Future)
```
NEXT_PUBLIC_APP_URL=https://pressscape.com
```

### How These Variables Are Used

#### `NEXT_PUBLIC_APP_URL`
- **Used in**: `lib/email.ts` (line 16)
- **Purpose**: Generates correct URLs in password reset emails
- **Example**: `${APP_URL}/reset-password?token=...`
- **Default**: Falls back to `http://localhost:3001` if not set

#### Email Service Variables
- **RESEND_API_KEY**: Authenticates with Resend email service
- **Used in**: All email sending functions

#### Payment Variables
- **STRIPE_SECRET_KEY**: Server-side Stripe operations
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Client-side Stripe checkout
- **STRIPE_WEBHOOK_SECRET**: Verifies webhook authenticity

### Deployment Notes

⚠️ **Important**: Changes to environment variables require a new deployment to take effect.

To apply environment variable changes:
1. Update the variable in Cloudflare Pages dashboard
2. Click "Save"
3. Trigger a new deployment (git push or manual redeploy)
4. Verify the change is live

### Updating for Custom Domain

When adding a custom domain (e.g., pressscape.com):

1. Add the custom domain in Cloudflare Pages
2. Update `NEXT_PUBLIC_APP_URL` to: `https://pressscape.com`
3. Trigger a new deployment
4. Test password reset emails to verify correct URL
