#!/bin/bash
set -e

echo "🧹 Cleaning build artifacts..."
find .next -type f -exec chmod 644 {} \; 2>/dev/null || true
find .vercel -type f -exec chmod 644 {} \; 2>/dev/null || true
rm -rf .next .vercel

echo "📦 Building for Cloudflare Pages..."
npm run pages:build

echo "✅ Build complete! Run 'npm run preview' to test locally"
