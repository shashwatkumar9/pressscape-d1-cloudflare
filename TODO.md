# PressScape D1 - Cloudflare Deployment TODO

## Deployment Checklist

### Phase 1: Build Verification ✅
- [x] Fix crypto imports for Edge Runtime
- [x] Update file upload route configuration
- [x] **✅ COMPLETE: Build verified on Mac**
  - Command: `npm run build` ✅ SUCCESSFUL
  - Location: `/Users/shashwat/Desktop/PressScape D1`
  - Status: Compiled successfully with 61 static pages

### Phase 2: GitHub Setup ⏸️
- [ ] Use Chrome MCP to access GitHub
- [ ] Create new repository (name: "pressscape-d1-cloudflare" or similar)
- [ ] Configure repository settings
- [ ] Initialize git in project directory
- [ ] Add remote origin
- [ ] Push code to GitHub
  - `git add .`
  - `git commit -m "Initial commit: PressScape D1 for Cloudflare"`
  - `git push -u origin main`

### Phase 3: Cloudflare Pages Deployment ⏸️
- [ ] Use Chrome MCP to access Cloudflare Dashboard
- [ ] Navigate to Pages section
- [ ] Create new Pages project
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Framework preset: Next.js
  - Build command: `npm run build`
  - Build output directory: `.vercel/output/static`
  - Root directory: `/`
  - Node version: 18.x or higher
- [ ] Add environment variables (if any needed)
- [ ] Trigger initial deployment

### Phase 4: D1 Database Binding ⏸️
- [ ] Open Cloudflare Dashboard (via Chrome MCP)
- [ ] Navigate to Pages → [Project Name] → Settings
- [ ] Go to Functions section
- [ ] Add D1 database binding:
  - Variable name: `DB`
  - Select D1 database: [The migrated database]
- [ ] Save and redeploy

### Phase 5: Live Testing ⏸️
- [ ] Test user authentication
  - [ ] User signup
  - [ ] User login
  - [ ] Password reset flow
- [ ] Test admin authentication
  - [ ] Admin login
  - [ ] Admin dashboard access
- [ ] Test affiliate system
  - [ ] Affiliate code generation
  - [ ] Affiliate signup
  - [ ] Commission tracking
- [ ] Test site management
  - [ ] Create site
  - [ ] Edit site
  - [ ] Delete site
  - [ ] Domain verification (DNS)
- [ ] Test buyer API
  - [ ] API key generation
  - [ ] API authentication
  - [ ] Site search endpoint
- [ ] Verify database connectivity
  - [ ] Check data persistence
  - [ ] Verify query performance
- [ ] Test edge runtime routes
  - [ ] Verify response times
  - [ ] Check error handling

### Phase 6: Known Issues to Address ⚠️
- [ ] **DNS Verification** (`lib/dns-verify.ts`)
  - Current: Uses Node.js `dns` module
  - Options:
    - Remove edge runtime from DNS verification routes
    - Implement DNS-over-HTTPS using fetch API
  - Impact: Domain ownership verification

- [ ] **File Upload** (`app/api/upload/image/route.ts`)
  - Current: Uses Node.js filesystem
  - Production: Needs Cloudflare R2 bucket integration
  - Impact: Image uploads won't work without R2

## Current Status

**✅ READY FOR DEPLOYMENT:** Phase 1 complete - build verified successfully
**Next step:** Choose deployment method:
  - Option A: Cloudflare Pages via Dashboard (manual, 15 mins)
  - Option B: Chrome MCP assisted deployment (automated)

**Current Phase:** Phase 2 - Ready to deploy to Cloudflare Pages

## Notes

- All Chrome operations should use Chrome MCP as per user request
- User wants to do live testing after deployment
- 121 edge runtime routes are configured and ready
- All crypto imports have been fixed with Web Crypto API
- Database (D1) is already migrated and ready to bind
