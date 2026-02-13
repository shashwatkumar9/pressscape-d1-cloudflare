#!/bin/bash
# Fix Next.js version mismatch

echo "🔧 Fixing Next.js version mismatch..."

# Stop any running dev servers
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Clean cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Reinstall correct versions
echo "📦 Reinstalling Next.js 15.5.2 with matching packages..."
npm install next@15.5.2 --save-exact --legacy-peer-deps

echo "✅ Fixed! Now you can run: npm run dev"
