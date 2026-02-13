#!/bin/bash
set -e

echo "🔧 PressScape D1 - Cloudflare Pages Build Script"
echo "================================================"
echo ""

# Step 1: Clean build artifacts
echo "🧹 Step 1/3: Cleaning previous build artifacts..."
rm -rf .next .vercel || true
echo "✅ Build directories cleaned"
echo ""

# Step 2: Run Next.js build
echo "📦 Step 2/3: Building Next.js application..."
npm run build
echo "✅ Next.js build complete"
echo ""

# Step 3: Convert to Cloudflare Pages
echo "⚡️ Step 3/3: Converting to Cloudflare Pages format..."
npm run pages:build
echo "✅ Cloudflare Pages build complete"
echo ""

echo "🎉 Build successful! Next steps:"
echo "  1. Test locally: npm run preview"
echo "  2. Deploy: npx wrangler pages deploy .vercel/output/static"
