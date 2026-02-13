#!/bin/bash
set -e

echo "🔍 PressScape D1 - Build Verification Script"
echo "============================================="
echo ""

# Step 1: Verify edge runtime exports
echo "📋 Step 1/4: Checking edge runtime exports..."
export_count=$(grep -r 'export const runtime = "edge"' app/ | wc -l | tr -d ' ')
echo "   Found $export_count files with edge runtime export"

if [ "$export_count" -lt 120 ]; then
    echo "   ⚠️  Warning: Expected ~121 files, found $export_count"
    echo "   Run: python3 add-edge-runtime.py"
    exit 1
fi
echo "   ✅ Edge runtime exports verified"
echo ""

# Step 2: Clean old build artifacts
echo "🧹 Step 2/4: Cleaning previous builds..."
rm -rf .next .vercel 2>/dev/null || true
echo "   ✅ Build directories cleaned"
echo ""

# Step 3: Run Next.js build
echo "📦 Step 3/4: Building Next.js application..."
if npm run build; then
    echo "   ✅ Next.js build successful"
else
    echo "   ❌ Next.js build failed"
    exit 1
fi
echo ""

# Step 4: Convert to Cloudflare Pages
echo "⚡️ Step 4/4: Converting to Cloudflare Pages..."
if npm run pages:build; then
    echo "   ✅ Cloudflare Pages build successful!"
    echo ""
    echo "🎉 BUILD COMPLETE! All checks passed."
    echo ""
    echo "Next steps:"
    echo "  1. Test locally: npm run preview"
    echo "  2. Deploy: npx wrangler pages deploy .vercel/output/static"
    exit 0
else
    echo "   ❌ Cloudflare Pages build failed"
    echo ""
    echo "Check the error above for details."
    exit 1
fi
