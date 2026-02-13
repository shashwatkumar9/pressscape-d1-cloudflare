# 🚀 Development Server Guide

## The Issue You're Seeing

When you run `npm run dev`, you get this error:
```
Error: Database not initialized. Call setDatabase() first.
```

**Why?** Because `npm run dev` runs standard Next.js without Cloudflare D1 context.

---

## ✅ Solution: Use Wrangler for Local Development

Cloudflare D1 databases need Cloudflare's environment. Use **Wrangler** which simulates the Cloudflare Pages environment locally:

### **Option 1: Use Wrangler Dev (Recommended)**

```bash
# Build and run with Cloudflare context
npm run preview
```

This command:
1. Builds your Next.js app for Cloudflare Pages
2. Starts Wrangler dev server with D1 database access
3. Runs on http://localhost:8788

### **Option 2: Direct Wrangler Command**

```bash
# Build first
npm run pages:build

# Then run with wrangler
wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat --binding DB=pressscape-db
```

---

## 🔄 Development Workflow

### **For Active Development:**

**Option A: Use Local Wrangler (Fastest)**
```bash
npm run pages:build  # Build once
wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat
```

**Option B: Auto-rebuild (Slower but watches changes)**
```bash
# Terminal 1: Watch and rebuild
npm run dev

# Terminal 2: Run with wrangler
wrangler pages dev .vercel/output/static --live-reload
```

---

## 📝 What Each Command Does

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run dev` | Standard Next.js dev | ❌ **Won't work** - No D1 access |
| `npm run preview` | Build + Wrangler dev | ✅ **Best for testing** |
| `wrangler pages dev` | Run with Cloudflare context | ✅ **Proper D1 access** |
| `npm run deploy` | Deploy to production | 🚀 **When ready to launch** |

---

## 🛠️ Quick Fix: Update Your Workflow

**Instead of:**
```bash
npm run dev  # ❌ This won't work with D1
```

**Use this:**
```bash
npm run preview  # ✅ This works with D1
```

---

## 🎯 Alternative: Local SQLite Fallback (Advanced)

If you really need `npm run dev`, install better-sqlite3:

```bash
npm install better-sqlite3 --save
npm install @types/better-sqlite3 --save-dev
```

Then the app will automatically use a local SQLite database (`local-dev.db`) when D1 isn't available.

---

## 🚀 Ready to Deploy?

When everything works locally:

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

This will:
1. Build your app
2. Deploy to Cloudflare's global edge network
3. Connect to your D1 database

---

## 📊 Summary

**For local development with D1:**
- ✅ Use `npm run preview` or `wrangler pages dev`
- ❌ Don't use `npm run dev` (no D1 access)
- 🚀 Use `npm run deploy` for production

**Your D1 database is live and ready!** Just use the right development command.
