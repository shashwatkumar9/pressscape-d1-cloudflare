#!/bin/bash
# Quick fix script to get PressScape D1 running

echo "🔧 Fixing Next.js version compatibility..."
cd "/Users/shashwat/Desktop/PressScape D1"

echo "📦 Downgrading Next.js to 15.5.2..."
npm install next@15.5.2 --save --legacy-peer-deps

echo "🏗️ Building for Cloudflare Pages..."
npm run pages:build

echo "🚀 Starting preview server..."
echo "Test at: http://localhost:8788/api/health"
wrangler pages dev
